(function(node) {
    var core = require('./core/core.js')(window);
    var listMsg = require('./listMsg/index.js');
    var Promise = require('./util/promise.js');
    var fileLoader = require('./util/load.js')();
    var TOOLBARHEIGHT = 50;
    var parseDOM = function() {
    };

    var initPlugins = function() {
        var height = ($(window).outerHeight()) - TOOLBARHEIGHT;
        listMsg($(".chatMsgList"),core,window);
    };
    var bindListener = function() {
        $(window).on("resize", function(e) {
            var height = ($(window).outerHeight()) - TOOLBARHEIGHT;
        });
    };

    var init = function() {
        parseDOM();
        bindListener();
        initPlugins();
    };
    init();

})(document.body);
