// @title Form Validation Magic
// @usage two ways :
//    var aForm = document.querySelector('form')
//    veriform.group( veriform.collect(  aForm ) )
//    veriform(aForm).collect().group().validate(conf);
// @dependencies underscore.js + _.plugn.js

(function(scope){

  // requires HTMLFormElement
  function veriform(aForm){
    if ( !(this instanceof veriform) ) {
      return new veriform(aForm);
    }
    this._val = aForm;
    this._form = aForm;
    this.vResult = { items: {}, fails:0 };
  }

  var splitter = '__';

  function dumpField(el) {
    var fName = el.getAttribute('name'),
      fType = el.getAttribute('type');
    if (!fName) { return; }

    var complicated = _.contains(['radio', 'checkbox'],  fType);
    return {
      type  : fType,
      name  : fName,
      value : (!complicated || el.checked? el.value : null)
    };
  }

  var API = {
    isSelf: function(){
      return (this instanceof veriform);
    },
    ret: function(val) {
      if (!this.isSelf()) {
        return val;
      }

      this._val = val;
      return this;
    },

    // carefully collects fields data of a form passed in 
    collect: function(aForm) {
      if (this.isSelf()) {
        aForm = this._val;
      }

      if ( !(aForm instanceof HTMLFormElement) ) 
        throw new Error('aForm is not an HTMLFormElement');

      var formData = _.chain(aForm.elements)
        .map(dumpField)
        .filter(_.identity) // remove nameless fields 
        .reduce(function(memo, item, index, arr){
          if ('checkbox' === item.type) {
            if ( !(item.name in memo) || !(Array.isArray(memo[item.name])) )
              memo[item.name] = [];
            if (item.value)
              memo[item.name].push(item.value);
          } else if ('radio' === item.type) { 
            memo[item.name] = (item.name in memo && !item.value)? memo[item.name] : item.value; 
          } else {
            memo[item.name] = item.value;
          }     
          return memo; 
        }, {})
        .value(); 

      return this.ret(formData);
    },

    // group collected data  
    group: function( formData ) {
      if (this.isSelf()) {
        formData =  this._val;
      }

      var fieldSet = {};

      _.each(formData, function(item, key, list){
        var couple = key.split(splitter);

        if ( 1 < couple.length  ) {
          if ( !(_.has(fieldSet, couple[0])) ) {
            fieldSet[couple[0]] = {};
          }
          fieldSet[couple[0]] [key] = item;
        } else {
          fieldSet[key] = item;
        }

      });

      return this.ret(fieldSet);

    },

    validate: function( fGroups, conf ) {
      if (this.isSelf()){
        var conf = fGroups;
        var fGroups = this._val;
      }

      function typer (g, k){
        return ('object' == typeof g) && (null !== g);
      }

      var 
        self = this,
        mFields = _.filterHash(fGroups, typer),
        sFields = _.rejectHash(fGroups, typer);

      self.conf = conf || {};
      self.vResult = { items: {}, fails:0 };

      // simple fields list validation
      var svItems = self.checkList( sFields );
      _.each(svItems, function(vItem){
        self.markField(vItem);
        self.markGroup(vItem);
      }); 

      // multi-fields validation
      _.each( mFields, function(fset, fabout){
        var mvItems = self.checkList( fset );
        var ok = _.every(mvItems, function(mvItem){ return mvItem.resolved; });
        _.each(mvItems, function(vItem){
          self.markField(vItem);
        })
        self.markGroup({ name: fabout, resolved: ok, rejected: !ok });
      });

      return self.ret(self.vResult);

    },

    // 
    // non-chainable methods
    //

    checkList: function( vFields ) {
      var self = this;
      var vList = {};
      _.each( vFields, function(fval, fkey){
        var vConf = _.getNested(fkey, null, self.conf);
        var vItem = new validator.Field(fkey, fval, vConf);
        if (vItem) {
          vItem.check();
          vList[fkey] = vItem;
        }
      });

      return vList;
    },

    // get current form only
    getForm: function(){
      var f = this._form || _.getNested('conf.form', null, this); 
      return (f instanceof HTMLFormElement)? f : null;
    },

    // make sure we use selector inside current form only if possible
    query: function(q){
      var w = $(this.getForm());
      return w.length? w.find(q) : $(q);      
    },

    // toggle validation messages / indicators
    markField: function(vField) {
      var f = this.query( '[name="' + vField.name + '"]' );
      f.toggleClass('field-warn', !vField.resolved);
      // reflect casted values
      if (vField.castFunc && (null != vField.value)) {
        f.val(vField.value);
      };
    },

    // toggle validation messages / indicators
    markGroup: function(vField, message) {
      // console.log(' * markGroup() ', vField);
      function markFunc(ok) {
        this.toggleClass('warn', !ok).toggleClass('ok', !!ok);
      }

      var ok = vField.resolved,
          p = this.query('[data-about="' + vField.name + '"]'),
          mFunc = _.getNested('conf.markFunc', markFunc, this);
      mFunc.call(p, ok);
      // console.log(' * markGroup() #', vField.name, ' mFunc: ', mFunc.toString() );

      if (message) {
        p.find('.warn-reason').text(message);
      }

      this.vResult.items[ vField.name ] = vField;
      if (vField.rejected) {
        this.vResult.fails++;
      }
    }

  };

  var _chaining = {
    val: function(){
      return this._val;
    }
  };

  var proto = _.extend(_chaining, API);

  // expose class methods
  _.extend(veriform.prototype, proto);

  // expose static methods
  _.extend(veriform, API);

  // export into a scope
  scope.veriform = veriform;

})( this );
