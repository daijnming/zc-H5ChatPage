

var InitWap = function(global){

  var Comm = require('../../../common/comm.js');
  //Dom元素
  var headerBack,//返回条颜色
      userChatBox,//用户聊天内容背景色
      setStyle,//首页样式
      chatMsgList,//聊天窗体
      titleName; //显示标题


  var parseDOM = function () {
    headerBack = $('.js-header-back');
    userChatBox = $('.js-userMsgOuter');
    setStyle = $('.setStyle');
    chatMsgList = $('.js-chatMsgList');
    titleName = $('.js-header-back .js-title');
  };

  var bindListener = function(){

  };
  var initPlugins = function(){
    //
  };
  //初始化h5页面配置信息
  var temp = function(){
    //若有back参数就显示返回状态栏
    var urlParams = Comm.getQueryParam();
    if(urlParams['back'] && urlParams['back'] == 1) {
        $(headerBack).addClass('show');
        $('.js-chatMsgList').css('margin-top','50px');
    }else{
        $('.js-chatMsgList').css('margin-top','0');
    }
    //FIXME  页面配置设置 初始化主题色
    var color = global.apiConfig.color ? global.apiConfig.color : 'rgb(9, 174, 176)';
    $(headerBack).css('background-color',color);
    $(userChatBox).css('background-color',color);
    $(setStyle).html('.rightMsg .msgOuter::before{border-color:transparent ' + color + '}');
    //初始化企业名称
    titleName.text(global.apiConfig.companyName.length>12?global.apiConfig.companyName.substr(0,12)+'..':global.apiConfig.companyName);
  };
  var init = function(){
    parseDOM();
    temp();
    bindListener();
    initPlugins();
  };
  init();

};
module.exports = InitWap;
