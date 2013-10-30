// underscore plugins

_.mixin({
  capitalize: function(string) {
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
  },

  trim: function(val) {
    return String(val).replace(/(^\s+|\s+$)/g, ''); 
  },

  toNumber: function(v){
    var n; return (n = parseInt(/\d+/g.exec(String(v)), 10)), (isNaN(n)? 0 : n);
  },

  restrict: function(v, min, max, def) {
    var num = _.toNumber(v);
    return (num < min || num > max)? def : num;
  },  

  // results hash-items {key:value} 
  filterHash: function(obj, iterator, context) {
    var results = {};
    if (obj == null) return results;
    _.each(obj, function(value, index, list) {
      // var hVal = {}; hVal[index] = value;
      if (iterator.call(context, value, index, list)) results[index] = value;
    });
    return results;
  },
  rejectHash:  function(obj, iterator, context) {
    return _.filterHash(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  },

  getNested: function(path, def, root){
    var key, val = !!root? root : this, arr = String(path).split('.');
    while ((key = arr.shift()) && 'object' == typeof val && val) {
      val = 'undefined' == typeof val[key]? ('undefined' == typeof def? false : def) : val[key];
    }
    return val;  
  }  

});
