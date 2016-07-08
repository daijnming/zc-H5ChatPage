
/*
* @author denzel
*/
//msgBind 展示消息到列表
var SysmsgHandler = function(msgBind,myScroll){

  //Dom元素
  var topTitleBar,//顶部栏
      title,//昵称
      chatPanelList,//滚动列表
      pullDownLabel,//下拉刷新文案label
      wrapScroll;//滚动窗体

  //定义变量
  var autoTimer;//输入框高度延迟处理 解决与弹出键盘冲突

  var msgTemplate = require('./template.js');
  var QQFace = require('../util/qqFace.js')();
  var Comm = require('../../../common/comm.js');
  var fnEvent = require('../../../common/util/listener.js');

  var config={};

   config.sys = {
    nowTimer:function(){

      //有会话就显示时间
      var _now = new Date();
      var _hour = _now.getHours()>=10?_now.getHours():'0'+_now.getHours();
      var _minutes = _now.getMinutes()>=10?_now.getMinutes():'0'+_now.getMinutes();
      var _timer =  '今天' + _hour+':'+_minutes;
      if(chatPanelList&&chatPanelList.children().length){
        var lastDom = chatPanelList.children().last();
        if(!lastDom.hasClass('sysData')){
          msgBind(3,_timer);// 3系统时间提示
        }
      }else{
        msgBind(3,_timer);
      }
    },
    //type 0 今天  1 昨天  2 更早在历史记录
    getTimeLine:function(type,time){
      //获取时间线显示
      var _timer;
      if(type==2){
        _timer= time.substring(0,time.lastIndexOf(':'));
      }else{
        var t = type===0?'今天':'昨天';
        _timer = t + time.substring(time.indexOf(' '),time.lastIndexOf(':'));
      }
      var comf = $.extend({
        sysData:_timer,
        date:+new Date()
      });
      var str = doT.template(msgTemplate.sysData)(comf);

      if(_timer){
        return str;
      }
    },
    //输入栏高度变化设置
    onAutoSize : function(node){
      clearInterval(autoTimer);
      autoTimer =  setTimeout(function(){
        var offsetTop = node.offset().top-$(topTitleBar).height();
        $(wrapScroll).height(offsetTop);
        myScroll.refresh();
        myScroll.scrollTo(0,myScroll.maxScrollY);
        $(window).scrollTop(Number($("#js-textarea").offset().top));

      },300);
      function IsIphone() {
                  var userAgentInfo = navigator.userAgent;
                  var Agents = [/*"Android", */"iPhone"/*,
                              "SymbianOS", "Windows Phone",
                              "iPad", "iPod"*/];
                  var flag = true;
                  for (var v = 0; v < Agents.length; v++) {
                      if (userAgentInfo.indexOf(Agents[v]) > 0) {
                          flag = false;
                          break;
                      }
                  }
                  return flag;
              }
              var aa=IsIphone();
              if(!aa){
                          
                        $('.sendarea').focus(function(){
                          var _this = this;
                          //给窗口对象绑定滚动事件，保证页面滚动时div能吸附软键盘
                          $(window).bind('scroll', function(){
                              //设置输入框位置使其紧贴输入框
                              $(".sendarea").css({'position':'absolute', 'top':afterScrollTopPos });
                          });
                        })
              }
    },
    //转接人工
    onSessionOpen:function(data){
      // console.log(data);
      var name = data.data.aname?data.data.aname:'未接入';
      $('.js-title').text(name);
      document.title = name;
      msgBind(2,data);
    },
    //系统消息显示处理
    onSysMsgShow:function(msg,status,sysMsgKeyword,sysMsgManager){
      //生成时间戳
      var tp = +new Date();
      var msgTmp;
      //是否包含需要处理的系统提示语
      if(sysMsgKeyword.indexOf(status)>=0){
        sysMsgManager.push(tp);//用于系统提示判断
      }else if(status ==205){
        msgTmp='input205';
        var $msgInput = $('.input205').remove();//正在输入class
      }
      var comf = $.extend({
        sysMsg:msg,
        sysMsgSign:tp,
        date:tp,
        msgTmp:msgTmp
      });
      var msgHtml = doT.template(msgTemplate.sysMsg)(comf);
      return msgHtml;
    },
    //正在输入处理
    onBeingInput:function(){
      var _t = setInterval(function(){
          $('.input205').remove();
          myScroll.refresh();
      },5*1000);//每隔5秒处理正在输入提示消息
    },
    //输入框相关提示系统消息
    onSendAreaSysMsg:function(data){
      msgBind(2,data);
    },
    //仅人工 客服不在线
    onButtonChange:function(data){
      console.log(data);
      if(data&&data.data){
        title.text('未接入');
        document.title = '未接入';
        var data = {type:'system',status:'hunmanonly',data:{content:data.data.content,status:0}};
        msgBind(2,data);
      }
    }
  };
  var parseDOM = function(){
    topTitleBar = $('.js-header-back');
    wrapScroll = $('.js-wrapper');
    chatPanelList = $('.js-chatPanelList');
    title = $('.js-title');
    pullDownLabel = $('.js-pullDownLabel');
  };
  var bindListener = function(){
    fnEvent.on('sendArea.autoSize',config.sys.onAutoSize);//窗体聊天内容可视范围
    fnEvent.on('core.system',config.sys.onSessionOpen);//转人工事件
    fnEvent.on('sendArea.sendAreaSystemMsg',config.sys.onSendAreaSysMsg);//输入框相关提示系统消息
    fnEvent.on('core.buttonchange',config.sys.onButtonChange);//仅人工 且客服不在线
  };
  var initPlagsin=function(){
    // config.sys.nowTimer();//显示当前时间
    config.sys.onBeingInput();//正在输入处理
  };
  var init =function (){
    parseDOM();
    bindListener();
    initPlagsin();
  };
  init();
  return config;
};

module.exports = SysmsgHandler;
