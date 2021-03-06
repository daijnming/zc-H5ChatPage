var Core = function(window) {
    var promise = require('../../../common/initConfig.js')();
    var ManagerFactory = require('../../../common/mode/mode.js');
    var manager;
    var heartBeat = require('../../../common/socket/heartbeat.js');
    var $evtDom;
    var global;
    var listener = require('../../../common/util/listener.js');

    var parseDOM = function() {};

    var bindListener = function() {
        listener.on("system.send", function(data) {});
    };

    var initPlugins = function() {
        manager = ManagerFactory(global);
        // initWap = initWap(global);
    };

    //FIXME 通过initConfig初始化后再针对H5进行配置
    var init = function() {
        parseDOM();
        bindListener();
        initPlugins();
    };
    promise.then(function(data) {
        $(".white-layer").remove();
        $(document.body).trigger("core.onload", [{
            data: data
        }]);
        global = data;
        init();
        listener.trigger('core.onload', [global]);
        heartBeat(global);
    });
};
module.exports = Core;
