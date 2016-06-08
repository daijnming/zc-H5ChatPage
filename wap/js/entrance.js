(function(node) {
    var core = require('./core/core.js')(window);
    var listMsg = require('./listMsg/main.js');
    var sendArea = require('./sendArea/index.js');
    var parseDOM = function() {

    };

    var initPlugins = function() {
        listMsg();//会话列表
        sendArea();
    };
    var bindListener = function() {
        $(window).on("resize", function(e) {
        });
    };

    var init = function() {
        parseDOM();
        initPlugins();
    };
    init();
})(document.body);
