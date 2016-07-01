
/*
* @author denzel
*/
//msgBind 展示消息到列表
var SysmsgHandler = function(global,msgBind,myScroll){

  //Dom元素
  var chatPanelList;//滚动列表

  //定义变量
  var isUploadImg=true;//是否为上传图片操作

  //定义变量
  var autoTimer,//输入框高度延迟处理 解决与弹出键盘冲突
      adminTime=0,//客户超时时间 默认为 0
      userTime=0,//用户超时时间 默认为 0
      userTimer,//用户超时任务
      adminTimer,//客服超时任务
      isUserSendMsg=false,//用户是否有发送内容
      isAdminSendMsg=false;//客服是否有发送内容


  var sys={};
  sys.config ={};
  sys.config.msgSendACK=[];//填装发送消息的容器 用于与消息确认匹配
  sys.config.uploadImgToken='';//锁定当前上传图片唯一标识
  sys.config.currentState='';//当前聊天对象状态  1 智能机器人  2人工客服

  //消息状态-类
  var MSGSTATUSCLASS={
    MSG_LOADING:'msg-loading',//正在发送
    MSG_LSSUED:'msg-lssued',//已发送
    MSG_SERVED:'msg-served',//已送达
    MSG_FAIL:'msg-fail',//发送失败
    MSG_CLOSE:'msg-close',//关闭发送  图片仅有
    MSG_SENDAGAIN:'msg-sendAgain'//重发图片
  };
  //系统提示
  var sysPromptLan ={
    L0001:'您与{0}的会话已经结束',
    L0002:'您已经很长时间未说话了哟，有问题尽管咨询',
    L0003:'您已在新窗口打开聊天页面',
    L0004:'客服正在输入...'
  };

  var msgTemplate = require('./template.js');
  var QQFace = require('../util/qqFace.js')();
  var Comm = require('../../../common/comm.js');
  var fnEvent = require('../../../common/util/listener.js');

  sys.msg = {
    //相关搜索方法
    sugguestionsSearch:function(data,isHistory){
      if(data){
        var list = data.sugguestions;
        var comf = $.extend({
          customLogo:global.apiConfig.robotLogo,
          customName:global.apiConfig.robotName,
          list:list,
          isHistory:isHistory,
          stripe:data.stripe
        });
        var msg = doT.template(msgTemplate.listSugguestionsMsg)(comf);
        return msg;
      }
      return '非常对不起哦，不知道怎么回答这个问题呢，我会努力学习的。';
    },
    //发送消息
    onSend : function(data){
      // console.log(data);
      isUserSendMsg = true;//
      if(data[0].sendAgain){
        //消息重发
        var oDiv = $('#userMsg'+data[0].oldMsgId).parents('div.rightMsg');
        chatPanelList.append(oDiv);
      }else{
        //非图片
        if(data[0]['token']==''){
          msgBind(0,data);
        }
      }
    },
    //接收回复
   onReceive : function(data){
     isAdminSendMsg = true;
     //判断当前聊天状态
     if(data.type==='robot'){
       sys.config.currentState=1;
     }else if(data.type==='human'){
       sys.config.currentState=2;
     }
      msgBind(1,data);
    },
    //相关搜索答案点击事件
   onSugguestionsEvent : function(){
      var _txt = $(this).text();
      if(_txt){
        //获取点击内容
        var _msg = _txt.substr(_txt.indexOf(':')+1,_txt.length).trim();
        fnEvent.trigger('sendArea.send',[{
                'answer' : _msg,
                'uid' : global.apiInit.uid,
                'cid' : global.apiInit.cid,
                'currentStates':'robot',
                'requestType':'question',
                'date' : global.apiInit.uid + +new Date()
            }]);
      }
    },
    //上传图片
    onUpLoadImg:function(data){
      msgBind(4,data);
    },
    onUpLoadImgProgress:function(data){
      var $shadowLayer,
          $progress,
          oldH;
      if(isUploadImg){
          $shadowLayer = $('#img'+sys.config.uploadImgToken).find('.js-shadowLayer');
          $progress = $('#progress'+sys.config.uploadImgToken);
          oldH = $shadowLayer.height();
          isUploadImg=false;
      }
      //蒙版高度随百分比改变
      $progress.text(data+'%');
      var floatData = data/100;//获取小数
      //蒙版高度
      var cH = floatData * oldH;//获取计算后的高度值
      //计算
      var newH = oldH - cH;
      $shadowLayer.height(newH);
      if(floatData>=1){
        isUploadImg=true;//开启上传图片
        $shadowLayer.remove();
        $progress.remove();
        myScroll.refresh();//刷新
      }
    },
    //回传图片路径地址
    onUploadImgUrl:function(data){
      //FIXME 若是回传上传图片路径则不需要追加消息到聊天列表 直接去替换img即可
      var $div = $('#img'+sys.config.uploadImgToken);
      $div.find('p img:first-child').remove();
      $div.find('p').html(data[0]['answer']);
      sys.config.uploadImgToken='';//置空 一个流程完成
    },
    //会话结束判断
    // 1：人工客服离线导致用户下线
    // 2：被客服移除
    // 3：被列入黑单
    // 4：长时间不说话
    // 6：有新窗口打开
    sessionCloseHander:function(data){
      clearInterval(userTimer);//停止超时提示任务
      clearInterval(adminTimer);
      var msg='';
      if(data){
        switch (data.status) {
          case 1:
          msg = Comm.format(sysPromptLan.L0001,[data.aname],true);
            break;
          case 2:
          msg = Comm.format(sysPromptLan.L0001,[data.aname],true);
            break;
          case 3:
          msg = Comm.format(sysPromptLan.L0001,[data.aname],true);
            break;
          case 4:
          msg = Comm.format($(global.apiConfig.userOutWord).text(),[data.aname],false);
            break;
          case 6:
          msg = Comm.format(sysPromptLan.L0003,[data.aname],false);
            break;
        }
      }
      var tp = +new Date();
      var comf = $.extend({
        sysMsg:msg,
        sysMsgSign:tp,
        date:tp
      });
      return doT.template(msgTemplate.sysMsg)(comf);
    },
    //消息确认方法
    msgReceived:function(data){
      var sendType,//发送类型
          answer;//发送内容
      var isMsgId = sys.config.msgSendACK.indexOf(data.msgId);
      if(isMsgId>=0){
        if(data.result=='success'){
          sys.config.msgSendACK.splice(isMsgId,1);//从数组中删除
          $('#userMsg'+data.msgId).removeClass('error msg-loading msg-fail msg-close msg-sendAgain').addClass('msg-served');
        }else{
          //发送失败 图片  文字 两种判断
          if($('#userMsg'+data.msgId).hasClass('msg')){
            //文字
            $('#userMsg'+data.msgId).removeClass('msg-loading').addClass('error msg-fail');
          }else{
            //图片
            $('#userMsg'+data.msgId).removeClass('msg-close').addClass('error msg-sendAgain');
          }
        }
      }
    },
    //消息重发
    onMsgSendAgain:function(){
      var that = $(this);
      var sendType,//发送类型
          answer;//发送内容
      var msgId = that.attr('id').substr(7,that.attr('id').length);
      //判断当前消息是否满足重发条件 error
      if(that.hasClass('error')){
        //判断当前是图片重发   文字重发
        if(that.hasClass('msg')){
          //文字
          sendType='msg';
          that.removeClass('error msg-fail').addClass('msg-loading');
          answer = that.prev().text().trim();
        }else{
          //图片
          sendType='img';
          that.removeClass('msg-sendAgain').addClass('msg-close');//图片重发过程可点击取消
          answer = that.prev().find('p').html();
        }
        alert();
        console.log(sys.config.currentState);
        console.log(sys.config.currentState==1?'机器人':'客服');
        fnEvent.trigger('sendArea.send',[{
           'answer' :answer,
           'uid' : global.apiInit.uid,
           'cid' : global.apiInit.cid,
           'dateuid' : global.apiInit.uid+ +new Date(),
           'oldMsgId':msgId,
           'currentStates':sys.config.currentState==1?'robot':'human',
           'date': +new Date(),
           'token':msgId,
           'sendAgain':true//是否重发
        }]);
      }
    },
    //来自于客服的消息
    //type --> robot human
    onMsgFromCustom:function(type,data){
      var logo,name,msg;
      if(type=='robot'){
        // console.log(data.answer);
        msg =QQFace.analysis( data.answer?data.answer:'');//过滤表情;
        // msg = data.answer;
        logo = global.apiConfig.robotLogo;
        name = global.apiConfig.robotName;
      }else if(type=='human'){
        msg =QQFace.analysis(data.content?data.content:'');//过滤表情
        logo = data.aface;
        name = data.aname;
      }
      var index = msg.indexOf('uploadedFile');
      var res;
      //判断是否是富文本
      if(index>=0||(msg.indexOf('<')>=0 && msg.indexOf('>')>=0)){
        res = msg;
      }else{
        res = Comm.getNewUrlRegex(msg);
      }
      var comf = $.extend({
          customLogo : logo,
          customName : name,
          customMsg : res,
          date:+new Date()
        });
      var tmpHtml = doT.template(msgTemplate.leftMsg)(comf);
      return tmpHtml;
    },
    adminTipTime:function(){
      adminTimer = setInterval(function(){
        //有消息发回 则重新计算超时时间
        if(isAdminSendMsg){
          adminTime=0;
          isAdminSendMsg=false;
        }
        adminTime += 1;
        if(adminTime * 1000 >= global.apiConfig.adminTipTime * 1000 * 60){
        // if(adminTime * 1000 >= 1000 * 5){
          adminTime=0;//清空
          //提示客服超时语
          var data = {
            type:'system',
            status:'adminoffline',
            data:{
              content:$(global.apiConfig.adminTipWord).text(),
              status:0
            }
          };
          msgBind(2,data);
        }
      },1000);
    },
    userTipTime:function(){
      userTimer = setInterval(function(){
        //有消息发送  则重新计算超时时间
        if(isUserSendMsg){
          userTime=0;
          isUserSendMsg=false;
        }
        userTime += 1;
        if(userTime * 1000 >= global.apiConfig.userTipTime * 1000 * 60){
        // if(userTime * 1000 >= 1000 * 3){
          userTime=0;//清空
          //提示客服超时语
          var data = {
            type:'system',
            status:'useroffline',
            data:{
              content:$(global.apiConfig.userTipWord).text(),
              status:0
            }
          };
          msgBind(2,data);
        }
      },1000);
    }
  };
  var parseDOM = function(){
    chatPanelList = $('.js-chatPanelList');
  };
  var bindListener = function(){
    //FIXME EVENT
    $('.js-chatPanelList').delegate('.js-answerBtn','click',sys.msg.onSugguestionsEvent);//相关搜索答案点击事件
    $('.js-chatPanelList').delegate('.js-msgStatus','click',sys.msg.onMsgSendAgain);//消息重发
  };
  var _timer ;
  var initPlagsin=function(){
    _timer = setInterval(function(){
      //若是人工则开始计算超时时间
      if(sys.config.currentState==2){
        clearInterval(_timer);
        sys.msg.adminTipTime();//客服超时提示
        sys.msg.userTipTime();//用户超时提示
      }
    },1000);

  };
  var init =function (){
    parseDOM();
    bindListener();
    initPlagsin();
  };
  init();
  return sys;
};

module.exports = SysmsgHandler;
