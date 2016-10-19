'use strict';
/**
 * [Promise description]
 * @param {Function} fn [description]
 */
function Promise(){
  this.callbacks = [];
  this.state = Promise.STATES.PENDING;
  return this;
};

// A promise must be in one of three states:
// pending, fulfilled, or rejected.
Promise.STATES = {
  PENDING   : 'pending'  ,
	FULFILLED : 'fulfilled',
	REJECTED  : 'rejected'
};

/**
 * [transition description]
 * @param  {[type]} state [description]
 * @param  {[type]} x     [description]
 * @return {[type]}       [description]
 */
Promise.prototype.transition = function(state, x){
  // 2.1.1 When pending, a promise:
  if(this.state === Promise.STATES.PENDING){
    // 2.1.1.1 may transition to either the fulfilled or rejected state.
    switch(state){
      case Promise.STATES.FULFILLED:
        this.value = x;
        this.state = Promise.STATES.FULFILLED;
        break;
      case Promise.STATES.REJECTED:
        this.reason = x;
        this.state = Promise.STATES.REJECTED;
        break;
    }
    // 2.2.6.1 & 2.2.6.2 If/when promise is fulfilled,
    // all respective callbacks must execute in the order of their originating calls to then
    this.callbacks.forEach(function(schedulePromise2Resolution){
      schedulePromise2Resolution();
    });
  }else{
    // 2.1.2 When fulfilled, a promise:
    // 2.1.3 When rejected, a promise:
    //
    // must not transition to any other state.
    // must have a reason, which must not change.
  }
  // return this;
};

/**
 * [resolve description]
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
Promise.prototype.resolve = function(value){
  return this.transition(Promise.STATES.FULFILLED, value);
};

/**
 * [catch description]
 * @return {[type]} [description]
 */
Promise.prototype.reject = function(reason){
  return this.transition(Promise.STATES.REJECTED, reason);
};

/**
 * [then description]
 * @param  {[type]} onFulfilled [description]
 * @param  {[type]} onRejected  [description]
 * @return {[type]}             [description]
 */
Promise.prototype.then = function(onFulfilled, onRejected){
  var promise1 = this;
  var promise2 = new Promise();
  var runAsync = setTimeout;
  /**
   * 2.3 The Promise Resolution Procedure
   * @param  {[type]} promise [description]
   * @param  {[type]} x       [description]
   * @return {[type]}         [description]
   */
  function resolutionProcedure(promise, x){
    // 2.3.1 If promise and x refer to the same object, reject promise with a TypeError as the reason.
    if(promise === x){
      promise.reject(new TypeError('Spec 2.3.1, promise and x should not be the same object'));
    }
    // 2.3.3 Otherwise, if x is an object or function,
    if((x !== null) && ( typeof x === 'object' || typeof x === 'function')){
      // 2.3.3.1 Let then be x.then.
      var then = x.then;
      // 2.3.3.3 If then is a function, call it with x as this
      if(typeof then === 'function'){
        // 2.3.3.3.4.1
        var thenCalledOrThrow = false;
        try{
          then.call(x,
          // first argument resolvePromise
          function resolvePromise(y){
            // 2.3.3.3.1 If/when resolvePromise is called with a value y,
            // run [[Resolve]](promise, y).
            if(!thenCalledOrThrow){
              thenCalledOrThrow = true;
              resolutionProcedure(promise, y);
            }
          },
          // and second argument rejectPromise
          function rejectPromise(r){
            // 2.3.3.3.2 If/when rejectPromise is called with a reason r,
            // reject promise with r.
            if(!thenCalledOrThrow){
              thenCalledOrThrow = true;
              promise.reject(r);
            }
          });
        }catch(e){
          // 2.3.3.3.4.1 If resolvePromise or rejectPromise have been called, ignore it.
          if(!thenCalledOrThrow){
            thenCalledOrThrow = true;
            // 2.3.3.3.4.2 & 2.3.3.2 If retrieving the property x.then results in a thrown exception e,
            // reject promise with e as the reason.
            promise.reject(e);
          }
        }
      }else{
        promise.resolve(x);
      }
    }else{
      // 2.3.4 If x is not an object or function, fulfill promise with x.
      promise.resolve(x);
    }
  }
  function schedulePromise2Resolution(){
    runAsync(function(){
      try{
        // 2.2.2 If onFulfilled is a function:
        if(typeof onFulfilled === 'function'){
          var x = onFulfilled.apply(undefined, promise1.value);
          // 2.2.7.1 If either onFulfilled or onRejected returns a value x,
          // run the Promise Resolution Procedure [[Resolve]](promise2, x).
          if(x !== undefined) resolutionProcedure(promise2, x);
        }else{
          // 2.2.7.3 If onFulfilled is not a function and promise1 is fulfilled,
          //         promise2 must be fulfilled with the same value as promise1.
          if(promise1.state === Promise.STATES.FULFILLED)
            promise2.resolve(promise1.value);
        }
        // 2.2.3 If onRejected is a function,
        if(typeof onRejected === 'function'){
          var x = onRejected.apply(undefined, promise1.reason);
          // 2.2.7.1 If either onFulfilled or onRejected returns a value x,
          // run the Promise Resolution Procedure [[Resolve]](promise2, x).
          if(x !== undefined) resolutionProcedure(promise2, x);
        }else{
          // 2.2.7.4 If onRejected is not a function and promise1 is rejected,
          //        promise2 must be rejected with the same reason as promise1.
          if(promise1.state === Promise.STATES.REJECTED)
            promise2.reject(promise1.reason);
        }
      }catch(e){
        // 2.2.7.2 If either onFulfilled or onRejected throws an exception e,
        // promise2 must be rejected with e as the reason.
        promise2.reject(e);
      }
    });
  }
  if(this.state === Promise.STATES.PENDING){
    this.callbacks.push(schedulePromise2Resolution);
  }else{
    schedulePromise2Resolution();
  }
  return promise2;
};

/**
 * [resolve description]
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
Promise.resolve = function(value){
  var promise = new Promise();
  promise.state = Promise.STATES.FULFILLED;
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
  promise.state = Promise.STATES.REJECTED;
	promise.reason = reason;
  return promise;
};

module.exports = Promise;
