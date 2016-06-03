(function(node) {
    var core = require('./core/core.js')(window);
    var listMsg = require('./listMsg/index.js');

    var parseDOM = function() {
    };

    var initPlugins = function() {
        
        listMsg($(".wrap"));

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
