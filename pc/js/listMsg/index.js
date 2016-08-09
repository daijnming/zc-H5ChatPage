/*
* @author daijm
*/
var ListMsgHandler = function() {
    var global;
    /*var Comm = require('../../../common/comm.js');
    var fnEvent = require('../../../common/util/listener.js');
    var msgTemplate = require('./template.js');
    var ManagerFactory = require('../../../common/mode/mode.js');
    var Promise = require('../../../common/util/promise.js');*/

    var msgHandler = {},//包装消息相关方法 对象方法
        sysHander = {},//包装系统和配置方法 对象方法
        msgSendIdHander=[],//填装发送消息的容器 用于与消息确认匹配
        msgAcknowledgementHandler={},//消息确认容器
        sysMsgManager=[];//系统提示管理  排队中  不在线等提示

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
    var windowAutoSize=function(){
      var $height=$(window).height();
      if($height<=600){
        var chatPanelHeight=$height-60-105;
        console.log(chatPanelHeight);
        $(".js-chatPanel").css("height",chatPanelHeight+"px");
      }
      
    };
    /*************************************基本配置**********************************/
    //初始化h5页面配置信息
    var initConfig = function() {
        
    };
    //初始化Dom
    var parseDOM = function() {
        
    };
    var bindListener = function() {
       $(window).resize(function(){windowAutoSize();})
    };
    var init = function() {
        parseDOM();
        bindListener();
    };
    init();

};
ListMsgHandler();
//module.exports = ListMsgHandler;
