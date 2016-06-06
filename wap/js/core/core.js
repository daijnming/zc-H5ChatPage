var Core = function() {
    var promise = require('../../../common/initConfig.js')();
    var initWap = require('../listMsg/initWap.js');
    var ManagerFactory = require('../../../common/mode/mode.js');
    var fnEvent = require('../../../common/util/listener.js');
    var manager;
    var $evtDom;
    var global;

    var parseDOM = function() {
    };

    var bindListener = function() {
    };

    var initPlugins = function() {
        manager = ManagerFactory(global);
        initWap = initWap(global);
        //
        //

    };
    var temp = function() {
    };
    //FIXME 通过initConfig初始化后再针对H5进行配置
    var init = function(){
      temp();
      parseDOM();
      bindListener();
      initPlugins();
    };
    promise.then(function(data) {
      global = data;
      init();
      fnEvent.trigger('core.onload',[global]);
        // $(document.body).trigger("core.onload",[{
        //     data : data
        // }]);
    });
};
module.exports = Core;
