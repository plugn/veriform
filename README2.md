
Veriform
========

Veriform is a small and flexible HTML Form data validator


Imagine, you have a HTML Form on your page. So


``` javascript
var aForm = document.querySelector('form');

// static method usage:
veriform.group( veriform.collect(  aForm ) );

// preferred usage with chaining
veriform(aForm).collect().group().validate(conf);
```

The conf variable is an object included field names as keys and two types of a content: rules and castFunc.

``` javascript
	var conf = {
		'Mail__Login' : {
			rules: function(v) {
				return (v.length && v.length > 3);
			}
		},
		
		'BDay__Day'   : {
			rules: function castBDate(v){ return restrict(v, 1, 31, ''); },
			castFunc: toNumber
		},

		'BDay__Month' : {
			rules: function nonZeroStr(v){ return '0' !== v; }
		},

		'BDay__Year'  : {
			rules: function castBYear(v){ return restrict(v, 1910, everDate.getYear(), '') },
			castFunc: toNumber
		}
	};   
```
