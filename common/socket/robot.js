/**
 * @author Treagzhao
 */
function Robot(global) {
    var _self = this;
    var listener = require('../util/listener.js');
    var socketType = 'robot';
    var question = false;
    var parseDOM = function() {
    };

    var createToken = function(data) {
        return data.uid + "" + data.date;
    };

    var onsend = function(args) {
        var data = args[0];
        if(data.currentStatus !== 'robot') {
            return;
        }
        var token = createToken(data);
        var content = data.answer.replace(/(^\s+|\s+$)/g,'');
        if(!/^\d+$/.test(content)) {
            question = false;
        }
        if(data.requestType == 'question') {
            question = true;
        }
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
                'questionFlag' : question ? 1 : 0
            },
            'type' : 'post',
            'success' : function(ret) {
                var item = JSON.parse(ret);
                if(item.answerType == 4) {
                    question = true;
                }
                listener.trigger("core.onreceive", {
                    'list' : [item],
                    'type' : socketType
                });
                listener.trigger("core.msgresult", {
                    'msgId' : data.dateuid,
                    'result' : 'success'
                });
            },
            'error' : function(ret) {
                listener.trigger("core.msgresult", {
                    'msgId' : data.dateuid,
                    'result' : 'fail'
                });
            }
        });
        question = false;
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
