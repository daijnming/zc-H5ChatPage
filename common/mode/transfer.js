/**
 * @author Treagzhao
 */
function transfer(global,promise) {
    var Promise = require('../util/promise.js');
    var promise = promise || new Promise();
    var template = require('./template.js');
    var layer;
    var showGroups = function(ret) {
        var _html = doT.template(template.groupTemplate)({
            'list' : ret
        });
        var layer = $(_html);
        $(".js-wrapBox").append(layer);
        layer.delegate(".js-item",'click', function(e) {
            var elm = e.currentTarget;
            var groupId = $(elm).attr("data-id");
            global.urlParams.groupId = groupId;
            promise.resolve(groupId);
            layer.remove();
        });
        layer.find(".js-cancel-btn").on("click", function() {
            promise.reject();
            layer.remove();
        });
    };
    var init = function() {
        if(global.apiConfig.groupflag === 0) {
            setTimeout(function() {
                promise.resolve(null);
            },0);
        } else if(global.urlParams.groupId && global.urlParams.groupId.length) {
            //参数中配置了groupId
            var groupId = global.urlParams.groupId;
            setTimeout(function() {
                promise.resolve(groupId);
            },0);
        } else {
            $.ajax({
                'url' : '/chat/user/getGroupList.action',
                'dataType' : 'json',
                'type' : 'get',
                'data' : {
                    'companyId' : global.apiInit.pid
                },
                'success' : function(ret) {
                    if(ret.length == 1) {
                        var item = ret[0];
                        global.urlParams.groupId = item.groupId;
                        promise.resolve(item.groupId);
                    } else {
                        showGroups(ret);
                    }
                },
                'fail' : function() {
                }
            });
        }
    };

    init();

    return promise;
}

module.exports = transfer;
