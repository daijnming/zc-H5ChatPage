/**
 * @author Treagzhao
 */
var manager = null;
var socketFactory = function(ret, global) {
    if (!!manager)
        return manager;
    var WebSocket = require('../socket/websocket.js');
    var Rolling = require('../socket/rolling.js');
    var url = ret['wslink.default'];

    if (window.WebSocket && url.indexOf("ws:") >= 0) {
        manager = new WebSocket(ret.puid, ret['wslink.default'], global);
    } else {
        manager = new Rolling(ret.puid, ret['wslink.default'], global);
    }
    return manager;
};
module.exports = socketFactory;
