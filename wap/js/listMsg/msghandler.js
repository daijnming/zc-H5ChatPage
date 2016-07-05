
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
      sendTimer,//发送消息超时
      sendTime=0;//发达消息超时时间 默认为0
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
        var oDiv = $('#userMsg'+data[0].dateuid).parents('div.rightMsg');
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
    //  console.log(data);
     //判断当前聊天状态
     if(data.type==='robot'){
       sys.config.currentState=1;
     }else if(data.type==='human'){
       isAdminSendMsg = true;
       sys.config.currentState=2;
     }
      msgBind(1,data);
    },
    //相关搜索答案点击事件
   onSugguestionsEvent : function(){
      var _txt = $(this).text();
      if(_txt){
        //获取点击内容
        // var _msg = _txt.substr(_txt.indexOf(':')+1,_txt.length).trim();
        var _msg = _txt.substr(0,_txt.indexOf(':')).trim();
        fnEvent.trigger('sendArea.send',[{
                'answer' : _msg,
                'uid' : global.apiInit.uid,
                'cid' : global.apiInit.cid,
                'currentStatus':'robot',
                'requestType':'question',
                'token':'',
                'dateuid' : global.apiInit.uid + +new Date()
            }]);
        }
    },
    //上传图片
    onUpLoadImg:function(data){
      sendTimer = setInterval(function(){
        if(sendTime>=5){//发送超过60秒判断上传失败
          clearInterval(sendTimer);
          $('#userMsg'+data[0]['token']).removeClass('close msg-close').addClass('error msg-fail');
        }
        sendTime +=1;
      },1000);
      msgBind(4,data);
    },
    onUpLoadImgProgress:function(data){
      var $shadowLayer,
          $progress,
          $progressLayer,
          oldH;
      if(isUploadImg){
          $shadowLayer = $('#img'+sys.config.uploadImgToken).find('.js-shadowLayer');
          $progress = $('#progress'+sys.config.uploadImgToken);
          $progressLayer = $('.js-progressLayer');
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
        $progressLayer.remove();
        myScroll.refresh();//刷新
      }
    },
    //回传图片路径地址
    onUploadImgUrl:function(data){
      // console.log(data);
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
      // console.log(data);
      clearInterval(userTimer);//停止超时提示任务
      clearInterval(adminTimer);
      var msg='';
      if(data){
        switch (data.status) {
          case 1:
          msg = Comm.format(sysPromptLan.L0001,[data.aname],true);
            break;
          case 2:
          // msg = Comm.format(sysPromptLan.L0001,[data.aname],true);
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
      // console.log(data);
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
            $('#userMsg'+data.msgId).removeClass('msg-close').addClass('error msg-fail');
          }
        }
      }
    },
    //消息重发
    onMsgSendAgain:function(){
      var that = $(this);
      var sendType,//发送类型
          answer,//发送内容
          isImgUploadSuccess=true;//是否上传成功
      var msgId = that.attr('id').substr(7,that.attr('id').length);
      // var msgId = that.attr('id');
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
          that.removeClass('error msg-sendAgain').addClass('msg-close close');//图片重发过程可点击取消
          //FIXME 判断图片是否上传成功，若成功则只需重发图片，若不成功则需重新上传一次
          var $p = that.prev().find('p');
          if($p.find('img').hasClass('uploadedFile')){
            isImgUploadSuccess=true;
            answer = $p.html();
          }else {
            isImgUploadFail=false;
            var base64 = $p.find('img').attr('src');
            fnEvent.trigger('listMsg.imgUploadAgain',{'base64':base64,'token':msgId});
          }
        }
        //重发消息
        if(isImgUploadSuccess){
          fnEvent.trigger('sendArea.send',[{
             'answer' :answer,
             'uid' : global.apiInit.uid,
             'cid' : global.apiInit.cid,
            'dateuid':msgId,
             'currentStatus':sys.config.currentState==1?'robot':'human',
             'date': +new Date(),
             'token':msgId,
             'sendAgain':true//是否重发
          }]);
        }
      }else if(that.hasClass('close')){
        //点击关闭按钮 重新发送
        that.removeClass('close msg-close').addClass('msg-sendAgain error');
        fnEvent.trigger('leftMsg.closeUploadImg',msgId);
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
          //清空系统提示语
          // $('.js-sysMsg').remove();
          // console.log('admins');
        }
        adminTime += 1;
        if(adminTime * 1000 >= global.apiConfig.adminTipTime * 1000 * 60){
        // if(adminTime * 1000 >= 1000 * 5){
          adminTime=0;//清空
          var index = global.apiConfig.adminTipWord.indexOf('<');
          var msg = index<0?global.apiConfig.adminTipWord:$(global.apiConfig.adminTipWord).text();
          //提示客服超时语
          var data = {
            type:'system',
            status:'adminoffline',
            data:{
              content:msg,
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
          //清空系统提示语
          // $('.js-sysMsg').remove();
          // console.log('user');
        }
        userTime += 1;
        if(userTime * 1000 >= global.apiConfig.userTipTime * 1000 * 60){
        // if(userTime * 1000 >= 1000 * 3){
          userTime=0;//清空
          //提示客服超时语
          var index = global.apiConfig.userTipWord.indexOf('<');
          var msg = index<0?global.apiConfig.userTipWord:$(global.apiConfig.userTipWord).text();
          var data = {
            type:'system',
            status:'useroffline',
            data:{
              content:msg,
              status:0
            }
          };
          msgBind(2,data);
        }
      },1000);
    },
    //图片展示
    onShowImg:function(){
      var that = $(this);
      var comf = $.extend({
          // msg:'http://www.3987.com/ps/uploadfile/2013/0327/20130327045318527.jpg'
          msg:that.attr('src')
        });
      var tmpHtml = doT.template(msgTemplate.showMsgLayer)(comf);
      $(document.body).append(tmpHtml);

      $('.js-showMsgLayer').animate({'transform':'scale(1)','opacity':'1'},200);
      $('.js-showMsgLayer').on('click',function(){
        $(this).animate({'opacity':'0'},200,function(){
          $(this).remove();
        });
      });
    }
  };
  var parseDOM = function(){
    chatPanelList = $('.js-chatPanelList');
  };
  var bindListener = function(){

    fnEvent.on('sendArea.send',sys.msg.onSend);//发送内容
    fnEvent.on('core.onreceive',sys.msg.onReceive);//接收回复
    fnEvent.on('sendArea.createUploadImg',sys.msg.onUpLoadImg);//发送图片
    fnEvent.on('sendArea.uploadImgProcess',sys.msg.onUpLoadImgProgress);//上传进度条
    fnEvent.on('sendArea.uploadImgUrl',sys.msg.onUploadImgUrl);//回传图片路径
    fnEvent.on('core.msgresult',sys.msg.msgReceived);//消息确认收到通知

    //FIXME EVENT
    $('.js-chatPanelList').delegate('.js-answerBtn','click',sys.msg.onSugguestionsEvent);//相关搜索答案点击事件
    $('.js-chatPanelList').delegate('.js-msgStatus','click',sys.msg.onMsgSendAgain);//消息重发
    $('.js-chatPanelList').delegate('.webchat_img_upload','click',sys.msg.onShowImg);//图片展示
    // sys.msg.onShowImg();
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
