var Core = function(window) {
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
        // initWap = initWap(global);
    };
    var temp = function() {
    };
    //FIXME 通过initConfig初始化后再针对H5进行配置
    var init = function() {
        temp();
        parseDOM();
        bindListener();
        initPlugins();
    };
    promise.then(function(data) {
        $(document.body).trigger("core.onload",[{
            data : data
        }]);
        global = data;
        init();
        listener.trigger('core.onload',[global]);
    });
};
module.exports = Core;
