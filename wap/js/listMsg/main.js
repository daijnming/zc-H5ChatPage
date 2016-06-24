/*
* @author denzel
*/
var ListMsgHandler = function() {
    var global,
        scrollHanlder,
        uploadImgToken,//锁定当前上传图片唯一标识
        isUploadImg=true,//是否为上传图片操作
        startScrollY,//原始开始滚动高度  暂未使用
        timer;//输入框高度延迟处理 解决与弹出键盘冲突

    var Comm = require('../../../common/comm.js');
    var fnEvent = require('../../../common/util/listener.js');
    var msgTemplate = require('./template.js');
    var ManagerFactory = require('../../../common/mode/mode.js');
    var Promise = require('../../../common/util/promise.js');
    var theme = require('./theme.js');
    var Scroll = require('./scroll.js');
    var QQFace = require('../util/qqFace.js')();

    var msgHandler = {},//包装消息相关方法
        sysHander = {},//包装系统和配置方法
        sysMsgManager=[];//系统提示管理  排队中  不在线等提示

    // queue:用户排除中  offline:客服不在线  blacklist:被拉黑
    var sysMsgList=['queue','offline','blacklist'];//用于系统提示管理的状态码

    //Dom元素
    var topTitleBar,//顶部栏
        userChatBox,//用户聊天内容背景色
        chatMsgList,//聊天窗体
        wrapScroll,//滚动窗体
        pullDown,//下拉刷新
        chatPanelList,//滚动列表
        progress,//进度条
        shadowLayer,//上传图片蒙板
        wrapBox;//页面

    //消息状态
    var MSGSTATUS={
      MSG_LOADING:'发送中',
      MSG_LSSUED:'已发送',
      MSG_SERVED:'已送达',
      MSG_FAIL:'发送失败'
    };
    //系统提示
    var sysPromptLan ={
      L0001:'您与{0}的会话已经结束',
      L0002:'您已经很长时间未说话了哟，有问题尽管咨询',
      L0003:'您已在新窗口打开聊天页面'
    };

    //api接口
    var api = {
        url_keepDetail : '/chat/user/getChatDetailByCid.action',
        url_detail : '/chat/user/chatdetail.action'
    };

    //展示历史记录 type 用于判断加载第一页数据
    //isFirstData 是否是刚进入页面
    var showHistoryMsg = function(data,isFirstData) {
      // console.log(data);
        var comf,
            sysHtml ='',
            dataLen = data.length,
            item = '',
            itemLan = 0,
            itemChild = '',
            msgHtml = '',
            userLogo = 'http://img.sobot.com/console/common/face/user.png',
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
                    //过滤
                    itemChild.msg = itemChild.msg.replace(/&amp;/g?/&amp;/g:/&amp/g,"&");
                    itemChild.msg = itemChild.msg.replace(/&lt;/g?/&lt;/g:/&lt/g,"<");
                    itemChild.msg = itemChild.msg.replace(/&gt;/g?/&gt;/g:/&gt/g,">");
                    itemChild.msg = itemChild.msg.replace(/&quot;/g?/&quot;/g:/&quot/g,"\"");
                    itemChild.msg = itemChild.msg.replace(/&qpos;/g?/&qpos;/g:/&qpos/g,"\'");
                    //用户
                    if(itemChild.senderType === 0) {
                        comf = $.extend({
                            'userLogo' : itemChild.senderFace,
                            'userMsg' : QQFace.analysis(itemChild.msg.trim()),
                            'date':itemChild.t
                        });
                        msgHtml = doT.template(msgTemplate.rightMsg)(comf);
                    } else {
                        //机器人：1    人工客服：2
                        // console.log(global.apiConfig.robotLogo);
                        comf = $.extend({
                            'customLogo' : itemChild.senderFace!=='null'?itemChild.senderFace:global.apiConfig.robotLogo,
                            'customName' : itemChild.senderName,
                            'customMsg' : itemChild.msg,
                            'date':itemChild.t
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
                        var retMsg = sysHander.getTimeLine(type,itemChild.ts);
                        msgHtml += retMsg?retMsg:'';
                      }
                    }
                    oldTime = itemChild.ts;
                    tempHtml=(tempHtml+msgHtml).replace(reg,'target="_blank"');
                }
            }
            //

            updateChatList(tempHtml,true);
        } else {
            //没有更多消息
            global.flags.moreHistroy = false;
        }
        //刷新
        scrollHanlder.scroll.refresh();
        if(isFirstData){
          scrollHanlder.scroll.scrollTo(0,scrollHanlder.scroll.maxScrollY);
        }
    };
    //更新聊天信息列表
    var updateChatList = function(tmpHtml,isHistory) {
        var _chatPanelList = chatPanelList,
            _chatPanelChildren = '';
        //是否是历史记录
        if(isHistory) {
            _chatPanelChildren = _chatPanelList.children();
            if(_chatPanelChildren && _chatPanelChildren.length) {
                chatPanelList.children().first().before(tmpHtml);
            } else {
                chatPanelList.append(tmpHtml);
            }
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
          // console.log(data);
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
    *FIXME  msgType 0 发送消息  1 接入消息 2 系统消息  3系统時間 4 上传图片
    */
    var bindMsg = function(msgType,data){
      var msgHtml='',
          comf;
      if(data){
        switch (msgType) {
          case 0:
              var msg = Comm.getNewUrlRegex(data[0]['answer'].trim());
              // console.log(msg);
              comf = $.extend({
                  userLogo : global.userInfo.face,
                  userMsg : QQFace.analysis(msg),
                  date:data[0]['date']
              });
              msgHtml = doT.template(msgTemplate.rightMsg)(comf);
            break;
          case 1:
              //FIXME 接收人工工作台消息
              var _logo,_name,_msg,_type,_list;
              _type=data.type;
              _list=data.list;
              for(var i=0;i<_list.length;i++){
                var _data = _list[i];
                //判断类型 robot human
                if(_type=='robot'){
                  //FIXME 机器人类型  answerType=4 相关搜索
                  if(_data.answerType=='4'){
                    //相关搜索
                    msgHtml += msgHandler.sugguestionsSearch(_data);
                  }else{
                    _msg =QQFace.analysis( _data.answer?_data.answer:'')//过滤表情;
                    var index = _msg.indexOf('uploadedFile');
                    var res = index>0?_msg:Comm.getNewUrlRegex(_msg);
                    comf = $.extend({
                      customLogo : global.apiConfig.robotLogo,
                      customName : global.apiConfig.robotName,
                      customMsg : res,
                      date:+new Date()
                    });
                    msgHtml += doT.template(msgTemplate.leftMsg)(comf);
                  }
                }else{
                  //FIXME 客服类型
                  //202 客服发来消息
                  if(_data.type==202){
                    _msg=QQFace.analysis(_data.content?_data.content:'');//过滤表情
                    var index = _msg.indexOf('uploadedFile');

                    var res = index>0?_msg:Comm.getNewUrlRegex(_msg);
                    comf = $.extend({
                      customLogo : _data.aface,
                      customName : _data.aname,
                      customMsg : res,
                      date:+new Date()
                    });
                    msgHtml += doT.template(msgTemplate.leftMsg)(comf);
                  }else  if(_data.type==204){
                    //会话结束
                    msgHtml+=msgHandler.sessionCloseHander(_data);
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
                //生成时间戳
                var tp = +new Date();
                comf = $.extend({
                  sysMsg:$(_data.content).text()?$(_data.content).text():_data.content,
                  sysMsgSign:tp,
                  date:tp
                });
                //是否包含需要处理的系统提示语
                if(sysMsgList.indexOf(data.status)>=0){
                  sysMsgManager.push(tp);
                }
                msgHtml = doT.template(msgTemplate.sysMsg)(comf);
              }else{
                //判断是机器人 | 客服
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
                  customMsg : _msg,
                  date:+new Date()
                });
                msgHtml = doT.template(msgTemplate.leftMsg)(comf);
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
            uploadImgToken = data[0]['token'];
            comf = $.extend({
               userLogo : global.userInfo.face,
               uploadImg : data[0]['result'],
               progress:0,
               token:data[0]['token'],
               date:+new Date()
           });
            msgHtml = doT.template(msgTemplate.rightImg)(comf);
            break;
        }
        msgHandler.updateChatMsg(msgHtml);
        scrollHanlder.scroll.refresh();//刷新
        scrollHanlder.scroll.scrollTo(0,scrollHanlder.scroll.maxScrollY);
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
        clearInterval(timer);
        timer =  setTimeout(function(){
          var offsetTop = node.offset().top-$(topTitleBar).height();
          $(wrapScroll).height(offsetTop);
          scrollHanlder.scroll.refresh();
          scrollHanlder.scroll.scrollTo(0,scrollHanlder.scroll.maxScrollY);
        },300);
      },
      //转接人工
      onSessionOpen:function(data){
        console.log(data);
        bindMsg(2,data);
      },
      //系统提示消息处理
      onSysMsgHandler:function(){
        var _t = setInterval(function(){
          if(sysMsgManager.length>1){
            var sign = sysMsgManager.shift();
            $('#'+sign).remove();
            scrollHanlder.scroll.refresh();
          }
        },5*1000);//每隔5秒处理系统提示消息
      }
    };
    //包装消息相关方法
    msgHandler = {
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
        if(uploadImgToken){
          //FIXME 若是回传上传图片路径则不需要追加消息到聊天列表 直接去替换img即可
          var $div = $('#'+uploadImgToken);
          $div.find('p img:first-child').remove();
          $div.find('p').html(data[0]['answer']);
          uploadImgToken='';//置空 一个流程完成
        }else{
          bindMsg(0,data);
        }
      },
      //接收回复
     onReceive : function(data){
      //  console.log(data);
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
        bindMsg(4,data);
      },
      onUpLoadImgProgress:function(data){
        var $shadowLayer,
            $progress,
            oldH;
        if(isUploadImg){
            $shadowLayer = $('#'+uploadImgToken).find('.js-shadowLayer');
            $progress = $('#progress'+uploadImgToken);
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
          scrollHanlder.scroll.refresh();//刷新
        }
      },
      //加欢迎语
      getHello:function(data){
        showHistoryMsg(data,1);
      },
      //更新聊天记录
      updateChatMsg:function(tempHtml){
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
      },
      //会话结束判断
      // 1：人工客服离线导致用户下线
      // 2：被客服移除
      // 3：被列入黑单
      // 4：长时间不说话
      // 6：有新窗口打开
      sessionCloseHander:function(data){
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
            msg = Comm.format(sysPromptLan.L0002,[data.aname],false);
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
      msgReceived:function(data){
        console.log(data);
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
        fnEvent.on('sendArea.send',msgHandler.onSend);//发送内容
        fnEvent.on('core.onreceive',msgHandler.onReceive);//接收回复
        fnEvent.on('sendArea.createUploadImg',msgHandler.onUpLoadImg);//发送图片
        fnEvent.on('sendArea.uploadImgProcess',msgHandler.onUpLoadImgProgress);//上传进度条
        fnEvent.on('core.initsession',msgHandler.getHello);//机器人欢迎语 调历史渲染接口
        fnEvent.on('sendArea.autoSize',sysHander.onAutoSize);//窗体聊天内容可视范围
        fnEvent.on('core.system',sysHander.onSessionOpen);//转人工事件
        fnEvent.on('core.msgresult',msgHandler.msgReceived);//消息确认收到通知

        //FIXME EVENT
        $('.js-chatPanelList').delegate('.js-answerBtn','click',msgHandler.onSugguestionsEvent);//相关搜索答案点击事件
    };
    //初始化h5页面配置信息
    var initConfig = function() {
        theme(global,wrapBox);//主题设置
        scrollHanlder = Scroll(global,wrapBox);//初始化scroll
        sysHander.nowTimer();//显示当前时间
        sysHander.onSysMsgHandler();//系统提示处理
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
