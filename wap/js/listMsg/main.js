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
        progress,//上传图片进度
        shadowLayer,//蒙板
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
      console.log(data);
        // msgTemplate
        var comf,
            sysHtml ='',
            dataLen = data.length,
            item = '',
            itemLan = 0,
            itemChild = '',
            msgHtml = '',
            userLogo = 'http://img.sobot.com/console/common/face/user.png',
            customLogo = '',
            oldCid = '',
            oldTime='',//上一次时间
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
                            'userLogo' : itemChild.senderFace,
                            'userMsg' : itemChild.msg
                        });
                        msgHtml = doT.template(msgTemplate.rightMsg)(comf);
                    } else {
                        //机器人：1    人工客服：2
                        comf = $.extend({
                            'customLogo' : itemChild.senderFace,
                            'customName' : itemChild.senderName,
                            'customMsg' : itemChild.msg
                        });
                        msgHtml = doT.template(msgTemplate.leftMsg)(comf);
                    }
                    //时间线显示
                    var curTime = new Date();
                    var _t = Math.abs(curTime - new Date(itemChild.ts.substr(0,itemChild.ts.indexOf(' '))))/1000/60/60/24;
                    if(oldTime){
                      var _m = Math.abs(new Date(oldTime)- new Date(itemChild.ts))/1000/60;
                      if(Number(_m)>1){
                        //大于一分钟  0 当天  1上一天 2更久历史
                        var type = _t<=1?0:_t>1&&_t<=2?1:2;
                        msgHtml += sysHander.getTimeLine(type,itemChild.ts);
                      }
                    }
                    oldTime = itemChild.ts;
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

    var initScroll = function(){
      scrollHanlder.scroll.on('slideDown',onPullDown);
      global.flags.moreHistroy = true;
    };
    //下拉刷新
    var onPullDown = function(){
      scrollHanlder.pullDown(function(data){
        if(data.length>0){
          console.log(data);
          showHistoryMsg(data);
          global.flags.moreHistroy = true;
        }else{
          //没有历史记录
          global.flags.moreHistroy = false;
        }

      });
    };
    //发送消息绑定到页面
    /*
    *FIXME  msgType 0 是发送消息  1 是接入消息 2 系统消息  3系统時間 4 上传图片
    */
    var bindMsg = function(msgType,data){
      var msgHtml,
          comf;
      if(data){
        switch (msgType) {
          case 0:
              comf = $.extend({
                  userLogo : global.userInfo.face,
                  userMsg : data[0]['answer']
              });
              msgHtml = doT.template(msgTemplate.rightMsg)(comf);
            break;
          case 1:
              //FIXME 类型判断  answerType=4 相关搜索 另形判断
              var _logo,_name,_msg,_type,_list;
              _type=data.type,
              _list=data.list;

              for(var i=0;i<_list.length;i++){
                var _content = _list[i].content;
                for(var j=0;j<_content.length;j++){
                  var _data = _content[i];
                  if(_data.answerType=='4'){
                    //相关搜索
                    msgHtml = msgHander.sugguestionsSearch(_data);
                  }else{
                    //判断是机器人还是客服回复
                    if(_type=='robot'){
                      _logo =global.apiConfig.robotLogo;
                      _name = global.apiConfig.robotName;
                      _msg =_data.answer;
                    }else if(_type=='human'){
                      _logo=_data.aface;
                      _name=_data.aname;
                      _msg=_data.content;
                    }
                    comf = $.extend({
                      customLogo : _logo,
                      customName : _name,
                      customMsg : _msg

                    });
                    msgHtml = doT.template(msgTemplate.leftMsg)(comf);
                  }
                }

              }
            break;
          case 2:
            comf = $.extend({
              sysMsg:data
            });
            msgHtml = doT.template(msgTemplate.sysMsg)(comf);
            break;
          case 3:
            comf = $.extend({
              sysData:data
            });
            msgHtml = doT.template(msgTemplate.sysData)(comf);
            break;
          case 4:
             comf = $.extend({
                userLogo : global.userInfo.face,
                uploadImg : data[0]['base64']
            });
             msgHtml = doT.template(msgTemplate.rightImg)(comf);
            break;
        }
        if(chatPanelList.children().length>0){
          chatPanelList.children().last().after(msgHtml);
        }else{
          //有聊天记录就加到最后一项
          chatPanelList.append(msgHtml);
        }
      scrollHanlder.scroll.refresh();//刷新
      scrollHanlder.scroll.scrollTo(0,-scrollHanlder.scroll.scrollerHeight);
      // document.getElementById('.js-scroller').scrollIntoView(false);
      }
    };
    //包装系统和配置方法
    sysHander = {
      nowTimer:function(){
        //首次进入提示语
        var _now = new Date();
        var _hour = _now.getHours()>=10?_now.getHours():'0'+_now.getHours();
        var _minutes = _now.getMinutes()>=10?_now.getMinutes():'0'+_now.getMinutes();
        var _timer =  '今天' + _hour+':'+_minutes;
        bindMsg(3,_timer);// 3系统时间提示
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
          sysData:_timer
        });
        return  doT.template(msgTemplate.sysData)(comf);
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
      },
      //欢迎语
      gitHello:function(data){
        console.log(data);
        bindMsg(1,data);
      },
      //转接人工
      onSessionOpen:function(data){
        console.log(data);
        bindMsg(1,data);
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
      },
      //上传图片
      onUpLoadImg:function(data){
        // console.log(data);
        var comf = $.extend({
            userLogo : global.userInfo.face,
            uploadImg : data[0]['base64']
        });
        var msgHtml = doT.template(msgTemplate.rightImg)(comf);
      }
    };
    /********************************************************************************/
    /********************************************************************************/
    /*************************************基本配置**********************************/
    /********************************************************************************/
    /********************************************************************************/
    //core加载完成
    var onCoreOnload = function(data) {
        global = data[0];
        initConfig();//配置参数
        initScroll();//初始化&配置scroll
        //FIXME bindListener
        fnEvent.on('sendArea.autoSize',sysHander.onAutoSize);//窗体聊天内容可视范围
        fnEvent.on('sendArea.send',msgHander.onSend);//发送内容
        fnEvent.on('core.onreceive',msgHander.onReceive);//接收回复
        fnEvent.on('sendArea.createUploadImg',msgHander.onUpLoadImg);//发送图片
        fnEvent.on('core.initsession',sysHander.gitHello);//机器人欢迎语
        fnEvent.on('core.system',sysHander.onSessionOpen);//转人工事件
        //FIXME EVENT
        $('.js-chatPanelList').delegate('.js-answerBtn','click',msgHander.onSugguestionsEvent);//相关搜索答案点击事件
    };
    //初始化h5页面配置信息
    var initConfig = function() {
        theme(global,wrapBox);//主题设置
        scrollHanlder = Scroll(global,wrapBox);//初始化scroll
        // sysHander.onAutoSize(48);//默认 设置屏幕高度
        sysHander.nowTimer();//显示当前时间
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
        shadowLayer = $('.js-shadowLayer');
        progress = $('.js-progress');
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
