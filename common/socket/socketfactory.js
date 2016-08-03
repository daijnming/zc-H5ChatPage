/**
 * @author Treagzhao
 */
var manager = null;
var TIME_LIMIE = 5 * 1000 * 60;
var socketFactory = function(ret, global) {
    if (!!manager)
        return manager;
    var socketError = +window.localStorage.getItem("websocketerror");
    var websocketOk = true;
    if (socketError) {
        websocketOk = (+new Date() - socketError) > TIME_LIMIE;
    }
    var WebSocket = require('../socket/websocket.js');
    var Rolling = require('../socket/rolling.js');
    if (window.WebSocket && websocketOk) {
        manager = new WebSocket(ret.puid, ret['wslink.default'], global);
    } else {
        manager = new Rolling(ret.puid, ret['wslink.default'], global);
    }
    return manager;
};
module.exports = socketFactory;
