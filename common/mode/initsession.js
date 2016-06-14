//会话判断
var initSessions = function(global,promise) {
    var promise = promise || new Promise();
    //拉取会话记录
    console.log(global.apiInit.ustatus)
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
                promise.resolve(data);
            }
        });
    }

    return promise;
};

module.exports = initSessions;
