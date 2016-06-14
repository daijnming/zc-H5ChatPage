/**
 * @author Treagzhao
 */
function Rolling(puid) {
    this.puid = puid;
    var listener = require('../util/listener.js');

    var onSend = function(args) {
        var data = args[0];
        $.ajax({
            'url' : '/chat/user/chatsend.action',
            'data' : {
                'puid' : puid,
                'cid' : data.cid,
                'uid' : data.uid,
                'content' : data.answer
            },
            'dataType' : 'json',
            'type' : "get",
            'success' : function(ret) {
            }
        });
    };

    var destroy = function() {
    };

    var getMessage = function() {
        $.ajax({
            'url' : '/chat/user/msg.action',
            'dataType' : 'json',
            'data' : {
                'puid' : puid
            },
            'type' : "get",
            'success' : function(ret) {
                if(ret && ret.length) {
                    var arr = [];
                    for(var i = 0,
                        len = ret.length;i < len;i++) {
                        var item = JSON.parse(ret[i]);
                        arr.push(item);
                    }
                    listener.trigger("core.onreceive",arr);
                }
            },
            'fail' : function() {
            }
        });
        setTimeout(getMessage,1500);
    };

    var bindListener = function() {
        listener.on("sendArea.send",onSend);
    };

    var init = function() {
        bindListener();
    };
    init();
    this.destroy = destroy;
    this.start = getMessage;
}

module.exports = Rolling;
