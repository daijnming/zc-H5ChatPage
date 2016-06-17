/**
 * @author Treagzhao
 */
function ZcWebSocket(puid,url) {
    this.puid = puid;
    var url = url.replace('http','ws');
    var socketType = 'human';
    var websocket;

    var bindListener = function() {
        websocket.onopen = function() {
            console.log('websocket connected');
        };
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
