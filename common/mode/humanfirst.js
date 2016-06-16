/**
 * @author Treagzhao
 */
var HumanFirst = function(global) {
    var listener = require("../util/listener.js");
    var Promise = require('../util/promise.js');
    var DateUtil = require('../util/date.js');
    var Robot = require('../socket/robot.js');
    var WebSocket = require('../socket/websocket.js');
    var Rolling = require('../socket/rolling.js');
    var transfer = require('./transfer.js');
    var initSession = require('./initsession.js');
    var $transferBtn;
    var manager;

    var initHumanSession = function(value,ret,word) {
        console.log(word);
        if(!value) {
            value = [];
        }
        var now = new Date();
        var obj = {
            "date" : DateUtil.formatDate(now),
            "content" : [{
                'senderType' : 2,
                't' : +now,
                'msg' : word,
                'ts' : DateUtil.formatDate(now,true),
                'senderFace' : ret.aface,
                'senderName' : ret.aname
            }]
        };
        value.push(obj);
        setTimeout(function() {
            listener.trigger("core.initsession",value);
        },0);
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
        if(manager) {
            manager.destroy();
        }
        manager = new Robot(global);
        setTimeout(function() {
            listener.trigger("core.initsession",value);
        },0);
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
        setTimeout(function() {
            listener.trigger("core.initsession",value);
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
                    'groupId' : groupId
                },
                'success' : function(ret) {
                    //[0:排队，2：无客服在线，3：黑名单，1：成功]
                    if(ret.status == 2) {
                        listener.trigger("core.system",[global.apiConfig.adminNonelineTitle]);
                        //暂无客服在线
                        if(manager) {
                            manager.destroy();
                        }
                        manager = new Robot(global);
                        $transferBtn.show();
                        console.log('暂无客服在线');
                        if(init) {
                            // initHumanSession(value,ret,global.apiConfig.adminNonelineTitle);
                        } else {
                            ret.content = global.apiConfig.adminNonelineTitle;
                            listener.trigger("core.system", {
                                'type' : 'system',
                                'data' : ret
                            });
                        }
                    } else if(ret.status == 0) {
                        //排队
                        var str = "排队中，您在队伍中的第" + ret.count + "个，请等待。";
                        console.log('排队');
                        if(init) {
                            initHumanSession(value,ret,str);
                        } else {
                            ret.content = str;
                            listener.trigger("core.system", {
                                'type' : 'system',
                                'data' : ret
                            });
                        }
                        if(manager) {
                            manager.destroy();
                        }
                        manager = new Robot(global);
                    } else if(ret.status == 1) {
                        console.log('成功');
                        if(init) {
                            initHumanSession(value,ret,global.apiConfig.adminHelloWord);
                        } else {
                            ret.content = global.apiConfig.adminHelloWord;
                            listener.trigger("core.system", {
                                'type' : 'human',
                                'data' : ret
                            });
                        }
                        if(manager) {
                            manager.destroy();
                        }
                        if(WebSocket && false) {
                            manager = new WebSocket(ret.puid);
                        } else {
                            manager = new Rolling(ret.puid);
                        }
                        manager.start();
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
        transfer(global,promise).then(function() {
            transferSuccess(null,null,init);
        },transferFail);
        return promise;

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
                'msg' : global.apiConfig.adminHelloWord,
                'ts' : DateUtil.formatDate(now,true)
            }]
        };
        setTimeout(function() {
            promise.resolve(value);
        },0);
        return promise;
    };

    var parseDOM = function() {
        $transferBtn = $(".temp_test");
    };

    var bindListener = function() {
        listener.on("sendArea.artificial",transferConnect);
    };

    var initPlugins = function() {
        var status = global.apiInit.ustatus;
        console.log(status);
        if(status == 0 || status == 1 || status == -2) {
            transferConnect(null,null,true);
        } else if(status == -1) {
            initSession(global).then(initRobotSession);
        }
    };

    var init = function() {
        parseDOM();
        bindListener();
        initPlugins();
    };

    init();

    this.getWelcome = function() {
    };

};

module.exports = HumanFirst;
