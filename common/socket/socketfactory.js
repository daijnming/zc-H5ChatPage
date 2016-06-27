/**
 * @author Treagzhao
 */
var manager = null;
var socketFactory = function(ret,global) {
    if(!!manager)
        return manager;
    var WebSocket = require('../socket/websocket.js');
    var Rolling = require('../socket/rolling.js');
    if(window.WebSocket && false) {
        manager = new WebSocket(ret.puid,ret.pu,global);
    } else {
        manager = new Rolling(ret.puid,ret.pu,global);
    }
    return manager;
};
module.exports = socketFactory;
