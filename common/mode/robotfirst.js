/**
 * @author Treagzhao
 */
var RobotFirst = function(global) {
    var listener = require("../util/listener.js");
    var Promise = require('../util/promise.js');
    var DateUtil = require('../util/date.js');
    var Robot = require('../socket/robot.js');
    var transfer = require('./transfer.js');
    var _self = this;
    var $transferBtn;
    var manager;
    var parseDOM = function() {
        $transferBtn = $(".temp_test");
    };

    var getWelcome = function(value,promise) {
        var promise = promise || new Promise();
        if(!value) {
            value = [];
        }
        var now = new Date();
        var obj = {
            "date" : DateUtil.formatDate(now),
            "content" : [{
                'senderType' : 2,
                't' : +now,
                'msg' : global.apiConfig.robotHelloWord,
                'ts' : DateUtil.formatDate(now,true)
            }]
        };
        setTimeout(function() {
            promise.resolve(value);
        },0);
        return promise;
    };

    var transferBtnClickHandler = function() {
        transfer(global).then(function(groupId,promise) {
            $.ajax({
                'url' : '/chat/user/chatconnect.action',
                'type' : 'post',
                'dataType' : 'json',
                'data' : {
                    'sysNum' : global.sysNum,
                    'uid' : global.apiInit.uid,
                    'way' : 1,
                    'groupId' : groupId
                },
                'success' : function() {
                },
                'fail' : function() {
                }
            });
        });

    };

    var bindListener = function() {
        $transferBtn.on("click",transferBtnClickHandler);
    };

    var initPlugins = function() {
        $transferBtn.show();
        //首先发送机器人欢迎语
        manager = new Robot(global);

    };

    var init = function() {
        parseDOM();
        bindListener();
        initPlugins();
    };

    init();
    this.getWelcome = getWelcome;
};

module.exports = RobotFirst;
