/**
 * @author Treagzhao
 */
function transfer(global,promise) {
    var Promise = require('../util/promise.js');
    var promise = promise || new Promise();
    if(global.apiConfig.groupflag === 0) {
        setTimeout(function() {
            promise.resolve(null);
        },0);
    } else if(global.urlParams.groupId && global.urlParams.groupId.length) {
        //参数中配置了groupId
        setTimeout(function() {
            promise.resolve(groupId);
        },0);
    } else {

    }

    return promise;
}

module.exports = transfer;
