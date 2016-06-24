/**
 * @author Treagzhao
 */
function ZcWebSocket(puid,url,global) {
    this.puid = puid;
    var url = global.apiConfig.websocketUrl;
    var socketType = 'human';
    var listener = require('../util/listener.js');
    var websocket;
    var ROLE_SERVICE = 2;

    var onSend = function(data) {
        console.log(data);
    };

    var onMessage = function(data) {
        console.log(data);
    };

    var onClosed = function() {
        console.log("websocket closed");
    }
    var bindListener = function() {
        websocket.onopen = function() {
            console.log(global);
            var start = {
                "t" : ROLE_SERVICE,
                "u" : global.apiInit.uid,
                's' : global.sysNum
            };
            console.log(JSON.stringify(start));
            setTimeout(function() {
                websocket.send(JSON.stringify(start));
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
