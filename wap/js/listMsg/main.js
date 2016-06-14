var ListMsgHandler = function() {
    var global,
        scrollHanlder,
        timer;//输入框高度延迟处理 解决与弹出键盘冲突
    var Comm = require('../../../common/comm.js');
    var fnEvent = require('../../../common/util/listener.js');
    var msgTemplate = require('./template.js');
    var ManagerFactory = require('../../../common/mode/mode.js');
    var Promise = require('../../../common/util/promise.js');
    var theme = require('./theme.js');
    var Scroll = require('./scroll.js');

    var msgHander = {},//包装消息相关方法
        sysHander = {};//包装系统和配置方法

    //Dom元素
    var topTitleBar,//顶部栏
        userChatBox,//用户聊天内容背景色
        chatMsgList,//聊天窗体
        wrapScroll,//滚动窗体
        pullDown,//下拉刷新
        chatPanelList,//滚动列表
        wrapBox;//页面

    //消息状态
    var MSGSTATUS={
      MSG_LOADING:'发送中',
      MSG_LSSUED:'已发送',
      MSG_SERVED:'已送达',
      MSG_FAIL:'发送失败'
    };

    //api接口
    var api = {
        url_keepDetail : '/chat/user/getChatDetailByCid.action',
        url_detail : '/chat/user/chatdetail.action'
    };

    //展示历史记录
    var showHistoryMsg = function(data) {
        // msgTemplate
        var comf = $.extend({
            'sysMsg' : global.language.lan['L10012']//没有更多记录
        });
        var sysHtml = doT.template(msgTemplate.sysMsg)(comf),
            dataLen = data.length,
            item = '',
            itemLan = 0,
            itemChild = '',
            msgHtml = '',
            userLogo = 'http://sobot-test.oss-cn-beijing.aliyuncs.com/console/3542411be2184c8cb6b48d66ca1b2730/userandgroup/29dcc1573d524a16b5dfac756e04ba22.JPG',
            customLogo = 'http://sobot-test.oss-cn-beijing.aliyuncs.com/console/3542411be2184c8cb6b48d66ca1b2730/userandgroup/29dcc1573d524a16b5dfac756e04ba22.JPG',
            oldCid = '',
            tempHtml = '';
        reg = /target="_self"/g;
        if(data && data.length > 0) {
            for(var i = 0;i < dataLen;i++) {
                item = data[i].content;
                itemLan = item.length;
                for(var j = 0;j < itemLan;j++) {
                    itemChild = item[j];
                    //用户
                    if(itemChild.senderType === 0) {
                        comf = $.extend({
                            'userLogo' : userLogo,
                            'userMsg' : itemChild.msg
                        });
                        msgHtml = doT.template(msgTemplate.rightMsg)(comf);
                    } else {
                        //机器人：1    人工客服：2
                        var _name,
                            _msg;
                        if(itemChild.senderType == 1) {
                            _name = global.apiConfig.robotName;
                            _msg = global.apiConfig.robotLogo;
                        } else {
                            _name = itemChild.senderName;
                            _msg = itemChild.senderFace;
                        }
                        comf = $.extend({
                            'customLogo' : customLogo,
                            'customName' : _name,
                            'customMsg' : itemChild.msg
                        });
                        msgHtml = doT.template(msgTemplate.leftMsg)(comf);
                    }
                    tempHtml=(tempHtml+msgHtml).replace(reg,'target="_blank"');
                }
            }
            updateChatList(tempHtml,true,true);
        } else {
            //没有更多消息
            global.flags.moreHistroy = false;
        }
        //刷新
        scrollHanlder.scroll.refresh();
    };
    //更新聊天信息列表
    var updateChatList = function(tmpHtml,isHistory,isPullDown) {

        var _chatPanelList = chatPanelList,
            _chatPanelChildren = '',
            dom;
        //是否显示时间线
        if(global.flags.isTimeLine) {
            var comf = $.extend({
                'sysData' : new Date().Format('hh:mm')
            });
            $(_chatPanelList).append(doT.template(msgTemplate.sysData)(comf));
        }
        //是否是历史记录
        if(isHistory) {
            _chatPanelChildren = _chatPanelList.children();
            if(_chatPanelChildren && _chatPanelChildren.length) {
                chatPanelList.children().first().before(tmpHtml);
            } else {
                chatPanelList.append(tmpHtml);
                dom = chatPanelList.children().last();
            }
        }
        //不显示时间线
        global.flags.isTimeLine = false;
        return dom;

    };
    //会话判断
    var initSessions = function(promise) {
        var promise = promise || new Promise();
        global.apiInit.ustatus = -1;
        //FIXME 初始化类型
        //用户当前状态 -2 排队中； -1 机器人； 0 离线； 1 在线；
        if(global.apiInit.ustatus == 1 || global.apiInit.ustatus == -2) {
            //更新会话保持标识
            global.flags.isKeepSessions = true;
        } else if(global.apiInit.ustatus == -1) {
            //拉取会话记录
            $.ajax({
                type : "post",
                url : api.url_keepDetail,
                dataType : "json",
                data : {
                    cid : global.apiInit.cid,
                    uid : global.apiInit.uid
                },
                success : function(data) {
                    promise.resolve(data);
                }
            });
        } else {
            //处理客服类型 机器人、人工、邀请模式
            SwitchModel(global);
        }
        return promise;
    };
    //core加载完成
    var onCoreOnload = function(data) {
        global = data[0];
        initConfig();//配置参数
        initScroll();//初始化&配置scroll
        //加载历史记录
        manager = ManagerFactory(global);
        manager.getWelcome().then(function(data,promise) {
            showHistoryMsg(data);
        });
        //FIXME bindListener
        fnEvent.on('sendArea.autoSize',sysHander.onAutoSize);//窗体聊天内容可视范围
        fnEvent.on('sendArea.send',msgHander.onSend);//发送内容
        fnEvent.on('core.onreceive',msgHander.onReceive);//接收回复
        $('.js-chatPanelList').delegate('.js-answerBtn','click',msgHander.onSugguestionsEvent);//相关搜索答案点击事件
    };
    var initScroll = function(){
      scrollHanlder.scroll.on('slideDown',onPullDown);
      global.flags.moreHistroy = true;
    };
    //下拉刷新
    var onPullDown = function(){
      scrollHanlder.pullDown(function(data){
        if(data.length>0){
          showHistoryMsg(data);
          global.flags.moreHistroy = true;
        }else{
          //没有历史记录
          global.flags.moreHistroy = false;
          $(pullDown).text('没有更多记录');
        }

      });
    };
    //发送消息绑定到页面
    /*
    *FIXME  msgType 0 是发送消息  1 是接入消息 2 系统消息
    */
    var bindMsg = function(msgType,data){
      var msgHtml,
          comf;
      if(data){
        switch (msgType) {
          case 0:
              comf = $.extend({
                  userLogo : global.userInfo.face,
                  userMsg : data[0]['answer'].trim()
              });
              msgHtml = doT.template(msgTemplate.rightMsg)(comf);
            break;
          case 1:
              //FIXME 类型判断  answerType=4 相关搜索 另形判断
              for(var i=0;i<data.length;i++){
                var _data = data[i];
                if(_data.answerType=='4'){
                  //相关搜索
                  msgHtml = msgHander.sugguestionsSearch(_data);
                }else{
                  comf = $.extend({
                    // customLogo : global.apiConfig.robotLogo,
                    // customName : global.apiConfig.robotName,
                    customLogo : _data.aface,
                    customName : _data.aname,
                    customMsg : _data.content
                  });
                  msgHtml = doT.template(msgTemplate.leftMsg)(comf);
                }
              }
            break;
          case 2:
            break;
        }
        if(chatPanelList.children().length>0){
          chatPanelList.children().last().after(msgHtml);
        }else{
          //有聊天记录就加到最后一项
          chatPanelList.append(msgHtml);
        }
      scrollHanlder.scroll.refresh();//刷新
      }
    };
    //包装系统和配置方法
    sysHander = {
      helloMsg:function(){
        //首次进入提示语
      },
      //输入栏高度变化设置
      onAutoSize : function(node){
        clearInterval(timer);
        timer =  setTimeout(function(){
          var offsetTop = node.offset().top-$(topTitleBar).height();
          // console.log('height:'+ ($(window).height() - $(topTitleBar).height() - 48));
          // console.log('offsetTop:'+ (offsetTop - $(topTitleBar).height()));
          $(wrapScroll).height(offsetTop);
          scrollHanlder.scroll.refresh();
        },300);

      }
    };
    //包装消息相关方法
    msgHander = {
      //相关搜索方法
      sugguestionsSearch:function(data){
        if(data){
          var list = data.sugguestions;
          var comf = $.extend({
            list:list,
            stripe:data.stripe
          });
          var msg = doT.template(msgTemplate.listSugguestionsMsg)(comf);
          return msg;
        }
        return '非常对不起哦，不知道怎么回答这个问题呢，我会努力学习的。';
      },
      //发送消息
      onSend : function(data){
        console.log(data);
        bindMsg(0,data);
      },
      //接收回复
     onReceive : function(data){
       console.log(data);
        bindMsg(1,data);
      },
      //相关搜索答案点击事件
     onSugguestionsEvent : function(){
        var _txt = $(this).text();
        if(_txt){
          //获取点击内容
          var _msg = _txt.substr(_txt.indexOf(':')+1,_txt.length).trim();
          fnEvent.trigger('sendArea.send',[{
                  'answer' : _msg,
                  'uid' : global.apiConfig.uid,
                  'cid' : global.apiConfig.cid,
                  'date' : global.apiConfig.uid + new Date()
              }]);
        }
      }
    };

    /********************************************************************************/
    /********************************************************************************/
    /*************************************基本配置**********************************/
    /********************************************************************************/
    /********************************************************************************/

    //初始化h5页面配置信息
    var initConfig = function() {
        theme(global,wrapBox);//主题设置
        scrollHanlder = Scroll(global,wrapBox);//初始化scroll
        // sysHander.onAutoSize(48);//默认 设置屏幕高度
        sysHander.helloMsg();//接入提示语
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
