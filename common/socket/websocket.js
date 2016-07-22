/**
 * @author Treagzhao
 */
var HearBeat = require("./heartbeat.js");
function ZcWebSocket(puid,url,global) {
    this.puid = puid;
    // url = "ws://test.sobot.com/";
    var socketType = 'human';
    var listener = require('../util/listener.js');
    var dateUtil = require('../util/date.js');
    var websocket;
    var timer;
    var connRetryTime = 0;
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
        item.ts = dateUtil.formatDate(d,true);
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
        if(data.type == 301) {
            return;
        }
        var obj = {
            'type' : 300,
            'msgId' : data.msgId,
            'utype' : ROLE_USER,
            'data' : [data]
        };
        websocket.send(JSON.stringify(obj));
    };
    var onMessage = function(evt) {
        if(evt.data === 'pong') {
            return;
        }
        var data = JSON.parse(evt.data);
        alert(evt.data);
        if(window.confirm("是否发送回执"))
            messageConfirm(data);
        if(data.type == 301) {
            ackConfirmMessageHandler(data);
        } else if(data.type == 202) {
            commonMessageHandler(data);
        } else {
            systemMessageHandler(data);
        }
    };

    var reConnect = function() {
        if(connRetryTime++ >= 3) {
            listener.trigger("core.system", {
                'type' : 'system',
                'status' : 'kickout',
                'data' : {
                    'content' : "与服务器连接中断"
                }
            });
            listener.trigger("core.sessionclose",-2);
            return;
        }
        setTimeout(function() {
            websocket = new WebSocket(url);
        },2000);
    };
    var onClosed = function() {
        alert('close');
        console.log('close');
        reConnect();
    };
    var bindListener = function() {
        websocket.onerror = function() {
            alert('error');
            console.log('error');
        };
        websocket.onopen = function() {
            alert('open');
            console.log("open");
            timer = setInterval(function() {
                websocket.send("ping");
            },5 * 1000);
            var start = {
                "t" : ROLE_USER,
                "u" : global.apiInit.uid,
                's' : global.sysNum
            };
            connRetryTime = 0;
            websocket.send(JSON.stringify(start));
            setInterval(retry,1000);
        };
        websocket.onclose = function() {
            onClosed();
            clearTimeout(timer);
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
        HearBeat();
    };

    var stop = function() {
    };

    this.destroy = destroy;
    this.start = start;
    this.stop = stop;
};

module.exports = ZcWebSocket;
