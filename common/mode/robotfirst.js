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
    var _self = this;
    var $transferBtn;
    var manager;
    var outerPromise = new Promise();
    var parseDOM = function() {
        $transferBtn = $(".temp_test");
    };

    var socketFactory = function(ret) {
        var manager;
        if(WebSocket && false) {
            manager = new WebSocket(ret.puid);
        } else {
            manager = new Rolling(ret.puid);
        }
        return manager;
    };

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
                    'senderType' : 2,
                    't' : +now,
                    'msg' : global.apiConfig.robotHelloWord,
                    'ts' : DateUtil.formatDate(now,true)
                }]
            };
            value.push(obj);
            setTimeout(function() {
                listener.trigger("core.onreceive",value);
            },0);
            return promise;
        });
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
                'success' : function(ret) {
                    //[0:排队，2：无客服在线，3：黑名单，1：成功]
                    if(ret.status == 2) {
                        listener.trigger("core.system",[global.apiConfig.adminNonelineTitle]);
                        //暂无客服在线
                        console.log('暂无客服在线');
                    } else if(ret.status == 0) {
                        //排队
                        var str = "排队中，您在队伍中的第" + ret.count + "个，请等待。";
                        console.log('排队');
                        listener.trigger("core.system",[str]);
                    } else if(ret.status == 1) {
                        if(manager)
                            manager.destroy();
                        console.log('成功');
                        manager = socketFactory(ret);
                        manager.start();
                        listener.trigger("core.system",[global.apiConfig.adminHelloWord,ret]);
                    }
                },
                'fail' : function() {
                }
            });

        });

    };

    var initRobotSession = function(value,promise) {
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
        value.push(obj);
        setTimeout(function() {
            outerPromise.resolve(value);
        },0);
    };
    var bindListener = function() {
        $transferBtn.on("click",transferBtnClickHandler);
    };

    var initPlugins = function() {
        $transferBtn.show();
        //首先发送机器人欢迎语
        if(global.apiInit.ustatus == 0) {
            manager = new Robot(global);
            getWelcome();
        } else {
            if(global.apiInit.ustatus == 1) {
                transferBtnClickHandler();
            } else if(global.apiInit.ustatus == -1) {
                initSession(global).then(initRobotSession);
            }
            //console.log(manager);
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
