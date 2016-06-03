/**
 * @author Treagzhao
 */

var API = function(sysNum,info) {
    this.sysNum = sysNum;
    this.info = info;

    //所有 api接口地址
    this.api = {
        url_config : '/chat/user/config.action',
        url_init : '/chat/user/init.action'
    };
    this.source = info.source ? info.source : 0;
    this.tel = info.tel;
    this.partnerId = info.partnerId;
    this.email = info.email;
    this.groupId = info.groupId;
    this.visitUrl = info.visitUrl;
    this.visitTitle = info.visitTitle;
    this.face = info.face;

    //方法调用
    var apiHandler = {

    };
    return apiHandler;
};

module.exports = API;
