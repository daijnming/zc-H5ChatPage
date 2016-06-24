/**
 * @author Treagzhao
 */
function ZcWebSocket(puid,url,global) {
    this.puid = puid;
    var url = global.apiConfig.websocketUrl;
    var socketType = 'human';
    var listener = require('../util/listener.js');
    var websocket;
    var ROLE_USER = 0;

    var onSend = function(data) {
        var item;
        if(Object.prototype.toString.call(data).indexOf("Array") >= 0) {
            item = data[0];
        }
        websocket.send(JSON.stringify(item));
    };

    var onMessage = function(data) {
        console.log('onreceive',data);
    };

    var onClosed = function() {
        console.log("websocket closed");
    };
    var bindListener = function() {
        websocket.onopen = function() {
            console.log(global);
            var start = {
                "t" : ROLE_USER,
                "u" : global.apiInit.uid,
                's' : global.sysNum
            };
            websocket.send(JSON.stringify(start));
            setInterval(function() {

            },1000);
        };
        websocket.onclose = function() {
            onClosed();
        };
        websocket.onmessage = function(evt) {
            console.log(evt);
        };
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
