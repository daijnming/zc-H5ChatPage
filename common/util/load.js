/**
 * @author Treagzhao
 */
var Promise = require('./promise.js');
var that = {};
var cache = {};
var load = function(url,promise) {
    var promise = promise || new Promise();
    if(!cache[url]) {
        var promise = Promise.when(function() {
            $.ajax({
                'url' : url,
                'dataType' : 'text',
                'type' : 'get'
            }).success(function(ret) {
                promise.resolve(ret);
                cache[url] = ret;
            }).fail(function(ret) {
                promise.reject(ret);
            });
            return promise;
        });
        return promise;
    } else {
        return Promise.when(function() {
            var data = cache[url];
            var promise = new Promise();
            setTimeout(function() {
                promise.resolve(data);
            },0);
            return promise;
        });
    }

};

that.load = load;
var getInstance = function() {
    return that;
};

module.exports = getInstance;
