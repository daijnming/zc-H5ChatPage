/**
 * @author Treagzhao
 */
var RobotFirst = function(global) {
    var listener = require("../util/listener.js");
    var Promise = require('../util/promise.js');
    var DateUtil = require('../util/date.js');
    var Robot = require('../socket/robot.js');
    var setCurrentState = require('./currentState.js');
    var WebSocket = require('../socket/websocket.js');
    var Rolling = require('../socket/rolling.js');
    var transfer = require('./transfer.js');
    var initSession = require('./initsession.js');
    var socketFactory = require('../socket/socketfactory.js');
    var leaveMessageStr = global.apiConfig.leaveMsg;
    var _self = this;
    var manager,
        tempManager;
    var queueing = false;
    var outerPromise = new Promise();
    var parseDOM = function() {
        $transferBtn = $(".temp_test");
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
        var face = (!!word) ? ret.aface : global.apiConfig.robotLogo;
        var name = (!!word) ? ret.aname : global.apiConfig.robotName;
        var word = word || global.apiConfig.robotHelloWord;
        initSession(global).then(function(value,promise) {
            if(!value) {
                value = [];
            }
            var now = new Date();
            var obj = {
                "date" : DateUtil.formatDate(now),
                "content" : [{
                    'senderType' : (!!word) ? 2 : 1,
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
            return promise;
        });

    };
    /**
     * 客服已离线
     */
    var serverOffline = function(ret,init) {
        if(init) {
            initHumanSession(null,ret);
            setTimeout(function() {
                ret.content = global.apiConfig.adminNonelineTitle + leaveMessageStr;
                listener.trigger("core.system", {
                    'type' : 'system',
                    'status' : 'offline',
                    'data' : ret
                });
            },1);
        } else {
            ret.content = global.apiConfig.adminNonelineTitle + leaveMessageStr;
            listener.trigger("core.system", {
                'type' : 'system',
                'status' : 'offline',
                'data' : ret
            });
        }
        setCurrentState.setCurrentState('robot');
    };

    var queueWait = function(ret,init) {
        var str = "排队中，您在队伍中的第" + ret.count + "个，";
        queueing = true;
        if(!tempManager) {
            tempManager = socketFactory(ret,global);
            tempManager.start();
        }
        if(manager) {
            manager.destroy();
        }

        manager = new Robot(global);
        if(init) {
            initHumanSession(null,ret);
            setTimeout(function() {
                ret.content = str + " " + leaveMessageStr;
                listener.trigger("core.system", {
                    'type' : 'system',
                    'status' : "queue",
                    'data' : ret
                });
            },1);
        } else {
            ret.content = str + " " + leaveMessageStr;
            listener.trigger("core.system", {
                'type' : 'system',
                'status' : "queue",
                'data' : ret
            });
        }
        setCurrentState.setCurrentState("robot");
    };

    var transferHumanSucess = function(ret,init) {
        if(manager) {
            manager.destroy();
        }
        queueing = false;
        manager = socketFactory(ret,global);
        manager.start();
        setCurrentState.setCurrentState('human');
        if(init) {
            initHumanSession(global.apiConfig.adminHelloWord,ret);
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
                'data' : ret
            });
        }
        listener.trigger("core.buttonchange", {
            'type' : 'transfer',
            'action' : 'hide'
        });
    };

    var blackListCallback = function(ret,init) {
        ret.content = '暂时无法转接人工客服' + ' ' + leaveMessageStr;
        listener.trigger("core.system", {
            'type' : 'system',
            'status' : 'blacklist',
            'data' : ret
        });
        if(init) {
            initRobotSession();
        }
    };
    /**
     *
     * @param {Object} init 是通过事件点击触发，还是自动触发
     */
    var transferBtnClickHandler = function(evt,init) {
        var init = !!init;
        transfer(global,null,queueing).then(function(groupId,promise) {
            $.ajax({
                'url' : '/chat/user/chatconnect.action',
                'type' : 'post',
                'dataType' : 'json',
                'data' : {
                    'sysNum' : global.sysNum,
                    'uid' : global.apiInit.uid,
                    'way' : 1,
                    'current' : queueing,
                    'groupId' : groupId || ''
                },
                'success' : function(ret) {
                    //[0:排队，2：无客服在线，3：黑名单，1：成功]
                    if(ret.status == 2) {
                        serverOffline(ret,init);
                        //暂无客服在线
                    } else if(ret.status == 0) {
                        //排队
                        global.urlParams.groupId = groupId;
                        queueWait(ret,init);
                    } else if(ret.status == 1) {
                        transferHumanSucess(ret,init);
                    } else if(ret.status == 3) {
                        blackListCallback(ret,init);
                    }
                },
                'fail' : function() {
                }
            });

        }, function() {

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
            listener.trigger("core.initsession",value);
        },0);
        manager = new Robot(global);
        setCurrentState.setCurrentState('robot');
    };
    var onReceive = function(data) {
        var list = data.list || [];
        for(var i = 0,
            len = list.length;i < len;i++) {
            var item = list[i];
            var ret = item;
            if(item.type === 200) {
                if(manager) {
                    manager.destroy();
                }
                manager = tempManager;
                tempManager = null;
                setCurrentState.setCurrentState('human');
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
                    'data' : ret
                });
                listener.trigger("core.buttonchange", {
                    'type' : 'transfer',
                    'action' : 'hide'
                });
                break;
            }
        }
    };
    var bindListener = function() {
        listener.on("sendArea.artificial",transferBtnClickHandler);
        listener.on("core.onreceive",onReceive);
    };

    var initPlugins = function() {
        listener.trigger("core.buttonchange", {
            'type' : 'transfer',
            'action' : 'show'
        });
        var status = global.apiInit.ustatus;
        //首先发送机器人欢迎语
        if(status == 0) {
            manager = new Robot(global);
            getWelcome();
            setCurrentState.setCurrentState('robot');
        } else {
            queueing = true;
            if(status == 1 || status == -2) {
                transferBtnClickHandler(null,true);
            } else if(status == -1) {
                initSession(global).then(initRobotSession);
            }
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
