/**
 * @author Treagzhao
 */
var manager = null;
var TIME_LIMIE = 5 * 1000 * 60;
var socketFactory = function(ret, global) {
    if (!!manager)
        return manager;
    var socketError = 0;
    if (window.localStorage) {
        socketError = +window.localStorage.getItem("websocketerror");
    }
    var websocketOk = true;
    if (socketError) {
        websocketOk = (+new Date() - socketError) > TIME_LIMIE;
    }
    var WebSocket = require('../socket/websocket.js');
    var Rolling = require('../socket/rolling.js');
    var url = ret['wslink.default'];
    if (window.WebSocket && websocketOk && (url.indexOf("ws:") >= 0 || url.indexOf("wss:") >= 0)) {
        manager = new WebSocket(ret.puid, ret['wslink.default'], global);
    } else {
        manager = new Rolling(ret.puid, ret['wslink.default'], global);
    }
    return manager;
};
module.exports = socketFactory;
