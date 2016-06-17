/**
 * @author Treagzhao
 */
var manager = null;
var socketFactory = function(ret) {
    if(!!manager)
        return manager;
    var WebSocket = require('../socket/websocket.js');
    var Rolling = require('../socket/rolling.js');
    if(window.WebSocket && false) {
        manager = new WebSocket(ret.puid,ret.pu);
    } else {
        manager = new Rolling(ret.puid,ret.pu);
    }
    return manager;
};
module.exports = socketFactory;
