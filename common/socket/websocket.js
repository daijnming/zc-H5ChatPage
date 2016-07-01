/**
 * @author Treagzhao
 */
function ZcWebSocket(puid,url,global) {
    this.puid = puid;
    var url = global.apiConfig.websocketUrl;
    var socketType = 'human';
    var listener = require('../util/listener.js');
    var dateUtil = require('../util/date.js');
    var websocket;
    var TIMEOUT_DURATION = 5 * 1000;
    var ROLE_USER = 0;

    var retryList = {};

    var retry = function() {
        var now = +new Date();
        for(var el in retryList) {
            var item = retryList[el];
            if(now - item.sendTime >= TIMEOUT_DURATION) {
                delete retryList[el];
                listener.trigger("core.msgresult", {
                    'msgId' : item.dateuid,
                    'result' : 'fail'
                });
            }
        }
    };

    var onSend = function(data) {
        var item = data;
        if(Object.prototype.toString.call(data).indexOf("Array") >= 0) {
            item = data[0];
        }
        if(item.currentStatus !== 'human') {
            return;
        }
        var d = !!item.date ? new Date(item.date) : new Date();
        item.t = +d;
        console.log(dateUtil.formatDate(d,true));
        item.ts = dateUtil.formatDate(d,true);
        console.log(item);
        item.type = 103;
        item.msgId = item['dateuid'];
        item.sendTime = item.date;
        item.content = item.answer;
        item.uname = global.userInfo.uname;
        item.face = global.userInfo.face;
        retryList[item.msgId] = item;
        websocket.send(JSON.stringify(item));
    };

    var ackConfirmMessageHandler = function(data) {
        listener.trigger("core.msgresult", {
            'msgId' : data.msgId,
            'result' : 'success'
        });
        delete retryList[data.msgId];
    };

    var commonMessageHandler = function(data) {
        listener.trigger("core.onreceive", {
            'type' : socketType,
            'list' : [data]
        });
    };
    var systemMessageHandler = function(data) {
        if(data.type == 204) {
            listener.trigger("core.sessionclose",data.status);
            if(data.status == 2) {
                listener.trigger("core.system", {
                    'type' : 'system',
                    'status' : 'kickout',
                    'data' : {
                        'content' : "您与客服" + data.aname + "的会话已经关闭"
                    }
                });
            }
        }
        listener.trigger("core.onreceive", {
            'type' : socketType,
            'list' : [data]
        });
    };

    var messageConfirm = function(data) {
        $.ajax({
            'url' : '/chat/user/msg/ack.action',
            'dataType' : 'json',
            'data' : {
                'content' : JSON.stringify(arr),
                'tnk' : +new Date()
            },
            'type' : 'POST'
        }).success(function(ret) {
        }).fail(function(ret) {
        });
    };
    var onMessage = function(evt) {
        var data = JSON.parse(evt.data);
        //messageConfirm(data);
        if(data.type == 301) {
            // ackConfirmMessageHandler(data);
        } else if(data.type == 202) {
            commonMessageHandler(data);
        } else {
            systemMessageHandler(data);
        }
    };

    var onClosed = function() {
        console.log("websocket closed");
    };
    var bindListener = function() {
        websocket.onopen = function() {
            var start = {
                "t" : ROLE_USER,
                "u" : global.apiInit.uid,
                's' : global.sysNum
            };
            websocket.send(JSON.stringify(start));
            setInterval(retry,1000);
        };
        websocket.onclose = function() {
            onClosed();
        };
        websocket.onmessage = onMessage;
        listener.on("sendArea.send",onSend);
    };

    var init = function() {
        bindListener();
    };

    var destroy = function() {
    };

    var start = function() {
        websocket = new WebSocket(url);
        init();
    };

    var stop = function() {
    };

    this.destroy = destroy;
    this.start = start;
    this.stop = stop;
};

module.exports = ZcWebSocket;
