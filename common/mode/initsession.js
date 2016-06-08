//会话判断
var initSessions = function(list,promise,global) {
    var promise = promise || new Promise();
    //拉取会话记录
    $.ajax({
        type : "post",
        url : '/chat/user/getChatDetailByCid.action',
        dataType : "json",
        data : {
            cid : global.apiInit.cid,
            uid : global.apiInit.uid
        },
        success : function(data) {
            promise.resolve(data);
        }
    });

    return promise;
};

module.exports = initSessions;
