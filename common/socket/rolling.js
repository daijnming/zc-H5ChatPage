/**
 * @author Treagzhao
 */
function Rolling(puid,pu,global) {
    this.puid = puid;
    var listener = require('../util/listener.js');
    var socketType = 'human';
    var timer;
    var onSend = function(args,retry) {
        var retry = retry || 0;
        var data = args[0];
        $.ajax({
            'url' : '/chat/user/chatsend.action',
            'data' : {
                'puid' : puid,
                'cid' : data.cid,
                'uid' : data.uid,
                'content' : data.answer
            },
            'dataType' : 'json',
            'type' : "POST",
            'success' : function(ret) {
                listener.trigger("core.msgresult", {
                    'msgId' : data.dateuid,
                    'result' : 'success'
                });
            },
            'error' : function(ret) {
                if(retry >= 3) {
                    listener.trigger("core.msgresult", {
                        'msgId' : data.dateuid,
                        'result' : 'success'
                    });
                } else {
                    setTimeout(function() {
                        onSend([data],retry + 1);
                    },1000);
                }
            }
        });
    };

    var destroy = function() {
        clearInterval(timer);
    };

    var getMessage = function() {
        $.ajax({
            'url' : '/chat/user/msg.action',
            'dataType' : 'json',
            'data' : {
                'puid' : puid
            },
            'type' : "get",
            'success' : function(ret) {
                if(ret && ret.length) {
                    var arr = [];
                    for(var i = 0,
                        len = ret.length;i < len;i++) {
                        var item = JSON.parse(ret[i]);
                        arr.push(item);
                        if(item.type === 204) {
                            listener.trigger("core.sessionclose",item.status);
                            if(item.status == 2) {
                                listener.trigger("core.system", {
                                    'type' : 'system',
                                    'status' : 'kickout',
                                    'data' : {
                                        'content' : "您与客服" + item.aname + "的会话已经关闭"
                                    }
                                });
                            }
                        }
                    }
                    listener.trigger("core.onreceive", {
                        'type' : socketType,
                        'list' : arr
                    });
                }
            },
            'fail' : function() {
            }
        });
        timer = setTimeout(getMessage,1500);
    };

    var bindListener = function() {
        listener.on("sendArea.send",onSend);
    };

    var init = function() {
        bindListener();
    };
    init();
    this.destroy = destroy;
    this.start = getMessage;
}

module.exports = Rolling;
