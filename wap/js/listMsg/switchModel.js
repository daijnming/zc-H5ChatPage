
var SwitchModel = function(global){

  //模块引用
  var fnEvent = require('../../../common/util/listener.js');

  //模块间接口调用 地址
  var apiHandler = {
    servModel:'core.customServModel'//客服模式
  };

  //判断类型
  var switchModelHandler =function(){

    var _modelHandler = function(){
      //仅机器人||机器人优先
      if(global.apiInit.ustatus==1||global.apiInit.ustatus==3){
          robotModel();
          //仅机器人模式
          if(global.apiInit.ustatus==1){
              //FIXME 接口定义 不能使用客服模式下的任何操作
              fnEvent.trigger(apiHandler.servModel,['robotOnlyModel']);
          }
      }else{
          customServModel();
      }
    };
    // 用户当前的方位状态：-3.访问页面，-2.排队中，-1.机器人 0.离线   1.在线
    if(global.apiInit.ustatus==1||global.apiInit.ustatus==-2){
      global.flags.isKeepSessions = true;
      customServModel();
      return;
    }
    if(global&&global.apiInit.ustatus!=undefined){
      _modelHandler();
    }else{
      //设置周期性判断
      global.flags.smTimeTask = setInerval(function(){
        if(global&&global.apiInit.ustatus!=undefined){
          clearInterval(global.flags.smTimeTask);
          _modelHandler();
        }
      },500);
    }

  };
  //客服模式
  var customServModel = function(){

  };
  //机器人类型
  var robotModel = function(){

  };
  var parseDOM = function(){

  };
  var bindListener = function(){

  };
  var initPlugsin =function(){
    switchModelHandler();
    robotModel();
  };
  var init = function(){
    parseDOM();
    bindListener();
    initPlugsin();
  };
  init();
};
module.exports = SwitchModel;
