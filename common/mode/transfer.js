/**
 * @author Treagzhao
 */
function transfer(global, promise, queueing) {
    var Promise = require('../util/promise.js');
    var promise = promise || new Promise();
    var template = require('./template.js');
    var layer;
    var showGroups = function(ret) {
        var _html = doT.template(template.groupTemplate)({
            'list': ret
        });
        var layer = $(_html);
        $(".js-wrapBox").append(layer);
        layer.delegate(".js-item", 'click', function(e) {
            var elm = e.currentTarget;
            var groupId = $(elm).attr("data-id");
            promise.resolve(groupId);
            layer.remove();
        });
        layer.find(".js-cancel-btn").on("click", function() {
            promise.reject();
            layer.remove();
        });
        //分组颜色
        $('.js-item').css('background-color', global.apiConfig.color);
        $('.js-cancel-btn').css('color', global.apiConfig.color);
        // var w = $('.group-outer').width();
        // var h = $('.group-outer').height();
        // var W = $(document.body).width();
        // var H = $(document.body).height();
        // $('.group-outer').offset({'width':(W-w)/2,'height':(H-h)/2});
    };
    var init = function() {
        if (global.apiInit.ustatus !== 0) {
            //存在会话保持
            setTimeout(function() {
                promise.resolve(null);
            }, 0);
        } else if (queueing) {
            //正在排队
            setTimeout(function() {
                promise.resolve(null);
            }, 0);
        } else if (global.apiConfig.groupflag === 0) {
            setTimeout(function() {
                promise.resolve(null);
            }, 0);
        } else if (global.urlParams.groupId && global.urlParams.groupId.length) {

            //参数中配置了groupId
            var groupId = global.urlParams.groupId;
            setTimeout(function() {
                promise.resolve(groupId);
            }, 0);
        } else {
            $.ajax({
                'url': '/chat/user/getGroupList.action',
                'dataType': 'json',
                'type': 'get',
                'data': {
                    'companyId': global.apiInit.pid
                },
                'success': function(ret) {
                    if (ret.length == 1) {
                        var item = ret[0];
                        promise.resolve(item.groupId);
                    } else {
                        showGroups(ret);
                    }
                },
                'fail': function() {}
            });
        }
    };

    init();

    return promise;
}

module.exports = transfer;
