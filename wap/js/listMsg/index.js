
var ListMsg = function(){

  var global;
  var Comm = require('../../../common/comm.js');
  var fnEvent = require('../../../common/util/listener.js');
  var SwitchModel = require('./switchModel.js');

  //api接口
  var api = {
    keepDetail_url:'/chat/user/getChatDetailByCid.action'
  };

  var initSessions = function() {
      //FIXME 初始化类型
      //用户当前状态 -2 排队中； -1 机器人； 0 离线； 1 在线；
      if(global.apiInit.ustatus == 1 || global.apiInit.ustatus == -2) {
          //更新会话保持标识
          global.flags.isKeepSessions = true;
      } else if(global.apiInit.ustatus == -1) {
          //拉取会话记录
          $.ajax({
              type : "post",
              url : api.keepDetail_url,
              dataType : "json",
              data : {
                  cid : global.apiInit.cid,
                  uid : global.apiInit.uid
              },
              success : function(data) {
                  console.log(data);
                  promise.resolve();
              }
          });
      } else {
          //处理客服类型 机器人、人工、邀请模式
          SwitchModel(global);
      }
  };
  var onCoreLoad = function(data){
    global = data[0];
    initSessions();
    initBrowserDiff();
  };
  ///处理移动端浏览器差异性
  var initBrowserDiff = function(){

  };
  //初始化Dom元素
  var paramsDom = function() {

  };

  var bindListener = function(){
    fnEvent.on('core.onload',onCoreLoad);
  };

  var init = function(){
    paramsDom();
    bindListener();
  };
  init();
};
module.exports = ListMsg;
