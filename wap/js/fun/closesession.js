(function() {
    var listener = require('../../../common/util/listener.js');
    var bindListener = function() {
        listener.on("core.sessionclose", function(ret) {
            var status = ret[0];
            switch(status) {
                case 2:
                    alert('客服把你踢了');
                    break;
                case 3:
                    break;
            }
            // window.location.reload();
        });
    };

    var init = function() {
        bindListener();
    };

    init();
})();
