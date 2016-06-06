var Core = function() {
    var that = {};
    var promise = require('../../../common/initConfig.js')();
    var ManagerFactory = require('../../../common/mode/mode.js');
    var manager;
    var $evtDom;
    var global;
    var listener = require('../../../common/util/listener.js');

    var parseDOM = function() {
    };

    var bindListener = function() {
        listener.on("system.send", function(data) {
            console.log(data);
        });
    };

    var initPlugins = function() {
        manager = ManagerFactory(global);
    };
    var temp = function() {
    };
    var init = function() {
        temp();
        parseDOM();
        bindListener();
        initPlugins();
    };

    //api接口
    var api = {
        keepDetail_url : '/chat/user/getChatDetailByCid.action'
    };
    var initConfig = function(data) {

        //FIXME 页面初始化

        //FIXME 初始化类型
        data.apiInit.ustatus = -1;
        //用户当前状态 -2 排队中； -1 机器人； 0 离线； 1 在线；
        if(data.apiInit.ustatus == 1 || data.apiInit.ustatus == -2) {
            //更新会话保持标识
            data.flags.isKeepSessions = true;
        } else if(data.apiInit.ustatus == -1) {
            //拉取会话记录
            $.ajax({
                type : "post",
                url : api.keepDetail_url,
                dataType : "json",
                data : {
                    cid : data.apiInit.cid,
                    uid : data.apiInit.uid
                },
                success : function(data) {
                    console.log(data);
                    promise.resolve();
                }
            });
        } else {
            //处理客服类型 机器人、人工、邀请模式
        }
    };
    promise.then(function(data) {
        global = data;
        initConfig(data);
        $(document.body).trigger("core.onload",[{
            data : data
        }]);
        init();
    });

    return that;
};
module.exports = Core;
