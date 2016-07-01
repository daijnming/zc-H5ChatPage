/*(function() {
    var listener = require('../../../common/util/listener.js');
    var endSessionHandler=function(status){
            var status = ret;
            switch(status) {
                case -1:
                    //alert('仅人工模式，转人工失败');
                    break;
                case 1://客服自己离线了
                case 2://客服把你T了
                case 3://客服把你拉黑了
                case 4://长时间不说话
                case 6://有新窗口打开
                $chatArea.removeClass("hideChatArea").addClass("showChatArea");
                $keepSession.hide();
                $endSession.show();
                autoSizePhone();
                sessionEnd=true;
                break;
            }
    };
    var bindListener = function() {
        listener.on("core.sessionclose",endSessionHandler);
    };

    var init = function() {
        bindListener();
    };

    init();
})();
*/