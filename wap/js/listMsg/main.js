var ListMsgHandler = function() {
    var global;
    var Comm = require('../../../common/comm.js');
    var fnEvent = require('../../../common/util/listener.js');
    var msgTemplate = require('./template.js');
    var ManagerFactory = require('../../../common/mode/mode.js');
    var Promise = require('../../../common/util/promise.js');
    //Dom元素
    var headerBack,//返回条颜色
        userChatBox,//用户聊天内容背景色
        setStyle,//首页样式
        chatMsgList,//聊天窗体
        titleName,//显示标题
        wrapScroll,//滚动窗体
        pullDown,//下拉刷新
        chatPanelList;
    //滚动列表

    //api接口
    var api = {
        url_keepDetail : '/chat/user/getChatDetailByCid.action',
        url_detail : '/chat/user/chatdetail.action'
    };

    //初始化h5页面配置信息
    var initConfig = function() {
        //若有back参数就显示返回状态栏
        var urlParams = Comm.getQueryParam();
        if(urlParams['back'] && urlParams['back'] === 1) {
            $(headerBack).addClass('show');
            $('.js-wrapper').css('top','50px');
        } else {
            $('.js-wrapper').css('top','0px');
        }
        //FIXME  页面配置设置 初始化主题色
        var color = global.apiConfig.color ? global.apiConfig.color : 'rgb(9, 174, 176)';
        $(headerBack).css('background-color',color);
        // $(userChatBox).css('background-color',color);
        $(setStyle).html('.rightMsg .msgOuter::before{border-color:transparent ' + color + '} .rightMsg .msgOuter{background-color:' + color + '}');
        //初始化企业名称
        titleName.text(global.apiConfig.companyName.length > 12 ? global.apiConfig.companyName.substr(0,12) + '..' : global.apiConfig.companyName);
        $(wrapScroll).height($(window).height() - $('.back').height() - $('.chatArea').height());
    };
  $(window).on('resize',function(){
    setTimeout(function(){
      //记录页面高度
      $(wrapScroll).height($(window).height()-$('.back').height()-$('.chatArea').height());
    },200);
    // global.flags.scroll.refresh();
  });
  //初始化滚动插件
  var initScroll = function(){
    if(global.flags.scroll){
      return;
    }else{
      global.flags.scroll = new IScroll(wrapScroll[0], {
          // probeType：1对性能没有影响。在滚动事件被触发时，滚动轴是不是忙着做它的东西。
          // probeType：2总执行滚动，除了势头，反弹过程中的事件。这类似于原生的onscroll事件。
          // probeType：3发出的滚动事件与到的像素精度。注意，滚动被迫requestAnimationFrame（即：useTransition：假）。
          probeType : 3,
          tap : true,
          click : true,// 是否支持点击事件 FIXME 需要设置为TRUE 否则重新接入无法点击
          mouseWheel : true,// 是否支持鼠标滚轮
          useTransition : true,
          useTransform : true,
          snap : false,
          scrollbars : false,// 是否显示滚动条
          bounce : true,// 边界反弹
          momentum : true// 是否惯性滑动
          // startY : -($(pullDown).height())
      });
    }
    //下拉刷新
    pullDownRefresh();
    };
    //下拉刷新
    var pullDownRefresh = function() {
        global.flags.scroll.on('scroll', function() {
            var y = this.y,
                maxY = this.maxScrollY - y;
            // downHasClass = downIcon.hasClass("reverse_icon");

            if(y >= 40) {
                $(pullDown).text('放手开始加载');
                // !downHasClass && downIcon.addClass("reverse_icon");
                // return "";
            } else if(y < 40 && y > 0) {
                if(global.flags.moreHistroy)
                    $(pullDown).text('下拉刷新..');
                else
                    $(pullDown).text('暂无数据..');
                // downHasClass && downIcon.removeClass("reverse_icon");
                // return "";
            }
        });
        global.flags.scroll.on('slideDown', function() {
            if(this.y > 40) {
                $.ajax({
                    type : "post",
                    url : api.url_detail,
                    dataType : "json",
                    data : {
                        uid : global.apiInit.uid,
                        pageNow : global.flags.pageNow,
                        pageSize : global.flags.pageSize
                    },
                    success : function(data) {
                        showHistoryMsg(data);
                        global.flags.moreHistroy = true;
                    }
                });
            }
        });
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
                    // tempHtml=(tempHtml+msgHtml).replace(reg,'target="_blank"');
                    tempHtml += msgHtml;
                }
            }
            updateChatList(tempHtml,true,true);
        } else {
            //没有更多消息
            global.flags.moreHistroy = false;
        }
        console.log(tempHtml);
        //刷新
        global.flags.scroll.refresh();
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
        console.log(data[0]);
        global = data[0];
        initConfig();
        initScroll();
        initBrowserDiff();
        manager = ManagerFactory(global);
        manager.getWelcome().then(function(data,promise) {
            showHistoryMsg(data);
        });

    };
    ///处理移动端浏览器差异性
    var initBrowserDiff = function() {

    };
    var parseDOM = function() {
        headerBack = $('.js-header-back');
        userChatBox = $('.js-userMsgOuter');
        setStyle = $('.setStyle');
        chatMsgList = $('.js-chatMsgList');
        titleName = $('.js-header-back .js-title');
        wrapScroll = $('.js-wrapper');
        pullDown = $('.js-pullDownLabel');
        chatPanelList = $('.js-chatPanelList');
    };

    var bindListener = function() {
        fnEvent.on('core.onload',onCoreOnload);
    };

    var initPlugins = function() {
    };

    var init = function() {
        parseDOM();
        bindListener();
        initPlugins();
    };
    init();

};
module.exports = ListMsgHandler;
