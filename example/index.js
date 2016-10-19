const Promise = require('../');


var p = new Promise(function(accept, reject){
  setTimeout(function(){
    accept('hello');
  }, 3000);
});


p.then(function(value){
  console.log(value);
})

p.catch(function(err){
  console.log(err);
})
