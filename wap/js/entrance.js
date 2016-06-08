(function(node) {
    var core = require('./core/core.js')(window);
    var listMsg = require('./listMsg/main.js');
alert();
    var parseDOM = function() {
    };

    var initPlugins = function() {
        listMsg();
        //会话列表
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
