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
        console.log(data);
        console.log(global);
        return;
        $.ajax({
            'url' : '/chat/user/robotsend.action',
            'data' : 'type',
            'data' : {
                'requestText' : data.answer,
                '' : ''
            },
            'type' : 'post',
            'success' : function(ret) {
                console.log(ret);
            },
            'fail' : function(ret) {
                console.log(ret);
            }
        });
    };
    var bindListener = function() {
        listener.on("sendArea.send",onsend);
    };
    var init = function() {
        parseDOM();
        bindListener();
    };

    init();
};

module.exports = Robot;
