
/**
 * [Promise description]
 * @param {Function} fn [description]
 */
function Promise(fn){
  
  // if (!(this instanceof Promise))
  //   throw new TypeError('Not enough arguments to Promise.');
  // if (!fn || typeof fn !== 'function')
  //   throw new TypeError('Argument 1 of Promise.constructor is not an object.');

  // A promise must be in one of three states: pending, fulfilled, or rejected.
  this.state = Promise.STATE.PENDING;
  this.handlers = [];
  return this;
};

Promise.STATE = {
  PENDING   : 'pending'  ,
	FULFILLED : 'fulfilled',
	REJECTED  : 'rejected'
};

/**
 * [then description]
 * @param  {[type]} onFulfilled [description]
 * @param  {[type]} onRejected  [description]
 * @return {[type]}             [description]
 */
Promise.prototype.then = function(onFulfilled, onRejected){
  var promise = new Promise();
  switch(this.state){
    case Promise.STATE.PENDING:
      this.handlers.push({
        resolve: onFulfilled,
        reject : onRejected
      });
      break;
    case Promise.STATE.FULFILLED:
      if(typeof onFulfilled == 'function'){
        try{
          var x = onFulfilled.apply(undefined, this.value);
        }catch(e){
          promise.reason = e;
          promise.state = Promise.STATE.REJECTED;
        }
      }else{
        // 2.2.7.3 If onFulfilled is not a function and promise1 is fulfilled,
        //         promise2 must be fulfilled with the same value as promise1.
        promise.state = this.state;
        promise.value = this.value;
      }
      break;
    case Promise.STATE.REJECTED:
      if(typeof onRejected == 'function'){
        try{
          var x = onRejected.apply(undefined, this.reason);
        }catch(e){
          promise.reason = e;
          promise.state = Promise.STATE.REJECTED;
        }
      }else{
        // 2.2.7.4 If onRejected is not a function and promise1 is rejected,
        //        promise2 must be rejected with the same reason as promise1.
        promise.state = this.state;
        promise.reason = this.reason;
      }
      break;
  }
  return promise;
};

/**
 * [catch description]
 * @return {[type]} [description]
 */
Promise.prototype.catch = function(){
  
};

/**
 * [resolve description]
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
Promise.resolve = function(value){
  var promise = new Promise();
  promise.state = Promise.STATE.FULFILLED;
	promise.value = value;
  return promise;
};

/**
 * [reject description]
 * @param  {[type]} reason [description]
 * @return {[type]}        [description]
 */
Promise.reject = function(reason){
  var promise = new Promise();
  promise.state = Promise.STATE.REJECTED;
	promise.reason = reason;
  return promise;
};

Promise.fulfill = function(value){
  var promise = new Promise();
  promise.state = Promise.STATE.FULFILLED;
	promise.value = value;
  return promise;
};

/**
 * [all description]
 * @return {[type]} [description]
 */
Promise.all = function(){
  
};


module.exports = Promise;
