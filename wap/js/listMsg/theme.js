

//H5聊天页样式及颜色设置

var Theme = function(global,node){

  var Comm = require('../../../common/comm.js');
  var topTitleBar,//顶部返回栏
      userMsgBg,//用户聊天背景
      chatWrap,//聊天窗体
      setStyle,//style css
      companyTitle;//公司名称

  //是否显示顶部状态栏
  var isShowTopTitleBar = function(){
    var urlParams = Comm.getQueryParam();
    if(urlParams['back'] && urlParams['back'] === 1) {
        $(topTitleBar).addClass('show');
        $(chatWrap).addClass('addTop');
    } else {
        $(chatWrap).removeClass('addTop');
    }
  };
  //设置主题样式
  var setThemeColor = function(){
    var color = global.apiConfig.color;
    $(setStyle).html('.rightMsg .msgOuter::before{border-color:transparent ' + color + ' !important} '+
                     '.rightMsg .msgOuter{background-color:' + color + ' !important}'+
                     '.wrap .header-back{background-color:'+color+' !important}'
                    );
  };
  //设置客户信息
  var setCustomInfo = function(){
    //配置公司名
    var title = global.apiConfig.companyName&&global.apiConfig.companyName.length > 12 ? global.apiConfig.companyName.substr(0,12) + '..' : global.apiConfig.companyName
    companyTitle.text(title);
  };
  var parseDom = function(){
    topTitleBar = $(node).find('.js-header-back');
    userMsgBg = $(node).find('.js-userMsgOuter');
    chatWrap = $(node).find('.js-wrapper');
    setStyle = $('.js-setStyle');
    companyTitle = $(node).find('.js-title');
  };
  var initPlugins = function(){
    isShowTopTitleBar();
    setThemeColor();
    setCustomInfo();
  };
  var init = function(){
    parseDom();
    initPlugins();
  };
  init();
};
module.exports = Theme;
