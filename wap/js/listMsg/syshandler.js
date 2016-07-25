
/*
* @author denzel
*/
//msgBind 展示消息到列表
var SysmsgHandler = function(global,msgBind,myScroll){

  //Dom元素
  var topTitleBar,//顶部栏
      title,//昵称
      chatPanelList,//滚动列表
      pullDownLabel,//下拉刷新文案label
      wrapScroll;//滚动窗体

  //定义变量
  var autoTimer,//输入框高度延迟处理 解决与弹出键盘冲突
      chatMsgList;//最外层滚动列表

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
    getTimeLine2:function(data,tp,oldTp,theFirst){
      //时间线显示
      var ret='',//返回结果
          tl,//时间线
          type;//0 当天  1上一天 2更久历史
      if(oldTp){
        var curTime = new Date();
        var _t = Math.abs(curTime - new Date(tp.substr(0,tp.indexOf(' '))))/1000/60/60/24;
        oldTp = oldTp.replace(/-/g,'/');
        tp = tp.replace(/-/g,'/');
        var _m = Math.abs(new Date(oldTp)- new Date(tp))/1000/60;
        if(Number(_m)>1){ //大于一分钟 才有意义继续执行
          //0 当天  1上一天 2更久历史
          type = _t<=1 ? 0 : _t>1 && _t<=2 ? 1 : 2;
          var _date = tp.substring(0,tp.lastIndexOf(':'));
          var _time = tp.substring(tp.indexOf(' '),tp.lastIndexOf(':'));
          switch (type) {
            case 0:
              tl= '今天'+ _time;
              break;
            case 1:
              tl = '昨天'+_time;
              break;
            case 2:
              tl = _date;
              break;
          }
          var comf = $.extend({
            sysData:tl,
            date:+new Date()
          });
          ret = doT.template(msgTemplate.sysData)(comf);
        }
      }
      //FIXME 首次进入 显示时间线
      if(theFirst){
        var _time = new Date();
        var _hour = _time.getHours()>9?_time.getHours():'0'+_time.getHours();
        var _minutes = _time.getMinutes()>9?_time.getMinutes():'0'+_time.getMinutes();
        var _ret = '今天 '+_hour+':'+_minutes;
        var comf = $.extend({
          sysData:_ret,
          date:+_time
        });
        ret = doT.template(msgTemplate.sysData)(comf);
      }
      return ret;
    },
    //输入栏高度变化设置
    onAutoSize : function(node){
      clearInterval(autoTimer);
      autoTimer =  setTimeout(function(){
        var offsetTop = node.offset().top-$(topTitleBar).height();
        scrollWrapHeight= offsetTop;//盒子高度
        $(wrapScroll).height(offsetTop);
        // myScroll.refresh();
        // myScroll.scrollTo(0,myScroll.maxScrollY);

        myScroll.myRefresh();
        // $(window).scrollTop(Number($("#js-textarea").offset().top));
    },300);
    },
    //转接人工
    onSessionOpen:function(data){
      if(data.type!='system'){
        var face = data.data.aface?data.data.aface:'http://img.sobot.com/console/common/face/admin.png';
        if(data.data){
          global.apiConfig.customInfo = {
            type:"human",
            data:{
                aface:face,
                aname:data.data.aname,
                content:"",
                status:1
            }
          };
        }
      }
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
          myScroll.scroll.refresh();
          // myScroll.myRefresh();
      },5*1000);//每隔5秒处理正在输入提示消息
    },
    //输入框相关提示系统消息
    onSendAreaSysMsg:function(data){
      msgBind(2,data);
    },
    //仅人工 客服不在线
    onButtonChange:function(data){
      if(data&&data.data){
        //FIXME 1：仅人工 客服不在线 开启留言功能 直接跳转留言页 2：若排除则继续当前页排除 3：技能组大于1时先弹技能组 再走1OR2
        if(data.data.status==2&&!global.apiConfig.groupflag&&!global.apiConfig.msgflag){
          window.location.href = global.apiConfig.leaveMsgUrl;//跳转到留言页
        }
        title.text('未接入');
        document.title = '未接入';
        var data = {type:'system',status:'hunmanonly',data:{content:data.data.content,status:0}};
        msgBind(2,data);
      }
    },
    //加载历史记录蒙板
    isLoadingHistoryMask:function(){
      var mask = '<div class="js-loadingHistoryMask loadingHistoryMask"><i></i></div>';
      $(document.body).append(mask);
      var $i=$('.js-loadingHistoryMask i');
      var $body = $(document.body);
      $i.offset({top:($body.height() -$i.height())/2,left:($body.width() - $i.width())/2});
    }
  };
  var onLoadingHistoryMask= function(e){
    e.stopPropagation();
    e.preventDefault();
  };
 var hideKeyboard = function(e){
    fnEvent.trigger('listMsg.hideKeyboard',scrollWrapHeight);
  };
  var parseDOM = function(){
    topTitleBar = $('.js-header-back');
    wrapScroll = $('.js-wrapper');
    chatPanelList = $('.js-chatPanelList');
    chatMsgList = $('.js-chatMsgList');
    title = $('.js-title');
    pullDownLabel = $('.js-pullDownLabel');
  };
  var bindListener = function(){
    fnEvent.on('sendArea.autoSize',config.sys.onAutoSize);//窗体聊天内容可视范围
    fnEvent.on('core.system',config.sys.onSessionOpen);//转人工事件
    fnEvent.on('sendArea.sendAreaSystemMsg',config.sys.onSendAreaSysMsg);//输入框相关提示系统消息
    fnEvent.on('core.buttonchange',config.sys.onButtonChange);//仅人工 且客服不在线
    $(document.body).delegate('.js-loadingHistoryMask','touchmove',onLoadingHistoryMask);
  };
  var initPlagsin=function(){
    // config.sys.nowTimer();//显示当前时间
    config.sys.onBeingInput();//正在输入处理
    config.sys.isLoadingHistoryMask();
    chatMsgList.on('click',hideKeyboard);//隐藏键盘
    chatMsgList.on('touchstart',hideKeyboard);//滑动隐藏键盘
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
