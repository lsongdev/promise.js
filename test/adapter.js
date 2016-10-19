const Promise = require('../');

module.exports.deferred = function () {
  const promise = new Promise();
  return {
    promise: promise,
    resolve: promise.resolve.bind(promise),
    reject : promise.reject.bind(promise)
  }
};
