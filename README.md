Imagine


``` javascript
var aForm = document.querySelector('form');

// statis method usage:
veriform.group( veriform.collect(  aForm ) );

// preferred usage with chaining
veriform(aForm).collect().group().validate(conf);
```
