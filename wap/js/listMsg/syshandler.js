
/*
* @author denzel
*/
//msgBind 展示消息到列表
var SysmsgHandler = function(msgBind,myScroll){

  //Dom元素
  var topTitleBar,//顶部栏
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
      //首次进入提示语
      var _now = new Date();
      var _hour = _now.getHours()>=10?_now.getHours():'0'+_now.getHours();
      var _minutes = _now.getMinutes()>=10?_now.getMinutes():'0'+_now.getMinutes();
      var _timer =  '今天' + _hour+':'+_minutes;
      msgBind(3,_timer);// 3系统时间提示
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
    },
    //转接人工
    onSessionOpen:function(data){
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
    }
  };
  var parseDOM = function(){
    topTitleBar = $('.js-header-back');
    wrapScroll = $('.js-wrapper');
  };
  var bindListener = function(){
    fnEvent.on('sendArea.autoSize',config.sys.onAutoSize);//窗体聊天内容可视范围
    fnEvent.on('core.system',config.sys.onSessionOpen);//转人工事件
  };
  var initPlagsin=function(){
    config.sys.nowTimer();//显示当前时间
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
