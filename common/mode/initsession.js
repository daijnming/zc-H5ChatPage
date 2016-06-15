//会话判断
var initSessions = function(global,promise) {
    var Promise = require('../util/promise.js');
    var promise = promise || new Promise();
    console.log(global.apiInit.ustatus);
    //拉取会话记录
    if(global.apiInit.ustatus == 0) {
        setTimeout(function() {
            promise.resolve([]);
        },0);
    } else {
        $.ajax({
            type : "post",
            url : '/chat/user/getChatDetailByCid.action',
            dataType : "json",
            data : {
                cid : global.apiInit.cid,
                uid : global.apiInit.uid
            },
            success : function(data) {
                console.log('data',data);
                promise.resolve(data);
            }
        });
    }

    return promise;
};

module.exports = initSessions;
