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
      userLogo:'http://img.sobot.com/console/common/face/user.png'
    };
    //展示历史记录 type 用于判断加载第一页数据
    //isFirstData 是否是刚进入页面
    var showHistoryMsg = function(data,isFirstData) {
      console.log(data);
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
            reg = /target="_self"/g;
        if(data && data.length > 0) {
            for(var i = 0;i < dataLen;i++) {
                item = data[i].content;
                itemLan = item.length;
                for(var j = 0;j < itemLan;j++) {
                    itemChild = item[j];
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
                    }else{
                      res=Comm.getNewUrlRegex(itemChild.msg);
                    }
                    //FIXME 消息展示时类型判断
                    //用户
                    if(itemChild.senderType === 0) {
                        comf = $.extend({
                            'userLogo' : itemChild.senderFace?itemChild.senderFace:imgHanlder.userLogo,
                            'userMsg' : QQFace.analysisRight(res),
                            'date':itemChild.t,
                            'msgLoading':MSGSTATUSCLASS.MSG_SERVED//历史记录 标记发送成功
                        });
                        msgHtml = doT.template(msgTemplate.rightMsg)(comf);
                    } else {
                        //机器人：1    人工客服：2
                        // console.log(global.apiConfig.robotLogo);
                        // console.log(itemChild);
                        if(itemChild.sdkMsg&&itemChild.sdkMsg.answerType=='4'){
                          //FIXME 相关问题搜索
                          // msgHtml = msgHandler.sugguestionsSearch(itemChild.sdkMsg,true);
                          msgHtml = messageHandler.msg.sugguestionsSearch(itemChild.sdkMsg,true);
                        }else{
                          comf = $.extend({
                              'customLogo' : itemChild.senderFace?itemChild.senderFace:global.apiConfig.robotLogo,
                              'customName' : itemChild.senderName,
                              'customMsg' : QQFace.analysis(res),
                              'date':itemChild.t
                          });
                          msgHtml = doT.template(msgTemplate.leftMsg)(comf);
                        }
                    }
                    //时间线显示
                    var curTime = new Date();
                    var _t = Math.abs(curTime - new Date(itemChild.ts.substr(0,itemChild.ts.indexOf(' '))))/1000/60/60/24;
                    if(oldTime){
                      // var _m = Math.abs(new Date(oldTime)- new Date(itemChild.ts))/1000/60;
                      var t1 = oldTime.replace(/-/g,'/');
                      var t2 = itemChild.ts.replace(/-/g,'/');
                      var _m = Math.abs(new Date(t1)- new Date(t2))/1000/60;
                      if(Number(_m)>1){
                        //大于一分钟  0 当天  1上一天 2更久历史
                        var type;
                        if(_t<=1){
                            type = 0;
                        }else{
                            type = _t>1&&_t<=2?1:2;
                        }
                        // var type = _t<=1?0:_t>1&&_t<=2?1:2;
                        // var retMsg = sysHander.getTimeLine(type,itemChild.ts);
                        var retMsg = systemHandler.sys.getTimeLine(type,itemChild.ts);
                        msgHtml += retMsg?retMsg:'';
                      }
                    }
                    oldTime = itemChild.ts;
                    tempHtml=(tempHtml+msgHtml).replace(reg,'target="_blank"');
                }
            }
            //
            updateChatList(tempHtml);
        } else {
            //没有更多消息
            global.flags.moreHistroy = false;
        }
        //刷新
        // scrollHanlder.scroll.refresh();
        if(isFirstData){
          scrollHanlder.scroll.scrollTo(0,scrollHanlder.scroll.maxScrollY);
          systemHandler.sys.nowTimer();//显示当前时间
        }else{
          setTimeout(function(){
            var _y = -($(scrollChatList).height() - scrollerInitHeight);
            // console.log($(scrollChatList).height()+':'+_y);
            scrollHanlder.scroll.scrollTo(0,_y);
            scrollerInitHeight = $(scrollChatList).height();
          },2000);
        }
    };
    //更新聊天信息列表
    var updateChatList = function(tmpHtml) {
        var _chatPanelList = chatPanelList,
            _chatPanelChildren = _chatPanelList.children();
            if(_chatPanelChildren && _chatPanelChildren.length) {
                chatPanelList.children().first().before(tmpHtml);
            } else {
                chatPanelList.append(tmpHtml);
            }
    };

    var initScroll = function(){
      scrollHanlder.scroll.on('slideDown',onPullDown);
      global.flags.moreHistroy = true;
    };
    //下拉刷新
    var onPullDown = function(){
      scrollHanlder.pullDown(function(data){
        if(data.length>0){
          showHistoryMsg(data,0);
          setTimeout(function(){
            $(pullDown).removeClass('loading');
            $(pullDown).text('下拉加载更多');
          },2000);
          global.flags.moreHistroy = true;
        }else{
          //没有历史记录
          global.flags.moreHistroy = false;
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

              //FIXME 消息确认 只在与客服聊天时添加
              // var msgClass = messageHandler.config.currentState==1?MSGSTATUSCLASS.MSG_SERVED:MSGSTATUSCLASS.MSG_LOADING;
              // if(messageHandler.config.currentState==2){
                // messageHandler.config.msgSendACK.push(data[0]['dateuid']);//暂存发送消息id
              // }
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
                  if(_data.answerType=='4'){
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
                    console.log(_data.type);
                      //客服正在输入
                      // msgHtml += sysHander.onSysMsgShow(sysPromptLan.L0004,_data.type);
                      msgHtml += systemHandler.sys.onSysMsgShow(sysPromptLan.L0004,_data.type,sysMsgList,sysMsgManager);
                      break;
                  }
                }
              }
            break;
          case 2:
          // console.log(data);
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
    };
    //更新聊天记录
    var updateChatMsg = function(tempHtml){
      // console.log(tempHtml);
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
      //FIXME 永存消息只显示最新的一条
      if(sysMsgManager.length>1){
        var sign = sysMsgManager.shift();
        $('#'+sign).animate({'margin-top':'-50px',opacity:'0.1'},500,function(){
          $(this).remove();
        });
      }
      scrollHanlder.scroll.refresh();//刷新
      scrollHanlder.scroll.scrollTo(0,scrollHanlder.scroll.maxScrollY);
      //FIXME 处理android手机截断聊天内容问题 重新渲染一次
      if(global.UAInfo.UA=='android'){
        $(wrapBox).css('font-size','1em');
        setTimeout(function(){
          $(wrapBox).css('font-size','0.9em');
        },100);
      }
    };
    //加欢迎语
    var getHello = function(data){
      // console.log(data);
      //判断智能机器人还是人工客服 1 robot 2 human
      if(data && data.length){
        messageHandler.config.currentState = data[data.length-1].content[0]['senderType'];
        document.title = data[data.length-1].content[0]['senderName'];
        $('.js-title').text(data[data.length-1].content[0]['senderName']);
      }
      showHistoryMsg(data,1);
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
        console.log(global);
        initConfig();//配置参数
        //FIXME bindListener
        fnEvent.on('core.initsession',getHello);//机器人欢迎语 调历史渲染接口
        $('.js-chatMsgList').on('click',function(){
          //空白处点击 隐藏键盘
          fnEvent.trigger('listMsg.hideKeyboard');
        });
    };
    //初始化h5页面配置信息
    var initConfig = function() {
        theme(global,wrapBox);//主题设置
        scrollHanlder = Scroll(global,wrapBox);//初始化scroll
        scrollerInitHeight = scrollChatList.height();//获取滚动scroll初始化高度
        initScroll();//初始化&配置scroll
        messageHandler = MessageHandler(global,bindMsg,scrollHanlder.scroll);
        systemHandler = SystemHandler(global,bindMsg,scrollHanlder.scroll);

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
