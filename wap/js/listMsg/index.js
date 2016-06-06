
var ListMsg = function(node){
  var Comm = require('../../../common/comm.js');
  //Dom元素
  var headerBack,//返回条颜色
      userChatBox,//用户聊天内容背景色
      setStyle,//首页样式
      chatMsgList,//聊天窗体
      titleName; //显示标题

  var Chat={};//初始化数据

  var onCoreLoad = function(evn,data){
    Chat.data = data.data;
    initConfig();
    initHistoryMsg();
    initBrowserDiff();
  };
  ///处理移动端浏览器差异性
  var initBrowserDiff = function(){

  };
  //初始化历史记录加载
  var initHistoryMsg = function(){

  };
  var initConfig = function(){
        //若有back参数就显示返回状态栏
        var urlParams = Comm.getQueryParam();
        if(urlParams['back'] && urlParams['back'] == 1) {
            $(headerBack).addClass('show');
        }
        //FIXME  页面配置设置 初始化主题色
        var color = Chat.data.apiConfig.color ? Chat.data.apiConfig.color : 'rgb(9, 174, 176)';
        $(headerBack).css('background-color',color);
        $(userChatBox).css('background-color',color);
        $(setStyle).html('.rightMsg .msgOuter::before{border-color:transparent ' + color + '}');
        //初始化企业名称
        titleName.text(Chat.data.apiConfig.companyName.length>12?Chat.data.apiConfig.companyName.substr(0,12)+'..':Chat.data.apiConfig.companyName);
  };
  //初始化Dom元素
  var paramsDom = function() {
      headerBack = $('.js-header-back');
      userChatBox = $('.js-userMsgOuter');
      setStyle = $('.setStyle');
      chatMsgList = $('.js-chatMsgList');
      titleName = $('.js-header-back .js-title');

  };

  var bindListener = function(){
    $(document).on('core.onload',onCoreLoad);
  };

  var init = function(){
    paramsDom();
    bindListener();
  };
  init();
};
module.exports = ListMsg;
