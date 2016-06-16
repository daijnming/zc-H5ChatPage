(function() {
    var listener = require('../../../common/util/listener.js');
    var bindListener = function() {
        listener.on("core.sessionclose", function() {
            alert("客服把你踢了");
            window.location.reload();
        });
    };

    var init = function() {
        bindListener();
    };

    init();
})();
