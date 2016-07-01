(function() {
    var listener = require('../../../common/util/listener.js');
    var bindListener = function() {
        listener.on("core.sessionclose", function(ret) {
            var status = ret;
            //window.location.reload();
        });
    };

    var init = function() {
        bindListener();
    };

    init();
})();
