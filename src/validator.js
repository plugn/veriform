// @title        validator
// @description  form fields validator brought by formDump component
// @dependency   underscore.js + _.plugn.js

var validator = (function(){

  function lcType(val){
    return String(typeof val).toLowerCase();
  };

  // cast a field value to appropriate one
  function vCast(val, type){
      // if null | undefined
      if (null == val) return null;   

      switch ( lcType(val) ) {
        case 'string':
          return val.replace(/(^\s+|\s+$)/g, '');
        case 'number':
          return (0===val || !isFinite(val))? 0 : val;
        default:
          return val;  
      }
  }

  // native validation rules
  var vRules = {
    base: vCast
  }


  function Field(name, value, conf){
    conf = conf || {};
    // console.log(' * Field('+name+')', value, conf);    
    this.name = name;
    this.srcValue = value;

    // built-in value cast
    this.value = vCast(value);
    this.castFunc = ('function' == lcType(conf.castFunc) && conf.castFunc) || undefined; 
  
    this.checked = false;
    this.resolved = false;
    this.rejected = false;

    this.setRules( conf.rules );

  }

  Field.prototype._checkRules = function(rules){
    // console.log( ' _checkRules() rules', rules, '; lcType() : ', lcType(rules) );
    if (null == rules || 'object' !== lcType(rules)) {
      throw new Error('Field._checkRules() bad argument rules:' + rules);
    }
  }

  Field.prototype.setRules = function(rules){
    var rex = /^regexp:/g;
    var self = this;
    self.rules = [];


    // must be an array even if length of 1
    if ( _.contains(['string', 'function'], lcType(rules)) ) rules = [].concat(rules);

    // if array : keynames of vRules
    if (_.isEmpty(rules)) {
      self.rules.push(vRules.base);
    } else {
      self._checkRules(rules);

      _.each(rules, function(rule, key){ 

        if ('string' == lcType(rule)) {
          if (rule in vRules) {
            self.rules.push( vRules[rule] );
          } else if ('regexp' === key || rex.test(rule)) {
            try {
              var refunc = Function('str', ' return new RegExp("'+rule.replace(rex,'')+'","g").test(str); ');
              if ('function' == lcType(refunc)) self.rules.push(refunc);
            } catch (e) { ; }
          }

        } else if ('function' == lcType(rule)) {
          self.rules.push(rule);
        }

      });

    }
  }

  Field.prototype.check = function(){
    var self = this;
    // console.log('check() self: ', self);
    self._checkRules(self.rules);

    var test = {};
    self.value = self.castFunc
                   ? self.castFunc(self.value)
                   : (null != self.value? self.value : self.srcValue);

    _.each(self.rules, function(rule, name){
      test[ name ] = rule(self.value);
    });

    var pass = _.every(test, _.identity);
    self.rejected = !(self.resolved = pass);
    self.checked = true;

    return self.resolved;
  }

  // API
  return {
    Field: Field
  }


})();
