/**
 * @author Treagzhao
 */
function ZcWebSocket(puid,url,global) {
    this.puid = puid;
    var url = global.apiConfig.websocketUrl;
    var socketType = 'human';
    var listener = require('../util/listener.js');
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
        var item;
        if(Object.prototype.toString.call(data).indexOf("Array") >= 0) {
            item = data[0];
        }
        if(item.currentStatus !== 'human') {
            return;
        }
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
        console.log(data);
        listener.trigger("core.onreceive", {
            'type' : socketType,
            'list' : [data]
        });
    };

    var onMessage = function(evt) {
        var data = JSON.parse(evt.data);
        if(data.type == 301) {
            ackConfirmMessageHandler(data);
        } else if(data.type == 202) {
            commonMessageHandler(data);
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
