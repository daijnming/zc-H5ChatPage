var Core = function() {
    var that = {};
    var promise = require('../../../common/initConfig.js')();
    var ManagerFactory = require('../../../common/mode/mode.js');
    var manager;
    var $evtDom;
    var global;

    var parseDOM = function() {
    };

    var bindListener = function() {
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

    promise.then(function(data) {
        global = data;
        $(document.body).trigger("core.onload",[{
            data : data
        }]);
        init();
    });

    return that;
};
module.exports = Core;
