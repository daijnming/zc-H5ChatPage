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

    var initHumanSession = function(word,ret) {
        initSession(global).then(function(value,promise) {
            console.log(value);
        });

    };
    /**
     *
     * @param {Object} init 是通过事件点击触发，还是自动触发
     */
    var transferBtnClickHandler = function(evt,init) {
        var init = !!init;
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
                        if(init) {
                            initHumanSession(global.apiConfig.adminNonelineTitle,ret);
                        } else {
                            ret.content = global.apiConfig.adminNonelineTitle;
                            listener.trigger("core.system", {
                                'type' : 'system',
                                'data' : ret
                            });
                        }
                        //暂无客服在线
                        console.log('暂无客服在线');
                    } else if(ret.status == 0) {
                        //排队
                        var str = "排队中，您在队伍中的第" + ret.count + "个，请等待。";
                        console.log('排队');
                        if(init) {
                            initHumanSession(str,ret);
                        } else {
                            ret.content = str;
                            listener.trigger("core.system", {
                                'type' : 'system',
                                'data' : ret
                            });
                        }
                    } else if(ret.status == 1) {
                        if(manager) {
                            manager.destroy();
                        }
                        console.log('成功');
                        manager = socketFactory(ret);
                        manager.start();
                        console.log(init,manager);
                        if(init) {
                            initHumanSession(global.apiConfig.adminHelloWord,ret);
                        } else {
                            ret.content = global.apiConfig.adminHelloWord;
                            listener.trigger("core.system", {
                                'type' : 'human',
                                'data' : ret
                            });
                        }
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
            console.log(value);
            listener.trigger("core.initsession",value);
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
                transferBtnClickHandler(null,true);
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
