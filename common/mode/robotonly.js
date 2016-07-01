/**
 * @author Treagzhao
 */
var RobotFirst = function(global) {
    var listener = require("../util/listener.js");
    var Promise = require('../util/promise.js');
    var DateUtil = require('../util/date.js');
    var Robot = require('../socket/robot.js');
    var WebSocket = require('../socket/websocket.js');
    var Rolling = require('../socket/rolling.js');
    var transfer = require('./transfer.js');
    var initSession = require('./initsession.js');
    var socketFactory = require('../socket/socketfactory.js');
    var _self = this;

    var getWelcome = function(value,promise) {
        var promise = promise || new Promise();
        initSession(global,promise).then(function(value,promise) {
            if(!value) {
                value = [];
            }
            var now = new Date();
            var obj = {
                "date" : DateUtil.formatDate(now),
                "content" : [{
                    'senderType' : 1,
                    't' : +now,
                    'msg' : global.apiConfig.robotHelloWord,
                    'ts' : DateUtil.formatDate(now,true),
                    'senderFace' : global.apiConfig.robotLogo,
                    'senderName' : global.apiConfig.robotName
                }]
            };
            value.push(obj);
            setTimeout(function() {
                listener.trigger("core.initsession",value);
            },0);
            return promise;
        });
        return promise;
    };

    var initRobotSession = function(value,promise) {
        if(!value) {
            value = [];
        }
        var now = new Date();
        var obj = {
            "date" : DateUtil.formatDate(now),
            "content" : [{
                'senderType' : 1,
                't' : +now,
                'msg' : global.apiConfig.robotHelloWord,
                'ts' : DateUtil.formatDate(now,true),
                'senderFace' : global.apiConfig.robotLogo,
                'senderName' : global.apiConfig.robotName
            }]
        };
        value.push(obj);
        setTimeout(function() {
            listener.trigger("core.initsession",value);
        },0);
    };

    var parseDOM = function() {
    };

    var bindListener = function() {
    };

    var initPlugins = function() {
        alert();
        setTimeout(function() {
            listener.trigger("core.buttonchange", {
                'type' : 'transfer',
                'action' : 'hide'
            });
        },5);
        var status = global.apiInit.ustatus;
        //首先发送机器人欢迎语
        if(status == 0) {
            manager = new Robot(global);
            modeState.setCurrentState("robot");
            getWelcome();
        } else if(status == -1) {
            manager = new Robot(global);
            modeState.setCurrentState("robot");
            initSession(global).then(initRobotSession);
        }
    };

    var init = function() {
        parseDOM();
        bindListener();
        initPlugins();
    };

    init();

};

module.exports = RobotFirst;
