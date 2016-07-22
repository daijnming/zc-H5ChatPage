/**
 * @author Treagzhao
 */
function Rolling(puid,pu,global) {
    this.puid = puid;
    var listener = require('../util/listener.js');
    var socketType = 'human';
    var timer;
    var ROLE_USER = 0;
    var onSend = function(args,retry) {
        var retry = retry || 0;
        var data = args[0];
        if(data.currentStatus !== 'human') {
            return;
        }
        if(!data.date) {
            data.ts = +new Date();
        } else {
            data.ts = data.date;
        }
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
                        'result' : 'fail'
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

    var messageConfirm = function(list) {
        var arr = [];
        for(var i = 0,
            len = list.length;i < len;i++) {
            var item = list[i];
            var obj = {
                'type' : 300,
                'utype' : ROLE_USER,
                'cid' : item.cid,
                'uid' : item.uid,
                'msgId' : item.msgId
            };
            arr.push(obj);
        }
        if(arr.length <= 0)
            return;
        if(window.confirm("是否发送消息回执"))
            $.ajax({
                'url' : '/chat/user/msg/ack.action',
                'dataType' : 'json',
                'data' : {
                    'content' : JSON.stringify(arr),
                    'tnk' : +new Date()
                },
                'type' : 'POST',
            });
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
                        alert(ret[i]);
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
                    messageConfirm(arr);
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
