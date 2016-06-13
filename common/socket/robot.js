/**
 * @author Treagzhao
 */
function Robot(global) {
    var _self = this;
    var listener = require('../util/listener.js');
    var parseDOM = function() {
    };

    var createToken = function(data) {
        return data.uid + "" + data.date;
    };

    var onsend = function(args) {
        var data = args[0];
        var token = createToken(data);
        $.ajax({
            'url' : '/chat/user/robotsend.action',
            'data' : 'type',
            'data' : {
                'requestText' : data.answer,
                'question' : data.answer,
                'sysNum' : global.sysNum,
                'uid' : global.apiInit.uid,
                'cid' : global.apiInit.cid,
                'source' : global.userInfo.source,
                'questionFlag' : 0
            },
            'type' : 'post',
            'success' : function(ret) {
                listener.trigger("core.onreceive",ret);
            },
            'fail' : function(ret) {
                console.log(ret);
            }
        });
    };

    var destroy = function() {
        listener.off("sendArea.send",onsend);
    };

    var bindListener = function() {
        listener.on("sendArea.send",onsend);
    };
    var init = function() {
        parseDOM();
        bindListener();
    };

    this.destroy = destroy;

    init();
};

module.exports = Robot;
