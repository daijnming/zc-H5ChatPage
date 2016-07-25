/**
 * @author Treagzhao
 */
var RobotFirst = function(global) {
    var listener = require("../util/listener.js");
    var Promise = require('../util/promise.js');
    var DateUtil = require('../util/date.js');
    var Robot = require('../socket/robot.js');
    var modeState = require('./currentState.js');
    var WebSocket = require('../socket/websocket.js');
    var Rolling = require('../socket/rolling.js');
    var transfer = require('./transfer.js');
    var initSession = require('./initsession.js');
    var leaveMessageStr = global.apiConfig.leaveMsg;
    var socketFactory = require('../socket/socketfactory.js');
    var _self = this;
    var manager;
    var queueing = false;
    var serverOffline = function(ret,init,value) {
        if(manager) {
            manager.destroy();
        }
        ret.content = '暂无人工客服在线' + ' ' + leaveMessageStr;
        listener.trigger("core.buttonchange", {
            'type' : 'transfer',
            'action' : 'hide',
            'data' : ret
        });
        if(init) {
            setTimeout(function() {
                listener.trigger("core.sessionclose",-1);
            },1);
        } else {
            listener.trigger("core.sessionclose",-1);
        }
    };

    var initHumanSession = function(value,ret,word) {
        var success = !!word;
        var face = (!!word) ? ret.aface : global.apiConfig.robotLogo;
        var name = (!!word) ? ret.aname : global.apiConfig.robotName;
        var word = word || global.apiConfig.robotHelloWord;
        var curStatus = global.apiInit.ustatus == -2 ? 1 : 0;
        //-2为排队中
        if(!value) {
            value = [];
        }
        var now = new Date();
        var obj = {
            "date" : DateUtil.formatDate(now),
            "content" : [{
                // 'senderType' : (!!word) ? 2 : 1,
                'senderType' : curStatus ? 1 : (!!word) ? 2 : 1,
                't' : +now,
                'msg' : word,
                'ts' : DateUtil.formatDate(now,true),
                'senderFace' : face,
                'senderName' : name
            }]
        };
        value.push(obj);
        setTimeout(function() {
            listener.trigger("core.initsession",value);
        },0);
    };
    var blackListCallback = function(ret,init) {
        ret.content = '暂时无法转接人工客服' + ' ' + leaveMessageStr;
        ret.aname = '未接入';
        listener.trigger("core.system", {
            'type' : 'system',
            'status' : 'blacklist',
            'data' : ret
        });
        listener.trigger("core.sessionclose",-1);
    };
    var queueWait = function(ret,init,value) {
        var str = "排队中，您在队伍中的第" + ret.count + "个，";
        queueing = true;
        if(manager) {
            manager.destroy();
        }
        manager = socketFactory(ret,global);
        manager.start();
        if(init) {
            // initHumanSession(value,ret,null);
            setTimeout(function() {
                ret.content = str + " " + leaveMessageStr;
                ret.aname = '排队中';
                listener.trigger("core.system", {
                    'type' : 'system',
                    'status' : 'queue',
                    'data' : ret
                });
                listener.trigger("core.sessionclose",-2);
            },1);
        } else {
            ret.content = str + " " + leaveMessageStr;
            ret.aname = '排队中';
            listener.trigger("core.system", {
                'type' : 'system',
                'status' : 'queue',
                'data' : ret
            });
            listener.trigger("core.sessionclose",-2);
        }
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

    var transferFail = function() {
        if(false) {
            var value = [];
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
            manager = new Robot(global);
            modeState.setCurrentState("robot");
        }
        setTimeout(function() {
            listener.trigger("core.sessionclose",-1);
        },0);
    };
    var transferSuccess = function(groupId,promise,init) {
        var init = !!init;
        initSession(global,promise).then(function(value,promise) {
            $.ajax({
                'url' : '/chat/user/chatconnect.action',
                'type' : 'post',
                'dataType' : 'json',
                'data' : {
                    'sysNum' : global.sysNum,
                    'uid' : global.apiInit.uid,
                    'way' : 1,
                    'current' : queueing,
                    'groupId' : groupId
                },
                'success' : function(ret) {
                    //[0:排队，2：无客服在线，3：黑名单，1：成功]
                    if(ret.status == 2) {
                        //暂无客服在线
                        serverOffline(ret,init,value);
                    } else if(ret.status == 0) {
                        //排队
                        // console.log(ret,0);
                        global.urlParams.groupId = groupId;
                        queueWait(ret,init,value);
                    } else if(ret.status == 1) {
                        if(init) {
                            initHumanSession(value,ret,global.apiConfig.adminHelloWord);
                        } else {
                            listener.trigger("core.system", {
                                'type' : 'system',
                                'status' : "transfer",
                                'data' : {
                                    'content' : "您好，客服" + ret.aname + "接受了您的请求"
                                }
                            });
                            ret.content = global.apiConfig.adminHelloWord;
                            listener.trigger("core.system", {
                                'type' : 'human',
                                'status' : "transfer",
                                'data' : ret
                            });
                        }
                        if(manager) {
                            manager.destroy();
                        }
                        manager = socketFactory(ret,global);
                        modeState.setCurrentState("human");
                        manager.start();
                        listener.trigger("core.buttonchange", {
                            'type' : 'transfer',
                            'action' : 'hide'
                        });
                    } else if(ret.status == 3) {
                        blackListCallback(ret,init);
                    }
                },
                'fail' : function() {
                }
            });
        });

    };

    var transferConnect = function(value,promise,init) {
        var init = !!init;
        var promise = new Promise();
        transfer(global,promise,queueing).then(function() {
            transferSuccess(null,null,init);
        },transferFail);
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
        var status = global.apiInit.ustatus;
        //首先发送机器人欢迎语
        if(status == 0) {
            setTimeout(function() {
                listener.trigger("core.buttonchange", {
                    'type' : 'transfer',
                    'action' : 'hide'
                });
            },5);
            manager = new Robot(global);
            modeState.setCurrentState("robot");
            getWelcome();
        } else if(status == -1) {
            setTimeout(function() {
                listener.trigger("core.buttonchange", {
                    'type' : 'transfer',
                    'action' : 'hide'
                });
            },5);
            manager = new Robot(global);
            modeState.setCurrentState("robot");
            initSession(global).then(initRobotSession);
        } else {
            transferConnect(null,null,true);
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
