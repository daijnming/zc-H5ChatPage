/**
 * @author Treagzhao
 */
function HumanOnly(global) {
    var listener = require("../util/listener.js");
    var Promise = require('../util/promise.js');
    var DateUtil = require('../util/date.js');
    var Robot = require('../socket/robot.js');
    var WebSocket = require('../socket/websocket.js');
    var Rolling = require('../socket/rolling.js');
    var transfer = require('./transfer.js');
    var initSession = require('./initsession.js');
    var socketFactory = require('../socket/socketfactory.js');
    var manager = null;

    var initHumanSession = function(value,ret,word) {
        var success = !!word;
        var face = (!!word) ? ret.aface : global.apiConfig.robotLogo;
        var name = (!!word) ? ret.aname : global.apiConfig.robotName;
        var word = word || global.apiConfig.robotHelloWord;
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
    };

    var transferConnect = function(value,promise,init) {
        var init = !!init;
        var promise = new Promise();
        transfer(global,promise).then(function() {
            transferSuccess(null,null,init);
        },transferFail);
        return promise;

    };

    var transferFail = function() {
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
        setTimeout(function() {
            listener.trigger("core.initsession",value);
            listener.trigger("core.sessionclose",-1);
        },0);
    };

    var queueWait = function(ret,init,value) {
        var str = "排队中，您在队伍中的第" + ret.count + "个，请等待。";
        if(init) {
            initHumanSession(value,ret,null);
            setTimeout(function() {
                ret.content = str;
                listener.trigger("core.system", {
                    'type' : 'system',
                    'status' : 'queue',
                    'data' : ret
                });
                listener.trigger("core.sessionclose",-1);
            },1);
        } else {
            ret.content = str;
            listener.trigger("core.system", {
                'type' : 'system',
                'status' : 'queue',
                'data' : ret
            });
            listener.trigger("core.sessionclose",-1);
        }
    };
    var serverOffline = function(ret,init,value) {
        if(manager) {
            manager.destroy();
        }
        manager = new Robot(global);
        modeState.setCurrentState("robot");
        listener.trigger("core.buttonchange", {
            'type' : 'transfer',
            'action' : 'show'
        });
        if(init) {
            initHumanSession(value,ret,null);
            setTimeout(function() {
                ret.content = global.apiConfig.adminNonelineTitle;
                listener.trigger("core.system", {
                    'type' : 'system',
                    'status' : 'offline',
                    'data' : ret
                });
                listener.trigger("core.sessionclose",-1);
            },1);
        } else {
            ret.content = global.apiConfig.adminNonelineTitle;
            listener.trigger("core.system", {
                'type' : 'system',
                'status' : 'offline',
                'data' : ret
            });
            listener.trigger("core.sessionclose",-1);
        }
    };

    var blackListCallback = function(ret,init) {
        ret.content = '暂时无法转接人工客服';
        listener.trigger("core.system", {
            'type' : 'system',
            'status' : 'blacklist',
            'data' : ret
        });
        listener.trigger("core.sessionclose",-1);
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
                    'groupId' : groupId
                },
                'success' : function(ret) {
                    //[0:排队，2：无客服在线，3：黑名单，1：成功]
                    if(ret.status == 2) {
                        //暂无客服在线
                        serverOffline(ret,init,value);
                    } else if(ret.status == 0) {
                        //排队
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

    var parseDOM = function() {
    };

    var bindListener = function() {
    };

    var initPlugins = function() {
        var status = global.apiInit.ustatus;
        if(status == 0 || status == 1 || status == -2) {
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

module.exports = HumanOnly;
