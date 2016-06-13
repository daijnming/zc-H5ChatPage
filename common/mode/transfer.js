/**
 * @author Treagzhao
 */
function transfer(global,promise) {
    var Promise = require('../util/promise.js');
    var promise = promise || new Promise();

    var showGroups = function() {

    };
    var init = function() {
        if(global.apiConfig.groupflag === 0) {
            setTimeout(function() {
                promise.resolve(null);
            },0);
        } else if(global.urlParams.groupId && global.urlParams.groupId.length) {
            //参数中配置了groupId
            var groupId = global.urlParams.groupId;
            setTimeout(function() {
                promise.resolve(groupId);
            },0);
        } else {
            $.ajax({
                'url' : '/chat/user/getGroupList.action',
                'dataType' : 'json',
                'type' : 'get',
                'data' : {
                    'companyId' : global.apiInit.pid
                },
                'success' : function(ret) {
                    if(ret.length == 1) {
                        var item = ret[0];
                        promise.resolve(item.groupId);
                    } else {
                    }
                },
                'fail' : function() {
                }
            });
        }
    };

    init();

    return promise;
}

module.exports = transfer;
