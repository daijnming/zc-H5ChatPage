/*
* @author denzel
*/
var ListMsgHandler = function() {
    var global,
        currentState,//当前聊天对象状态  1 智能机器人  2人工客服
        scrollHanlder,
        uploadImgToken,//锁定当前上传图片唯一标识
        isUploadImg=true,//是否为上传图片操作
        startScrollY,//原始开始滚动高度  暂未使用
        inputTimer,//正在输入处理
        scrollerInitHeight,//滚动区域高度
        adminTime=0,//客户超时时间 默认为 0
        userTime=0,//用户超时时间 默认为 0
        userTimer,//用户超时任务
        adminTimer,//客服超时任务
        timer;//输入框高度延迟处理 解决与弹出键盘冲突

    var Comm = require('../../../common/comm.js');
    var fnEvent = require('../../../common/util/listener.js');
    var msgTemplate = require('./template.js');
    var ManagerFactory = require('../../../common/mode/mode.js');
    var Promise = require('../../../common/util/promise.js');
    var theme = require('./theme.js');
    var Scroll = require('./scroll.js');
    var QQFace = require('../util/qqFace.js')();
    var SystemHandler = require('./syshandler.js');
    var MessageHandler = require('./msghandler.js');

    var msgHandler = {},//包装消息相关方法 对象方法
        sysHander = {},//包装系统和配置方法 对象方法
        msgSendIdHander=[],//填装发送消息的容器 用于与消息确认匹配
        msgAcknowledgementHandler={},//消息确认容器
        sysMsgManager=[];//系统提示管理  排队中  不在线等提示

    var systemHandler,//系统模块
        messageHandler;//消息模块

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


    // queue:用户排除中  offline:客服不在线  blacklist:被拉黑
    var sysMsgList=['queue','offline','blacklist','evaluated','firstEvaluate'];//用于系统提示管理的状态码

    //Dom元素
    var topTitleBar,//顶部栏
        userChatBox,//用户聊天内容背景色
        chatMsgList,//聊天窗体
        wrapScroll,//滚动窗体
        scrollChatList,//滚动区域
        pullDown,//下拉刷新
        chatPanelList,//滚动列表
        progress,//进度条
        shadowLayer,//上传图片蒙板
        wrapBox;//页面

    //api接口
    var api = {
        url_keepDetail : '/chat/user/getChatDetailByCid.action',
        url_detail : '/chat/user/chatdetail.action'
    };
    //缺省图片库
    var imgHanlder = {
      userLogo:'//img.sobot.com/console/common/face/user.png'
    };
    //展示历史记录 type 用于判断加载第一页数据
    //isFirstData 是否是刚进入页面
    var showHistoryMsg = function(data,isFirstData) {
        var comf,
            sysHtml ='',
            dataLen = data.length,
            item = '',
            itemLan = 0,
            itemChild = '',
            msgHtml = '',
            userLogo = '',
            customLogo = '',
            oldTime='',//上一次时间
            tempHtml = '',
            imgStatus='',//消息是否为图片
            reg = /target="_self"/g;
        if(data && data.length > 0) {
            for(var i = 0;i < dataLen;i++) {
                item = data[i].content;
                itemLan = item.length;
                for(var j = 0;j < itemLan;j++) {
                    itemChild = item[j];
                    imgStatus='';
                    var index = itemChild.msg.indexOf('uploadedFile');
                    var res;
                    if(index>=0){
                      //图片，文件 上传
                      if(itemChild.msg.indexOf('<img')>=0){
                        res = itemChild.msg;
                      }else{
                        res = $('<div></div>').html(itemChild.msg).text();
                      }
                      // res = itemChild.msg;
                    }else if(itemChild.msg.indexOf('<')>=0&&itemChild.msg.indexOf('>')>=0){
                      //富文本
                        res = itemChild.msg;
                        if(itemChild.msg.indexOf('audio')>=0){
                          //发送语音
                          res = '<div class="audio">'+itemChild.msg+'</div>';
                        }
                    }else{
                      res=Comm.getNewUrlRegex(itemChild.msg);
                    }
                    //判断加载是否是图片
                    if(res.indexOf('webchat_img_upload')>=0){
                      imgStatus="imgStatus";
                    }
                    //FIXME 消息展示时类型判断
                    //用户
                    if(itemChild.senderType === 0) {
                        comf = $.extend({
                            //senderFace 传入有可能是"null"字符串 比较诡异
                            'userLogo' : itemChild.senderFace&&itemChild.senderFace!='null'?itemChild.senderFace:imgHanlder.userLogo,
                            'userMsg' : QQFace.analysisRight(res),
                            'date':itemChild.t,
                            'imgStatus':imgStatus,
                            'msgLoading':MSGSTATUSCLASS.MSG_SERVED//历史记录 标记发送成功
                        });
                        msgHtml = doT.template(msgTemplate.rightMsg)(comf);
                    } else {
                        //机器人：1    人工客服：2
                        // itemChild.sdkMsg.sugguestions = itemChild.sdkMsg.sugguestions || [];
                        if(itemChild.sdkMsg&&(itemChild.sdkMsg.sugguestions||[]).length>0){
                          //FIXME 相关问题搜索
                          msgHtml = messageHandler.msg.sugguestionsSearch(itemChild.sdkMsg,true);
                        }else{
                          comf = $.extend({
                              'customLogo' : itemChild.senderFace?itemChild.senderFace:global.apiConfig.robotLogo,
                              'customName' : itemChild.senderName,
                              'customMsg' : QQFace.analysis(res),
                              'imgStatus':imgStatus,
                              'date':itemChild.t
                          });
                          msgHtml = doT.template(msgTemplate.leftMsg)(comf);
                        }
                    }
                    msgHtml = systemHandler.sys.getTimeLine2(data,itemChild.ts,oldTime) + msgHtml;
                    oldTime = itemChild.ts;
                    tempHtml=(tempHtml+msgHtml).replace(reg,'target="_blank"');
                }
            }
            //
            updateChatList(tempHtml,isFirstData);
        } else {
            //没有更多消息
            global.flags.moreHistroy = false;
        }
    };
    //更新聊天信息列表
    var updateChatList = function(tmpHtml,isFirstData) {
        var _chatPanelList = chatPanelList,
            _chatPanelChildren = _chatPanelList.children();
        if(_chatPanelChildren && _chatPanelChildren.length) {
            chatPanelList.children().first().before(tmpHtml);
        } else {
            chatPanelList.append(tmpHtml);
        }
        //刷新
        //首次进入加载记录
        if(isFirstData){
          // console.log(chatPanelList.children().length);
          if(chatPanelList.children().length==1){
            //只有欢迎语 添加时间线
            var tmsg = systemHandler.sys.getTimeLine2(null,new Date(),false,true);
            chatPanelList.prepend(tmsg);
          }
          scrollHanlder.myRefresh();
          // scrollHanlder.scroll.scrollTo(0,scrollHanlder.scroll.maxScrollY);
          // systemHandler.sys.nowTimer();//显示当前时间
        }else{
          setTimeout(function(){
            var _y = -($(scrollChatList).height() - scrollerInitHeight);
            scrollHanlder.scroll.scrollTo(0,_y);
            scrollerInitHeight = $(scrollChatList).height();
          },2000);
        }
    };

    var initScroll = function(){
      scrollHanlder.scroll.on('slideDown',onPullDown);
      global.flags.moreHistroy = true;
    };
    //下拉刷新
    var onPullDown = function(){
      // $('.js-loadingHistoryMask').addClass('show');
      scrollHanlder.pullDown(function(data){
        if(data.length>0){
          showHistoryMsg(data,0);
          setTimeout(function(){
            // $('.js-loadingHistoryMask').removeClass('show');
            $(pullDown).removeClass('loading');
            $(pullDown).text('下拉加载更多');
          },2000);
          global.flags.moreHistroy = true;
        }else{
          //没有历史记录
          global.flags.moreHistroy = false;
          // $('.js-loadingHistoryMask').removeClass('show');
        }
      });
    };
    //发送消息绑定到页面
    /*
    *FIXME  msgType 0 发送消息  1 接入消息 2 系统消息  3系统時間 4 上传图片
    */
    var bindMsg = function(msgType,data){
      // console.log(data);
      var msgHtml='',
          userLogo = global.userInfo.face?global.userInfo.face:imgHanlder.userLogo,
          comf;
      if(data){
        switch (msgType) {
          case 0:
              var msg = Comm.getNewUrlRegex(data[0]['answer'].trim());
              //FIXME 机器人与人工客服都要进行消息确认
              var msgClass = MSGSTATUSCLASS.MSG_LOADING;
              messageHandler.config.msgSendACK.push(data[0]['dateuid']);//暂存发送消息id
              comf = $.extend({
                  userLogo :userLogo,
                  userMsg : QQFace.analysisRight(msg),
                  date:data[0]['date'],
                  msgId:data[0]['dateuid'],
                  msgLoading:msgClass //消息确认
              });
              msgHtml = doT.template(msgTemplate.rightMsg)(comf);
            break;
          case 1:
              //FIXME 接收人工工作台消息
              var _type=data.type;
              var _list=data.list;
              for(var i=0;i<_list.length;i++){
                var _data = _list[i];
                //判断类型 robot human
                if(_type=='robot'){
                  //FIXME 机器人类型  answerType=4 相关搜索
                  // if(_data.answerType=='4'){
                  if((_data.sugguestions||[]).length>0){
                    //相关搜索
                    msgHtml += messageHandler.msg.sugguestionsSearch(_data,false);
                  }else{
                    msgHtml +=  messageHandler.msg.onMsgFromCustom('robot',_data);
                  }
                }else{
                  //FIXME 客服类型
                  switch (_data.type) {
                    case 202:
                      //客服发来消息
                      msgHtml += messageHandler.msg.onMsgFromCustom('human',_data);
                      break;
                    case 204:
                      //会话结束
                      msgHtml+= messageHandler.msg.sessionCloseHander(_data);
                      break;
                    case 205:
                        //客服正在输入
                        msgHtml += systemHandler.sys.onSysMsgShow(_data.content,_data.type,sysMsgList,sysMsgManager);
                      break;
                  }
                }
              }
            break;
          case 2:
          //系统提示 人工，机器 人欢迎语
              var _type = data.type;
              var _data = data.data;
              //判断是否是系统回复
              if(_type=='system'){
                msgHtml = systemHandler.sys.onSysMsgShow(_data.content,data.status,sysMsgList,sysMsgManager);
              }else{
                //1 机器人  2 客服
                messageHandler.config.currentState = _type=='robot'?1:2;
                msgHtml =  messageHandler.msg.onMsgFromCustom(_type,_data);
              }
            break;
          case 3:
            comf = $.extend({
              sysData:data,
              date:+new Date()
            });
            msgHtml = doT.template(msgTemplate.sysData)(comf);
            break;
          case 4:
            messageHandler.config.uploadImgToken = data[0]['token'];
            messageHandler.config.msgSendACK.push(messageHandler.config.uploadImgToken);//暂存发送消息id
            comf = $.extend({
               userLogo : userLogo,
               uploadImg : data[0]['result'],
               progress:0,
               msgLoading:MSGSTATUSCLASS.MSG_CLOSE,
               token:data[0]['token'],
               date:data[0]['date']
           });
            msgHtml = doT.template(msgTemplate.rightImg)(comf);
            break;
        }
        updateChatMsg(msgHtml);
      }
      // console.log('客服状态 :'+messageHandler.config.currentState);
    };
    //更新聊天记录
    var updateChatMsg = function(tempHtml){
      if(chatPanelList&&chatPanelList.children().length){
          var lastDom = chatPanelList.children().last();
          var _m = Math.abs(new Date()- new Date(Number(lastDom.attr('date'))))/1000/60;
          //超一分钟 显示 时间线
          if(_m>1&&!lastDom.hasClass('sysData')){
            var _t = new Date();
            var hour = _t.getHours()>=10?_t.getHours():'0'+_t.getHours(),
                minutes = _t.getMinutes()>=10?_t.getMinutes():'0'+_t.getMinutes(),
                _time = '今天 '+hour+':'+minutes;
            var comf = $.extend({
              sysData:_time,
              date:+new Date()
            });
            tempHtml = doT.template(msgTemplate.sysData)(comf)+tempHtml;
          }
      }
      chatPanelList.append(tempHtml);
      //FIXME 永存消息只显示最新的一条  当转人工后 需删除排除或不在线提示
      if(sysMsgManager.length>1){
        var sign = sysMsgManager.shift();
        $('#'+sign).animate({'margin-top':'-30px',opacity:'0'},100,function(){
          $(this).remove();
        });
      }
      if(messageHandler.config.currentState===2&&global.apiInit.ustatus!==0){ // 0 是未建立会话
        var sign = sysMsgManager[0];
        var $sign = $('#'+sign);
        if(!$sign.hasClass('firstEvaluate') && !$sign.hasClass('evaluated')){
          $sign.animate({'margin-top':'-30px',opacity:'0'},100,function(){
            $(this).remove();
          });
        }
      }
      // console.log(sysMsgManager,messageHandler.config.currentState,1);
      //FIXME 处理android手机截断聊天内容问题 重新渲染一次
      if(global.UAInfo.UA=='android'){
        $(wrapBox).css('font-size','0.99em');
        setTimeout(function(){
          $(wrapBox).css('font-size','1em');
        },200);
      }
      scrollHanlder.myRefresh();//刷新
      // setTimeout(function(){
      //
      // },2000);
      // scrollHanlder.scroll.refresh();//刷新
      // scrollHanlder.scroll.scrollTo(0,scrollHanlder.scroll.maxScrollY);
    };
    //加欢迎语
    var getHello = function(data){
      // console.log(data);
      //判断智能机器人还是人工客服 1 robot 2 human
      if(data && data.length){
        var _data = data[data.length-1].content[0];
        messageHandler.config.currentState = _data.senderType;
        document.title = '咨询客服_'+global.apiConfig.companyName;
        $('.js-title').text(_data.senderName);
        //FIXME 获取最后一条客服聊天消息 机器人 OR  人工客服
          global.apiConfig.customInfo = {
            type:"human",
            data:{
                aface:_data.senderFace,
                aname:_data.senderName,
                content:"",
                status:1
            }
        };
        showHistoryMsg(data,1);
      }
    };
    //禁止默认事件
    var onStopEvent=function(e){
      //空白处点击 隐藏键盘
      e.preventDefault();
      e.stopPropagation();
    };
    /********************************************************************************/
    /********************************************************************************/
    /*************************************基本配置**********************************/
    /********************************************************************************/
    /********************************************************************************/
    //core加载完成
    var onCoreOnload = function(data) {
        global = data[0];
        // alert(global.UAInfo.UA+":"+global.browser.browser);
        initConfig();//配置参数
        //FIXME bindListener
        fnEvent.on('core.initsession',getHello);//机器人欢迎语 调历史渲染接口
    };
    //初始化h5页面配置信息
    var initConfig = function() {
        theme(global,wrapBox);//主题设置
        scrollHanlder = Scroll(global,wrapBox);//初始化scroll
        scrollerInitHeight = scrollChatList.height();//获取滚动scroll初始化高度
        initScroll();//初始化&配置scroll
        messageHandler = MessageHandler(global,bindMsg,scrollHanlder);
        systemHandler = SystemHandler(global,bindMsg,scrollHanlder);
    };
    //初始化Dom
    var parseDOM = function() {
        topTitleBar = $('.js-header-back');
        userChatBox = $('.js-userMsgOuter');
        chatMsgList = $('.js-chatMsgList');
        wrapScroll = $('.js-wrapper');
        pullDown = $('.js-pullDownLabel');
        chatPanelList = $('.js-chatPanelList');
        wrapBox = $('.js-wrapBox');
        scrollChatList = $('.js-scroller');
    };
    var bindListener = function() {
        fnEvent.on('core.onload',onCoreOnload);
    };
    var init = function() {
        parseDOM();
        bindListener();
    };
    init();

};
module.exports = ListMsgHandler;
