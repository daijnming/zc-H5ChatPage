(function() {
    var listener = require('../../../common/util/listener.js');
    var bindListener = function() {
        listener.on("core.sessionclose", function(ret) {
            var status = ret[0];
            switch(status) {
                case 1:
                    alert('客服自己离线了');
                    break;
                case 2:
                    alert('客服把你踢了');
                    break;
                case 3:
                    alert('客服把你拉黑了');
                    break;
                case 4:
                    alert('长时间不说话');
                    break;
                case 6:
                    alert('有新窗口打开');
                    break;
            }

            window.location.reload();
        });
    };

    var init = function() {
        bindListener();
    };

    init();
})();
