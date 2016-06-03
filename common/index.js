/**
 * @author Treagzhao
 */

var API = function(sysNum,info){
  this.sysNum = sysNum;
  this.info = info;

  //所有 api接口地址
  this.api ={
    url_config :'/chat/user/config.action',
    url_init:'/chat/user/init.action'
  };
  this.source = info.source?info.source:0;
  this.tel=info.tel;
  this.partnerId = info.partnerId;
  this.email = info.email;
  this.groupId = info.groupId;
  this.visitUrl = info.visitUrl;
  this.visitTitle = info.visitTitle;
  this.face = info.face;

  //方法调用
  var apiHandler = {
    config:function(callback){
        $.ajax({
          type: "POST",
          url: this.url_config,
          dataType: "json",
          data: {
              sysNum: this.sysNum,
              source: this.source
          },
          success : callback
      });
    },
    init:function(callback){
      $.ajax({
        type: "post",
        url: that.url_init,
        async: false,
        dataType: "json",
        data: {
    		sysNum: that.sysNum,
            source: that.source,
            partnerId: that.partnerId,
            tel: that.tel,
            email: that.email,
            uname: that.uname,
            visitTitle:that.visitTitle,
            visitUrl:that.visitUrl,
            face:that.face
        },
        success:callback
    });
    }
  };
  return apiHandler;
};

module.exports = API;
