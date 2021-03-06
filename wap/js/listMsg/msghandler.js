
/*
* @author denzel
*/
//msgBind 展示消息到列表
var SysmsgHandler = function(global,msgBind,myScroll){

  //Dom元素
  var chatPanelList;//滚动列表

  //定义变量
  var isUploadImg=true,//是否为上传图片操作
      scrollTimer;//实时定位接收的消息到最底端

  //定义变量
  var autoTimer,//输入框高度延迟处理 解决与弹出键盘冲突
      sendTime=0,//发达消息超时时间 默认为0
      uploadImgHandler={};//上传图片token 判断是否发送或上传成功

  //超时提示
  var overtimer,//超时提示时间任务
      overtimeTask={
      overtimeDaley:0,//超时提示时间
      lastMsgType:0 //最后一句是谁发送的  0 表示客服  1 表示用户
    };

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
    L0003:'您已打开新窗口，刷新可继续会话',
    L0004:'您已长时间未说话，系统自动关闭本次会话，刷新可继续会话'
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
          stripe:data.stripe,
          answer:typeof data.answer === 'object'?data.answer.msg:data.answer //因为历史记录和当前会话推送消息体不一样
        });
        var msg = doT.template(msgTemplate.listSugguestionsMsg)(comf);
        return msg;
      }
      return '非常对不起哦，不知道怎么回答这个问题呢，我会努力学习的。';
    },
    //发送消息
    onSend : function(data){
      if(data&&data[0].answer.indexOf('&nbsp;')>=0){
        var msg = data[0].answer;
        msg = msg.replace(/&nbsp;/g,' ');
        msg = msg.replace(/\s+/g,' ');
        data[0].answer = msg;
      }
      overtimeTask.lastMsgType=1;//最后一条为用户回复
      overtimeTask.overtimeDaley=0;//重置超时提示时间为0
      if(sys.config.currentState==2){
        sys.msg.msgOvertimeTask();//转人工后才计时
      }
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
       //机器人离线判断 0
       if(data.list[0].ustatus===0){
         var _data = {
                      type:'system',
                      status:'robotoffline',
                      data:{
                          content:sysPromptLan.L0004,
                          status:0
                      }};
         msgBind(2,_data);
         fnEvent.trigger('listMsg.robotAutoOffLine',7);//弹起新会话按钮
         return;
       }
     }else if(data.type==='human'){
       overtimeTask.lastMsgType=0;//最后一条为客服回复
       overtimeTask.overtimeDaley=0;//重置超时提示时间为0
       sys.config.currentState=2;
       sys.msg.msgOvertimeTask();//计时
       //用户 客服超时提示语
       if(data&&data.list.length>0){
         for(var i=0,_list=data.list;i<_list.length;i++){
           var _data = _list[i];
           if(_data.type==202||_data.type==210){//202 客服发的消息   210 转接用户
             global.apiConfig.customInfo = {
               type:"human",
               data:{
                   aface:_data.aface?_data.aface:_data.face,
                   aname:_data.aname?_data.aname:_data.name,
                   content:"",
                   status:1
               }
             };
           }
         }
       }
     }
      msgBind(1,data);
      //接收消息 实时滚动到最底部  主要用于解决接收大图片页面不能定位到最底端
      clearInterval(scrollTimer);
      scrollTimer = setTimeout(function(){
          fnEvent.trigger('listMsg.realScrollBottom');
      },500);

    },
    //相关搜索答案点击事件
   onSugguestionsEvent : function(){
      var _txt = $(this).text();
      if(_txt){
        //获取点击内容
        // var _msg = _txt.substr(_txt.indexOf(':')+1,_txt.length).trim();
        var _msg = _txt.substr(0,_txt.indexOf('.')).trim();
        fnEvent.trigger('sendArea.send',[{
                'answer' : _msg,
                'uid' : global.apiInit.uid,
                'cid' : global.apiInit.cid,
                'currentStatus':sys.config.currentState==1?'robot':'human',
                'requestType':'question',
                'token':'',
                'dateuid' : global.apiInit.uid + +new Date(),
                'sendAgain':false//是否重发
            }]);
        }
    },
    //上传图片
    onUpLoadImg:function(data){
      (function(timer){
        sendTime=0;
        uploadImgHandler[timer] = setInterval(function(){
          if(sendTime>=60){//发送超过60秒判断上传失败
            clearInterval(uploadImgHandler[timer]);
            var $uid = $('#userMsg'+timer);
            $uid.removeClass('close msg-close').addClass('error msg-fail');
            //发送失败去掉蒙层
            sys.msg.maskLayer($uid,false);
            fnEvent.trigger('leftMsg.closeUploadImg',timer);
          }
          sendTime +=1;
        },1000);
      })(data[0]['token']);

      msgBind(4,data);
    },
    //处理图片失败遮罩问题
    //openLayer 打开蒙板
    maskLayer:function(ele,showMaskLayer){
      if(ele&&showMaskLayer){
        ele.parents('div.rightMsg').find('.js-shadowLayer').removeClass('hide');
        ele.parents('div.rightMsg').find('.js-progressLayer').removeClass('hide');
      }else{
        ele.parents('div.rightMsg').find('.js-shadowLayer').addClass('hide');
        ele.parents('div.rightMsg').find('.js-progressLayer').addClass('hide');
      }
    },
    onUpLoadImgProgress:function(ret){
      var data = ret.percentage;
      var token = ret.token;
      var $shadowLayer,
          $progress,
          $progressLayer;
      if(isUploadImg){
          $shadowLayer = $('#img'+token).find('.js-shadowLayer');
          $progress = $('#progress'+token);
          $progressLayer = $progress.parent('.js-progressLayer');
      }
      //蒙版高度随百分比改变
      $progress.text(data+'%');
      var floatData = data/100;//获取小数
      if(floatData>=1){
        $('#userMsg'+token).removeClass('error msg-loading msg-fail msg-close msg-sendAgain').addClass('msg-served');
        isUploadImg=true;//开启上传图片
        $shadowLayer.remove();
        $progressLayer.remove();
        // myScroll.refresh();//刷新
        myScroll.myRefresh();//刷新
      }
    },
    //回传图片路径地址
    onUploadImgUrl:function(data){
      //FIXME 若是回传上传图片路径则不需要追加消息到聊天列表 直接去替换img即可
      var token = data[0]['token'];
      var img = data[0]['answer'];
      var $div = $('#img'+token);
      var $img = $div.find('p img');
      $img.attr('src',img);
      sys.config.uploadImgToken='';//置空 一个流程完成
      sys.msg.maskLayer($('#userMsg'+token),false);
      $('#userMsg'+token).remove();
    },
    //会话结束判断
    // 1：人工客服离线导致用户下线
    // 2：被客服移除
    // 3：被列入黑单
    // 4：长时间不说话
    // 6：有新窗口打开
    sessionCloseHander:function(data){
      clearInterval(overtimer);//停止超时提示任务
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
      var sendType,//发送类型
          answer;//发送内容
      var isMsgId = sys.config.msgSendACK.indexOf(data.msgId);
      if(isMsgId>=0){
        if(data.result=='success'){
          //判断图片是否上传成功
          if(uploadImgHandler[data.msgId]){
              clearInterval(uploadImgHandler[data.msgId]);
              sys.msg.maskLayer($('userMsg'+data.msgId),false);
          }
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
        //消息重发
        //重发显示到最后一条
        var oDiv = that.parents('div.rightMsg');
        chatPanelList.append(oDiv);
        //判断当前是图片重发   文字重发
        if(that.hasClass('msg')){
          //文字
          sendType='msg';
          that.removeClass('error msg-fail').addClass('msg-loading');
          answer = that.prev().text().trim();
        }else{
          //发送成功开启蒙层
          sys.msg.maskLayer(that,true);
          //图片
          sendType='img';
          that.removeClass('error msg-fail').addClass('msg-close close');//图片重发过程可点击取消
          //FIXME 判断图片是否上传成功，若成功则只需重发图片，若不成功则需重新上传一次
          var $p = that.prev().find('p');
          if($p.find('img').hasClass('uploadedFile')){
            isImgUploadSuccess=true;
            answer = $p.html();
          }else {
            isImgUploadSuccess=false;
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
        that.removeClass('close msg-close').addClass('msg-fail error');
        fnEvent.trigger('leftMsg.closeUploadImg',msgId);
        //发送失败去掉蒙层
        sys.msg.maskLayer(that,false);
      }
    },
    //来自于客服的消息
    //type --> robot human
    onMsgFromCustom:function(type,data){
      var logo,name,msg;
      if(type=='robot'){
        msg =QQFace.analysis( data.answer?data.answer:'');//过滤表情;
        // msg = data.answer;
        logo = global.apiConfig.robotLogo;
        name = global.apiConfig.robotName;
      }else if(type=='human'){
        msg =QQFace.analysis(data.content?data.content:'');//过滤表情
        logo = data.aface;
        name = data.aname;
      }
      var index = msg.indexOf('webchat_img_upload');
          // index2 = msg.indexOf('uploadedFile');
      var res,
          imgStatus;
      //判断是否是富文本
      if(index>=0){
        imgStatus='imgStatus';
        res = msg;
      }
      if(msg.indexOf('<')>=0 && msg.indexOf('>')>=0){
        res = msg;
      }else{
        res = Comm.getNewUrlRegex(msg);
      }
      var comf = $.extend({
          customLogo : logo,
          customName : name,
          customMsg : res,
          imgStatus:imgStatus,
          date:+new Date()
        });
      var tmpHtml = doT.template(msgTemplate.leftMsg)(comf);
      return tmpHtml;
    },
    //FIXME 超时提示语在收到对方下条提示语之前，当前只提示一次，直到用户下线为止
    msgOvertimeTask:function(){
      clearInterval(overtimer);
      //判断最后一条消息来源
      // var userMsg =  global.apiConfig.userTipWord.indexOf('<')<0?global.apiConfig.userTipWord:$(global.apiConfig.userTipWord).html();//用户提示语
      // var adminMsg = global.apiConfig.adminTipWord.indexOf('<')<0?global.apiConfig.adminTipWord:$(global.apiConfig.adminTipWord).html();//客服提示语
      var userMsg =  global.apiConfig.userTipWord;//用户提示语
      var adminMsg = global.apiConfig.adminTipWord;//客服提示语
      var userDaley = global.apiConfig.userTipTime * 1000 * 60;//用户超时时间
      var adminDaley = global.apiConfig.adminTipTime * 1000 * 60;//客服超时时间

      overtimer = setInterval(function(){
        var _msg,_daley;
        if(!overtimeTask.lastMsgType){//取相反
          //客服
          _msg = userMsg;
          _daley = userDaley;
        }else{
          //用户
          _msg = adminMsg;
          _daley= adminDaley;
        }
        // console.log(overtimeTask.overtimeDaley);
        if(overtimeTask.overtimeDaley * 1000 >= _daley){
          clearInterval(overtimer);
          overtimeTask.overtimeDaley=0;//超时时间重置为0
          global.apiConfig.customInfo.data.content=_msg;//超时提示语
          msgBind(2,global.apiConfig.customInfo);
        }
        overtimeTask.overtimeDaley+=1;//超时时间
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

      $('.js-showMsgLayer').animate({'transform':'scale(1)','opacity':'1'},300,function(){
            var $layer = $('.js-showMsgLayer');
            var $img = $('.js-showMsgLayer').find('img');
            setTimeout(function(){
              $img.css({'margin-top':($layer.height() - $img.height())/2 + 'px','opacity':'1'});
            },100);
      });
      $('.js-showMsgLayer').on('click',function(){
        $(this).animate({'opacity':'0'},300,function(){
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
    $('.js-chatPanelList').delegate('.js-msgOuter img','click',sys.msg.onShowImg);//图片展示
    // sys.msg.onShowImg();
  };
  var initPlagsin=function(){
    var _timer = setInterval(function(){
      //若是人工则开始计算超时时间
      if(sys.config.currentState==2){
        sys.msg.msgOvertimeTask();
        clearInterval(_timer);
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
