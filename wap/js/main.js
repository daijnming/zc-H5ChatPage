/**
 * Created by Administrator on 2015/7/22.
 */
/**
 * 聊天窗口功能JS
 * */

// 百度统计
var _hmt = _hmt || [];

/* FIXME 需要考虑是否需要将ZC写成function，使用时new即可（暂时没必要） */
/* ZC单例 */
var ZC = ZC || {};
/* 版本 */
ZC.Version = '2.0.1';
/*
 * ZC.namespace 引入命名空间
 * @method namespace
 * @param {String *} pathStr
 * @return {Object} pathParent 返回对象的引用
 * */

var count = 0;



window.onload = function(){
  var isWindowAll = localStorage.getItem('isWindowAll');

  if (isWindowAll === '1') {
    $('.zc-chat_func').css({
      'bottom': 50
    });
  } else {
    $('.zc-chat_func').css({
      'bottom': 0
    });
  }
}

$(window).on('resize', function(){

  setTimeout(function(){
    var bottom = $('.zc-chat_func').css('bottom');
    if (bottom === '50px') {
      $('.zc-chat_func').css({
        'bottom': 0
      });
      localStorage.setItem('isWindowAll', 0);
    } else {
      $('.zc-chat_func').css({
        'bottom': 50
      });
      localStorage.setItem('isWindowAll', 1);
    }
  }, 200);
});

ZC.namespace = function(pathStr) {
    var pathParent = ZC,// 父路径Obj
        pathParentStr = 'ZC',// 父路径Str
        pathArr = pathStr.split('.'),
        pathArrLen = pathArr.length;

    // 处理ZC开头的
    if(pathParentStr === pathArr[0]) {
        pathArr.shift();
        pathArrLen--;
    }
    for(var i = 0,
        item = '';i < pathArrLen;i++) {
        item = pathArr[i];
        if( typeof pathParent[item] === 'undefined') {
            pathParent[item] = {};
        }
        pathParent = pathParent[item];
    }

    return pathParent;
};

/* 配置参数 */
ZC.config = {
    // 目标对象
    targetList : {
        sendBtn : '#sendBtn',
        inputMsg : '#inputMsg',
        loadingObj : '.zc-loading'
    },
    // 可取的参数列表
    paramNameList : ['sysNum','source','tel','uname','partnerId','email','back'],
    // 在禁用操作时是否禁用输入框
    isDisabledInputMsg : false,
    // 是否启用机器人聊天时的动画效果
    isEnabledrobotAnimationEffect : true,
    // 机器人动画效果列表
    robotAnimationEffectList : {
        '抖动' : 'effect-shake',
        '跳一跳' : 'effect-shake',
        '摇摆' : 'effect-rolling',
        '翻转' : 'effect-flip',
        '放大' : 'effect-zoomIn',
        '缩小' : 'effect-zoomOut',
        '开门' : 'effect-openDoor'
    },
    // 是否启用语言包
    isEnableLanguage : true,
    // 语言包
    lan : {
        'L10001' : '暂时无法转接人工客服',
        'L10002' : '您好,{0}接受了您的请求',// 注意多个替换点从0开始
        'L10003' : '您已经与服务器断开连接,{0}',
        'L10004' : '排队中，您在队伍中的第{0}个',
        'L10005' : '您在思考人生？有问题请随时提问哦',
        // FIXME 移除重新接入，暂时拿''空替代，后边需考虑代码优化。
        //'L10006': '<a href="javascript: window.location.reload();">重新接入</a>',
        'L10006' : '',
        'L10007' : '{0}有事离开了{1}',
        'L10008' : '您与{0}的会话已结束{1}',
        'L10009' : '{0}结束了本次会话',
        'L10010' : '您长时间没有说话，本次会话已结束。{0}',
        'L10011' : '{0}您已打开新聊天窗口{1}',
        'L10012' : '没有更多记录',
        'L10013' : '抱歉，您无法接入在线客服',
        'L10014' : '图片过大',
        'L10015' : '格式不支持',
        'L10016' : '正在加载...',
        'L10017' : '正在加载...',
        'L10018' : '下拉显示更多',
        'L10019' : '客服{0}发起了会话',
        'L10020' : '{0}正在输入',
        'L10021' : '本次会话结束{0}',
        'L10022' : '{0} 您可以<a href="javascript: void(0);" id="systemMsgLeaveMessage">留言</a>',
        'L10023' : '{0} <span  id="systemMsgLeaveMsg">请等待</span>'
    },
    // 上传支持的文件后缀
    supportFileExtension : /^(jpg|jpeg|png|gif)$/,
    // 是否支持播放提示音
    isEnableAudio : false,
    // 是否取res.data
    isResData : false,
    // 本地配置的config信息
    customConfig : {
        adminHelloWord : "您好，很高心为您服务，请问有什么需要帮您的？",
        adminNonelineTitle : "您好，当前无客服在线",
        adminTipTime : 2,
        adminTipWord : "抱歉让您久等，客服妹子已经忙翻了，请稍候。",
        companyName : "",
        onORoff : 1,
        robotHelloWord : "<p>您好，请问有什么可以帮您的？</p>",
        robotLogo : "./images/loading.gif",
        robotName : "机器人小智",
        robotUnknownWord : "<p>非常对不起哦，小智不知道怎么回答这个问题呢，我会努力学习的。</p>",
        type : 1,
        userOutTime : 10,
        userOutWord : "您好，由于您长时间未应答，已自动切换到机器人客服。",
        userTipTime : 2,
        userTipWord : "您在思考人生？有问题请随时提问哦~",
        inputTime : 60000,// 一分钟
        status : 0
    },
    // 校验包
    Reg : {
        // 邮箱
        'R1001' : [{
            require : true,
            reg : /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
        },{
            require : '请填写邮箱',
            reg : '邮箱格式错误！'
        }],
        // 留言
        'R1002' : [{
            require : true,
            maxLength : 200
        },{
            require : '请填写问题描述',
            maxLength : '最多可输入200个字符'
        }],
        // 手机号
        'R1003' : [{
            require : true,
            // FIXME !! 座机（需要区号） & 手机号 & 木有400/800电话
            reg : /(^(\d{3,4}-)?\d{7,8})$|(^13\d{9}$)|(^14)[5,7]\d{8}$|(^15[0,1,2,3,5,6,7,8,9]\d{8}$)|(^17)[6,7,8]\d{8}$|(^18\d{9}$)/
        },{
            require : '请输入您的电话',
            reg : '电话号码错误'
        }]
    },
    // 反馈相关的样式列表
    feedbackClassList : {
        'commonMode' : 'commonMode',// 普通模式
        'robotMode' : 'robotMode',// 机器人模式
        'robotMsgMode' : 'robotMsgMode',// 机器人评价模式
        'manualMode' : 'manualMode',// 人工模式
        'manualMsgMode' : 'manualMsgMode' // 人工评价模式
    },
    // funcPanel相关的状态样式表
    funcPanelClassList : {
        'robotOnlyMode' : 'robotOnlyMode',// 仅机器人模式
        'robotMode' : 'robotMode',// 机器人优先模式
        'manualMode' : 'manualMode',// 人工客服模式
        'voiceMode' : 'voiceMode',// 语音通话已提交模式
        'manualWaitMode' : 'manualWaitMode' // 无客服/排队模式
    },
    // voiceCallsPanel相关的状态样式表
    voiceCallsPanelClassList : {
        'defaultMode' : 'defaultMode',// 初始模式
        'failMode' : 'failMode',// 失败模式
        'successMode' : 'successMode' // 成功模式
    },

    leaveMsgLink : window.location.host + '/chat/h5/leaveMessage.html',
    //leaveMsgLink: window.location.host + '/h5/src/leaveMessage.html',

    backArgs : false,//是否有back参数 若有则要显示返回状态栏
    sourceArgs:false//判断来源
};
/* 缓存数据 */
ZC.cacheFlag = {
    status : 'enabled',
    isLoaded : false,
    pageNow : 1,
    pageSize : 15,
    noMoreHistroy : false,
    isConnected : false,// 是否已建立会话连接
    isEnableManual : false,// 客服是否可用
    isEnableOnInput : true,// 是否可以显示客服输入状态
    isGetCustomConfig : false,// 设的一个标识用来判断是否是否已走getCustomConfig
    isEnableBigImg : true,// 默认可以放大图片
    isPeopleModel : false,// 人工模式是否可用
    isWaitModel : false,// 是否处于等待模式
    isTimeLine : false,// 是否显示时间线，默认不显示
    isUserTalked : false,// 是否已聊过
    isSurveyed : false,// 是否已评价
    isKeepSessions : false,// 是否保持会话
    isOutOneMinute : false // 是否已超时一分钟
};
/* 缓存信息类数据 */
ZC.cacheInfo = {
    customConfig : {},// 用户自定义配置
    targetObjList : {},
    dealBrowserDiff : {},
    dealonFocusBrowserDiff : {},
    //  延时任务时间句柄
    timeOutTask : {
        manualTimer : null,
        uploadImg : null,
        userTimer : null,
        updateChatList : null,
        inputMsgFocus : null,
        inputMsgBlur : null,
        isTimeLine : null,
        systemMsgPanel : null,
        robotAnimationEffect : null,
        miuibrowser : null,
        isScroll : null
    },
    // 正在输入标识数组
    onInputArr : [],
    // 正在排队标识数组
    onWaitArr : [],
    // 系统提示信息标识数组
    systemMsgArr : [],
    // host相关信息
    host : {
        protocol : '',
        name : '',
        urlList : {}
    },
    // 图片上传排队标识数组
    onUploadArr : [],
    // dialog对象
    dialog : {}
};
/* 初始化方法 */
ZC.init = function() {
    var _t = this;
    //获取back参数
    //TODO 判断是否有back参数 显示返回状态栏
    var regex = /^(https?)/;
    if(!_t.config.leaveMsgLink.match(regex)) {
        _t.config.leaveMsgLink = 'http://' + _t.config.leaveMsgLink;
    }

    var res = ZC_Extend.getUrlQueryString('back');
    var res1 = ZC_Extend.getUrlQueryString('source');
    if(res && res == '1') {
        _t.config.backArgs = true;
    }
    if(res1){
        _t.config.sourceArgs= true;
        _t.config.sourceVal = res1;
    }

    /* 获取host相关参数 */
    _t.cacheInfo.host.protocol = window.location.protocol;
    /* 获取UA */
    _t.cacheInfo.UA = _t.getUA();
    /* 获取浏览器 */
    _t.cacheInfo.Browser = _t.getBrowser();
    /* 获取Language */
    _t.cacheInfo.lan = _t.getLanguage();
    /* 获取RootPath */
    _t.cacheInfo.rootPath = _t.getRootPath();
    /* 获取eventType */
    _t.cacheInfo.eventType = _t.getEventType();
    /* 获取对象 */
    _t.cacheInfo.targetObjList = _t.getTargetObjList();
    /* 获取URL参数 */
    _t.cacheInfo.urlParamList = _t.getUrlParam();
    /* 获取sysNum */
    _t.cacheInfo.sysNum = _t.cacheInfo.urlParamList.sysNum;
    /* 获取用户信息 */
    _t.cacheInfo.userInfo = _t.getUserInfo();
    /*获取用户url配置的图片路径*/
    _t.cacheInfo.faceImg = ZC_Extend.getUrlQueryString('face');
    /* 初始化Scroll */
    _t.scrollInit();

    //TODO
    /*msgflag  用于判断客户是否后门关闭留言功能*/
    _t.msgFlag = false;
    _t.chatSwitchBox = $('#chatSwitchBox');
    _t.chatSwitch = $('#chatSwitch');
    _t.leaveMessage = $('#leaveMessage');
    _t.chatCameraBox = $('#chatCameraBox');

    /* 1.先用本地配置信息初始化页面 */
    _t.getCustomConfig(_t.config.customConfig);
    /* 2.再调用新API，获取获取用户配置信息，并初始化页面 */
    //_t.cacheInfo.api = new Zhichi("/chat", _t.getCustomConfig, _t.cacheInfo.sysNum, _t.cacheInfo.userInfo, _t.cacheInfo.host.protocol);
    _t.cacheInfo.api = new Zhichi("/chat",_t.cacheInfo.sysNum,_t.cacheInfo.userInfo,_t.cacheInfo.host.protocol);
    //console.log(_t.cacheInfo.api);
    _t.cacheInfo.api.config(function(res) {
        //TODO 开发环境为false 用于留言测试
        if(res.msgflag && res.msgflag == '1')_t.msgFlag = true;

        if(_t.msgFlag && res.type == '1') {

            //$(_t.leaveMessage).show();
            //$(_t.chatSwitch).css('display','none');
            //alert(res.type);
            $(_t.chatSwitchBox).css({
                'width' : '0',
                'padding-right' : '0'
            });
        }

        if(res.chatConnectButton && res.chatConnectButton === 1) {
            $('#chatSwitch').hide();
        }

        // 预加载sprite
        var img = document.createElement('img');
        img.src = '../h5/images/sprite.png';

        _t.getCustomConfig(res);
        //console.log(res);
        _t.cacheInfo.api.init(function(data) {
            _t.config.ustatus = data.ustatus;

            // 用户当前的方位状态：-2.排队中，-1.机器人 0.离线   1.在线
            if(_t.config.ustatus == 1 || _t.config.ustatus == -2) {
                // 更新会话保持标识
                _t.cacheFlag.isKeepSessions = true;
                // 设置cookie
                //_t.setCookie('KeepSessions', 1);
                _t.manualModel();
                return;
            } else if(_t.config.ustatus == -1) {
                // FIXME 拉取会话记录
                _t.cacheInfo.api.getKeepDetail(function(data) {
                    _t.showHistory(data);
                });
                _t.robotModel();
            } else {
                /* 处理客服类型 机器人/人工/邀请模式 */
                _t.switchModel();
            }

            // 满意度评价1分钟限制 FIXME 已与杨兴成确认，时间调整为30秒
            setTimeout(function() {
                _t.cacheFlag.isOutOneMinute = true;
            },1000 * 30);
        });
    });

    /* 获取历史记录 */
    // 默认进来只加载第一页的15条数据
    //_t.cacheInfo.api.chatDetail(_t.showHistory, _t.cacheFlag.pageNow, _t.cacheFlag.pageSize);
    /* 处理客服类型 机器人/人工 */
    //_t.switchModel();
    /* 绑定事件 */
    _t.bindEvent();

    /* 处理浏览器差异 */
    _t.dealBrowserDiff();

    // 百度统计
    (function() {
        var hm = document.createElement("script");
        hm.src = "//hm.baidu.com/hm.js?2e50ba60b0c349c67b38dfbfbefe4321";
        //hm.src = "http://172.16.8.22/chat/robot/load.action";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(hm,s);
    })();
};
/* 获取目标对象 */
ZC.getTargetObjList = function() {
    var _t = this,
        targetObjList = {};

    for(var item in _t.config.targetList) {
        targetObjList[item] = $(_t.config.targetList[item]);
    }

    return targetObjList;
};
/* 获取UA */
ZC.getUA = function() {
    var _t = this,
        uaList = [
    // FIXME 是否添加魅族机器'mz'还需验证。
    'mz','xiaomi','android','ipad','iphone'],
        pcUaList = ['windows','linux'],
        uaListLen = uaList.length,
        pcUaListLen = pcUaList.length,
        userAgent = navigator.userAgent.toLowerCase(),
        uaWidth = $(window).width(),
        uaHeight = $(window).height(),
        uaIndex = 0,
        iphoneVersion = 'iphone-5',
        returnUA = '';

    _t.cacheInfo.uaHeight = uaHeight;
    // 先取手机端UA
    for(var i = 0,
        item = '';i < uaListLen;i++) {

        if(returnUA.length) {
            break;
        }

        item = uaList[i];
        // FIXME 是否需要通过正则来匹配，避免贪婪导致的识别错误
        // 或者处理UA阶段会把iPhone、iPod touch等都识别为iPhone，然后再通过widht&height来区分版本
        uaIndex = userAgent.indexOf(item);
        // 1.需要识别iphone版本
        if(item === 'iphone' && uaIndex > 0) {
            // 依据宽高来判断iPhone版本
            // 返回iPhone版本
            switch (uaWidth) {
                case 320:
                    iphoneVersion = 'iphone-5';
                    // iPhone 4 (4, 4S) && iPhone 5 (5c, 5s)
                    break;
                case 375:
                    iphoneVersion = 'iphone-6';
                    // iPhone 6
                    break;
                case 414:
                    iphoneVersion = 'iphone-6+';
                    // iPhone 6+
                    break;
            }

            // 定义全局的iphoneVersion
            _t.cacheInfo.iphoneVersion = iphoneVersion;
            returnUA = item;
            break;
        }
        // 2.识别其他机器
        if(uaIndex > 0) {
            returnUA = item;
            break;
        }
    }
    // 再取PC端UA
    if(uaIndex <= 0) {
        for(var i = 0,
            item = '';i < pcUaListLen;i++) {
            item = pcUaList[i];
            uaIndex = userAgent.indexOf(item);

            if(uaIndex > 0) {
                returnUA = 'pc';
                break;
            }
        }
    }

    return returnUA;
};
/* 获取Browser */
ZC.getBrowser = function() {
    var browserList = ['mqqbrowser',// QQ浏览器(注意mqqbrowser和qq的顺序)
    'qq',// 手机qq
    'micromessenger',// 微信浏览器
    'ucbrowser',// UC浏览器(注意ucbrowser和safari的顺序)
    'miuibrowser',// 小米浏览器
    'safari',// Safari浏览器
    'opera mobi',// Opera浏览器
    'opera mini',// Opera Mini浏览器
    'firefox' // Firefox浏览器
    ],
        browserListLen = browserList.length,
        userAgent = navigator.userAgent.toLowerCase(),
        uaIndex = 0;

    for(var i = 0,
        item = '';i < browserListLen;i++) {
        item = browserList[i];
        uaIndex = userAgent.indexOf(item);
        if(uaIndex > 0) {
            return item;
        }
    }
};
/*
 * 处理默认浏览器差异
 * */
ZC.dealBrowserDiff = function() {
    var _t = this,
        inputMsg = _t.cacheInfo.targetObjList.inputMsg,
        chatPanel = _t.cacheInfo.targetObjList.chatPanel,
        funcPanel = _t.cacheInfo.targetObjList.funcPanel,
        funcPanelCss = {},
        chatPanelCss = {},
        callbackFunc = function() {
    },
        cacheData = _t.cacheInfo.dealBrowserDiff;

    if(cacheData.hasOwnProperty('isCached') && cacheData.isCached) {
        funcPanelCss = cacheData.funcPanelCss;
        chatPanelCss = cacheData.chatPanelCss;
        callbackFunc = cacheData.callbackFunc;
    } else {
        // iphone
        if(_t.cacheInfo.UA == 'iphone') {

            // 依版本来处理
            if(_t.cacheInfo.Browser == 'mqqbrowser') {
                callbackFunc = function() {
                    $(document).scrollTop('50');
                }
            } else if(_t.cacheInfo.Browser == 'ucbrowser') {
                callbackFunc = function() {
                    $(document).scrollTop('50');
                }
            } else if(_t.cacheInfo.Browser == 'safari') {
                callbackFunc = function() {
                    if(!(inputMsg.val() && inputMsg.val().length > 0)) {
                        inputMsg.val(' ');
                    }
                }
            }
        } else if(_t.cacheInfo.UA == 'mz') {
            switch (_t.cacheInfo.Browser) {
                case 'qq':
                    //funcPanelCss = {'bottom': '0'};
                    break;
                case 'mqqbrowser':
                    // FIXME 输入框输入文字后funcPanel会下沉8个像素，暂时不知道什么原因导致的。
                    //funcPanelCss = {'bottom': '0'};
                    break;
                case 'micromessenger':

                    break;
                case 'ucbrowser':
                    // 安卓 & UC 环境下需要设置bottomBox为fixed定位，否则focus后输入框会飘到顶部
                    //funcPanelCss = {'position': 'fixed', 'bottom': '0'};
                    break;
                case 'miuibrowser':

                    break;
                case 'safari':
                    funcPanelCss = {
                        'position' : 'fixed',
                        'bottom' : '0'
                    };
                    break;
            }
        } else if(_t.cacheInfo.UA == 'xiaomi') {
            if(_t.cacheInfo.Browser == 'miuibrowser') {
                funcPanelCss = {
                    'position' : 'fixed',
                    'bottom' : '0'
                };
            }
        } else if(_t.cacheInfo.UA == 'android') {
            switch (_t.cacheInfo.Browser) {
                case 'qq':
                    funcPanelCss = {
                        'bottom' : '0'
                    };
                    break;
                case 'mqqbrowser':
                    // FIXME 输入框输入文字后funcPanel会下沉8个像素，暂时不知道什么原因导致的。
                    funcPanelCss = {
                        'bottom' : '0'
                    };
                    break;
                case 'micromessenger':

                    break;
                case 'ucbrowser':
                    // 安卓 & UC 环境下需要设置bottomBox为fixed定位，否则focus后输入框会飘到顶部
                    funcPanelCss = {
                        'position' : 'fixed',
                        'bottom' : '0'
                    };
                    break;
                case 'miuibrowser':
                    funcPanelCss ={
                        'position' : 'fixed',
                        'bottom' : '0'
                    };
                    break;
                case 'safari':
                    funcPanelCss = {
                        'position' : 'fixed',
                        'bottom' : '0'
                    };
                    break;
            }
        }

        _t.cacheInfo.dealBrowserDiff = {
            isCached : true,
            funcPanelCss : funcPanelCss,
            chatPanelCss : chatPanelCss,
            callbackFunc : callbackFunc
        }
    }

    if(_t.cacheInfo.UA == 'iphone') {
        if(!(inputMsg.val() && inputMsg.val().length > 0)) {
            inputMsg.val(' ');
        }
    }

    funcPanel.css(funcPanelCss);
    chatPanel.css(chatPanelCss);
    callbackFunc && callbackFunc();
};
/*
 * 处理输入框focus后的浏览器差异
 * */
ZC.dealonFocusBrowserDiff = function() {
    var _t = this,
        inputMsg = _t.cacheInfo.targetObjList.inputMsg,
        chatPanel = _t.cacheInfo.targetObjList.chatPanel,
        funcPanel = _t.cacheInfo.targetObjList.funcPanel,
        funcPanelCss = {},
        chatPanelCss = {},
        callbackFunc = function() {
    },
        scrollHeight = 0,
        minScrollHeight = 0,
        isScroll = false,
        cacheData = _t.cacheInfo.dealonFocusBrowserDiff;

    if(cacheData.hasOwnProperty('isCached') && cacheData.isCached) {
        funcPanel = cacheData.funcPanel;
        funcPanelCss = cacheData.funcPanelCss;
        chatPanel = cacheData.chatPanel;
        chatPanelCss = cacheData.chatPanelCss;
        callbackFunc = cacheData.callbackFunc;
        scrollHeight = cacheData.scrollHeight;
        minScrollHeight = cacheData.minScrollHeight;
        isScroll = cacheData.isScroll;
    } else {
        // iphone
        if(_t.cacheInfo.UA == 'iphone') {
            if(_t.cacheInfo.Browser == 'qq') {
                switch (_t.cacheInfo.iphoneVersion) {
                    case 'iphone-5':
                        scrollHeight = 282;
                        minScrollHeight = 250;
                        break;
                    case 'iphone-6':
                        scrollHeight = 282;
                        minScrollHeight = 250;
                        break;
                    case 'iphone-6+':
                        scrollHeight = 290;
                        minScrollHeight = 250;
                        break;
                }

                isScroll = true;
            } else if(_t.cacheInfo.Browser == 'mqqbrowser') {
                switch (_t.cacheInfo.iphoneVersion) {
                    case 'iphone-5':
                        scrollHeight = 282;
                        minScrollHeight = 250;
                        break;
                    case 'iphone-6':
                        scrollHeight = 282;
                        minScrollHeight = 250;
                        break;
                    case 'iphone-6+':
                        scrollHeight = 300;
                        minScrollHeight = 250;
                        break;
                }

                isScroll = true;
            } else if(_t.cacheInfo.Browser == 'micromessenger') {
                switch (_t.cacheInfo.iphoneVersion) {
                    case 'iphone-5':
                        scrollHeight = 326;
                        minScrollHeight = 250;
                        break;
                    case 'iphone-6':
                        scrollHeight = 350;
                        minScrollHeight = 250;
                        break;
                    case 'iphone-6+':
                        scrollHeight = 350;
                        minScrollHeight = 250;
                        break;
                }

                isScroll = true;
            } else if(_t.cacheInfo.Browser == 'ucbrowser') {
                switch (_t.cacheInfo.iphoneVersion) {
                    case 'iphone-5':
                        scrollHeight = 282;
                        minScrollHeight = 250;
                        isScroll = true;
                        callbackFunc = function() {
                            if($(document).scrollTop() > minScrollHeight) {
                                isScroll = false;
                                funcPanelCss = {
                                    'bottom' : '-40px',
                                    'position' : 'absolute',
                                    'top' : 'auto'
                                };
                            }
                        };

                        break;
                    case 'iphone-6':
                        scrollHeight = 282;
                        minScrollHeight = 250;
                        isScroll = true;
                        break;
                    case 'iphone-6+':
                        scrollHeight = 300;
                        minScrollHeight = 250;
                        isScroll = true;
                        break;
                }
            } else if(_t.cacheInfo.Browser == 'safari') {
                switch (_t.cacheInfo.iphoneVersion) {
                    case 'iphone-5':
                        scrollHeight = 282;
                        minScrollHeight = 250;
                        break;
                    case 'iphone-6':
                        scrollHeight = 282;
                        minScrollHeight = 250;
                        break;
                    case 'iphone-6+':
                        scrollHeight = 300;
                        minScrollHeight = 250;
                        break;
                }

                isScroll = true;
            }
        } else if(_t.cacheInfo.UA == 'mz') {
            switch (_t.cacheInfo.Browser) {
                case 'qq':
                    //funcPanelCss = {'bottom': '0'};
                    break;
                case 'mqqbrowser':
                    // FIXME 输入框输入文字后funcPanel会下沉8个像素，暂时不知道什么原因导致的。
                    //funcPanelCss = {'bottom': '0'};
                    break;
                case 'micromessenger':

                    break;
                case 'ucbrowser':
                    // 安卓 & UC 环境下需要设置bottomBox为fixed定位，否则focus后输入框会飘到顶部
                    //funcPanelCss = {'position': 'fixed', 'bottom': '0'};
                    break;
                case 'miuibrowser':
                    break;
                case 'safari':
                    funcPanelCss = {
                        'position' : 'fixed',
                        'bottom' : '270px'
                    };
                    break;
            }
        } else if(_t.cacheInfo.UA == 'xiaomi') {
            if(_t.cacheInfo.Browser == 'miuibrowser') {
                funcPanelCss = {
                    'position' : 'fixed',
                    'bottom' : '0'
                };
            }
        } else if(_t.cacheInfo.UA == 'android') {
            switch (_t.cacheInfo.Browser) {
                case 'qq':
                    funcPanelCss = {
                        'bottom' : '0'
                    };
                    break;
                case 'mqqbrowser':
                    // FIXME 输入框输入文字后funcPanel会下沉8个像素，暂时不知道什么原因导致的。
                    funcPanelCss = {
                        'bottom' : '0'
                    };
                    break;
                case 'micromessenger':

                    break;
                case 'ucbrowser':
                    funcPanelCss = {
                        'position' : 'fixed',
                        'bottom' : '0'
                    };
                    isScroll = true;
                    break;
                case 'miuibrowser':

                    break;
                case 'safari':
                    //funcPanelCss = {'position': 'fixed', 'bottom': '230px'};
                    //
                    //isScroll = true;
                    break;
            }
        }

        // 缓存数据
        _t.cacheInfo.dealonFocusBrowserDiff = {
            isCached : true,
            funcPanel : funcPanel,
            funcPanelCss : funcPanelCss,
            chatPanel : chatPanel,
            chatPanelCss : chatPanelCss,
            callbackFunc : callbackFunc,
            scrollHeight : scrollHeight,
            minScrollHeight : minScrollHeight,
            isScroll : isScroll
        }
    }

    if(isScroll) {
        _t.timeOutTaskFunc('isScroll',500, function() {
            var scrollTopVal = ($(document).scrollTop() > minScrollHeight ? $(document).scrollTop() : scrollHeight);
            $(document).scrollTop(scrollTopVal);
        });
    }

    funcPanel.css(funcPanelCss);
    chatPanel.css(chatPanelCss);
    callbackFunc && callbackFunc();
};
/*
 * 获取本地配置的语言包
 * @return {object} Object|null
 * */
ZC.getLanguage = function() {
    var _t = this;

    if(_t.config.isEnableLanguage) {
        return _t.config.lan;
    }

    return null;
};
/*
 * 处理Lan
 * @param {String} lan
 * @param {Array} arr 替换的内容
 * @return {Array|String} 返回处理后的lan
 * */
ZC.formatLan = function(lan,arr) {
    var reg = /\{(\d+)\}/g;

    // 判断是否存在替换标识{0}、{1}等，判断替换项是否为数组
    if(reg.test(lan) && arr && $.isArray(arr)) {
        return lan.replace(reg, function(m,i) {
            return arr[i];
        });
    }

    return lan;
};
/*
 * 获取RootPath
 * */
ZC.getRootPath = function() {
    var pathName = window.location.pathname.substring(1),
        webName = pathName == '' ? '' : pathName.substring(0,pathName.indexOf('/'));

    return window.location.protocol + '//' + window.location.host + '/' + webName + '/';
};
/* 定义单击事件类型 */
ZC.getEventType = function() {
    var _t = this;
    return 'click';
    if(_t.cacheInfo.UA == 'xiaomi') {
        //小米是mousedown事件
        return 'mousedown';
    } else if(_t.cacheInfo.UA != 'pc') {
        var isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),
            hasTouch = 'ontouchstart' in window && !isTouchPad;
        return hasTouch ? 'touchstart' : 'mousedown';
    } else {
        return 'click';
    }
};
/* 绑定事件 */
ZC.bindEvent = function() {
    var _t = this,
        customConfig = _t.cacheInfo.customConfig,
        eventType = _t.cacheInfo.eventType,
        docEventType = _t.cacheInfo.UA == 'xiaomi' ? 'touchstart' : eventType,
        bigImgEventType = _t.cacheInfo.UA == 'xiaomi' ? 'click' : eventType,
        targetObjList = _t.cacheInfo.targetObjList,
        goBackBtn = _t.cacheInfo.targetObjList.goBackBtn,
        sendBtnObj = _t.cacheInfo.targetObjList.sendBtn,
        inputMsg = _t.cacheInfo.targetObjList.inputMsg,
        chatPanel = _t.cacheInfo.targetObjList.chatPanel,
        chatPanelList = _t.cacheInfo.targetObjList.chatPanelList,
        chatSwitch = _t.cacheInfo.targetObjList.chatSwitch,
        chatCamera = _t.cacheInfo.targetObjList.chatCamera,
        chatCameraBox = _t.cacheInfo.targetObjList.chatCameraBox,
        bigImgPanel = _t.cacheInfo.targetObjList.bigImgPanel,
        bigImgPanelBox = _t.cacheInfo.targetObjList.bigImgPanelBox;

    /* 绑定document空白事件 */
    _t.bindTargetEvent($(document),docEventType, function(e) {
        var tagName = e.target.tagName,
            tagClass = e.target.className,
            parentClass = e.target.parentElement ? e.target.parentElement.className : null;

        // 排除一些标签
        if(tagName !== "INPUT" && tagName !== "A" && tagName !== "IMG" && tagName !== "TEXTAREA" && parentClass != 'zc-chat_func__switch' && tagClass !== "msgText") {
            inputMsg.trigger('blur');

            _t.stopEvent(e);
        }
    });
    /* 绑定返回按钮点击事件 */
    _t.bindTargetEvent(goBackBtn,eventType, function(e) {
        if(_t.cacheInfo.urlParamList['back']) {
            window.history.back();
            return false;
        }
    });
    /* 绑定发送按钮点击事件 */
    _t.bindTargetEvent(sendBtnObj,eventType, function(e) {
        _t.sendMsg(e);
    });
    /* 绑定回车事件 FIXME 改用keydonw而非keyup来解决回车换行的问题 */
    _t.bindTargetEvent(inputMsg,'keydown', function(e) {
        // 判断状态是否可用
        if(_t.cacheFlag.status === 'disabled') {
            return;
        } else {
            if(13 == e.keyCode || 13 == e.which) {
                _t.sendMsg(e);
            }
        }
    });
    /* 绑定建议项点击事件 */
    _t.bindTargetEvent(chatPanelList,docEventType,'a.answerBtn', function(e) {
        var obj = $(e.currentTarget),
            tmpHtml = obj.html(),
        // 改成截取数字，以便和回复数字保持一致。
            inputMsgVal = tmpHtml.split(':')[0],
            docId = e.currentTarget.dataset['docid'];

        inputMsg.val(inputMsgVal);
        // 发送消息并隐藏键盘
        _t.sendMsg(e,true,docId,inputMsgVal);
    });
    /* 绑定输入框focus事件 */
    _t.bindTargetEvent(inputMsg,'focus', function(e) {
        // 判断状态是否可用
        if(_t.cacheFlag.status === 'disabled') {
            return;
        } else {
            inputMsg[0].focus();

            inputMsg[0].value = 'zcv5';

            // 防止微信输入栏被遮挡
            setTimeout(function() {
              inputMsg[0].value = '';
            }, 30);

            // 启用发送按钮
            _t.enabledFunc(sendBtnObj);
            // FIXME 此处两个timeOutTask是否可以合成一个
            _t.timeOutTaskFunc('inputMsgFocus',300, function() {
                _t.dealonFocusBrowserDiff();
                _t.Scroll.refresh();
            });

            setTimeout(function() {
                _t.scrollRefresh();
            },800);
        }
    });
    /* 绑定输入框blur事件 */
    _t.bindTargetEvent(inputMsg,'blur', function(e) {
        inputMsg[0].blur();

        _t.timeOutTaskFunc('inputMsgBlur',300, function() {
            _t.dealBrowserDiff();
        });
    });
    /* 绑定转人工事件 */
    _t.bindTargetEvent(chatSwitch,eventType, function(e) {
        // 触发输入框focus事件
        // FIXME 安卓在键盘弹起的状态下转人工键盘弹不起来
        //inputMsg.trigger('focus');
        inputMsg.trigger('blur');
        /* 判断是否存在自定义跳转地址 */
        if(!_t.cacheInfo.customConfig.wurl) {
            // 人工客服
            _t.manualModel();
            _t.stopEvent(e);
        }
        // $('#chatSwitchBox').css({'width':'0','padding-right':'0'});
        // $('#leaveMessage').css('display','none');
    });
    /* 绑定语音通话 */
    _t.bindTargetEvent(targetObjList.voiceCalls,eventType, function(e) {
        if(1 !== _t.cacheInfo.customConfig.onORoff || _t.cacheFlag.isSubmitedTelNum || _t.cacheFlag.status === 'disabled') {
            return;
        }
        _t.createVoiceCallsDialog();
    });
    /* 绑定留言点击事件 */
    _t.bindTargetEvent(targetObjList.leaveMessage,eventType, function(e) {
        inputMsg.trigger('blur');
        // 创建或显示留言弹窗
        //TODO H5留言跳转到留言指点定页面
        //window.location.href ='https://test.sobot.com/chat/h5/leaveMessage.html?sysNum='+_t.cacheInfo.api.sysNum+'&uid='+_t.cacheInfo.api.uid;
        //跳转留言页
        //var args = _t.config.backArgs ? [{
        //    'sysNum' : _t.cacheInfo.api.sysNum
        //},{
        //    'uid' : _t.cacheInfo.api.uid
        //},{
        //    'back' : '1'
        //}] : [{
        //    'sysNum' : _t.cacheInfo.api.sysNum
        //},{
        //    'uid' : _t.cacheInfo.api.uid
        //}];
        ZC_Extend.linkAction(_t.config.leaveMsgLink,ZC.UrlParamTransmit());
        //_t.createLeaveMessageDialog();
    });

    /* 绑定上传图片(注意需要绑在img上) */
    _t.bindTargetEvent(chatCameraBox.find('img'),eventType, function(e) {
        // 判断客服状态，是否可用
        if(!_t.cacheFlag.isEnableManual) {
            return;
        }
        // 触发文件上传input的focus事件
        chatCamera.trigger(eventType);
    });
    /* 绑定图片文件域change事件 */
    _t.bindTargetEvent(chatCamera,'change', function(e) {
        var targetObj = e.currentTarget,
            config = {
            quality : 1
        },
            file = targetObj.files[0],
            fileName = '';

        if(customConfig.width) {
            config = {
                width : customConfig.width
            };
        } else {
            if(customConfig.quality) {
                config.quality = customConfig.quality;
            }
        }
        // size单位为字节 10M = 10485760B
        if(file.size >= 10000000) {
            // 图片过大
            _t.showNoticeMsg(_t.cacheInfo.lan['L10014'],"system");
            return;
        }
        // 使用lastIndexOf防止文件名中有多个“.”导致的取后缀出错问题
        fileName = file.name.substring(file.name.lastIndexOf(".") + 1,file.name.length);

        if(!(fileName && _t.config.supportFileExtension.test(fileName.toLocaleLowerCase()))) {
            // 格式不支持
            _t.showNoticeMsg(_t.cacheInfo.lan['L10015'],"system");
            return false;
        } else {
            // 更新排队标识
            _t.cacheInfo.onUploadArr.push(chatPanel.find('.UpIsImg').length);

            // FIXME 可以考虑放入全局或者配置文件中，以便缓存使用
            var userFaceItem = ZC.cacheInfo.faceImg ? ZC.cacheInfo.faceImg : "http://img.sobot.com/console/common/face/user.png";
            //tmpHtml = '<div class="magBox rightMsg"><div class="msgDiv"><p class="msgText">'+ ZC_Extend.getUrlRegex(text)  +'</p></div><div class="userHeader"><img src="'+ZC.cacheInfo.faceImg+'" /></div></div>';
            var str = '<div class="magBox rightMsg UpIsImg"><div class="msgDiv"><p class="msgText"><img src="images/upImgLoad.png" class="webchat_img_uploading"></p></div><div class="userHeader"><img src="' + userFaceItem + '" /></div></div>';
            _t.updateChatList(str);
        }

        /*
        // 老版本
        lrz(file, config, function (res) {
        _t.uploadToServerBase64(res.base64);
        res.base64 = null;
        chatCamera.val('');
        });*/

        // 新版本
        lrz(file).then(function(res) {
            // 处理成功会执行
            _t.uploadToServerBase64(res.base64);
            res.base64 = null;
            chatCamera.val('');
        }).catch(function(err) {
            // 处理失败会执行
            //console.log(err);
        }).always(function() {
            // 不管是成功失败，都会执行
            chatCamera.val('');
        });

    });
    /* 绑定图片放大 */
    //_t.bindTargetEvent(chatPanel, eventType, _t.config.targetList.chatImg, function (e) {
    _t.bindTargetEvent(chatPanel,bigImgEventType,'img', function(e) {
        if(e.currentTarget.className == 'webchat_img_uploading') {
            return;
        }

        // 输入框失去焦点
        inputMsg.trigger('blur');

        // FIXME 此处的延时不能设置太长，否则会导致滚动结束后isEnableBigImg为true。
        setTimeout(function() {
            if(!_t.cacheFlag.isEnableBigImg) {
                return;
            }

            //$(document).scrollTop(0);

            var tmpHtml = $(e.currentTarget).clone();
            bigImgPanelBox.html(tmpHtml);
            bigImgPanel.show();

            return false;
        },500);
    });
    /* 关闭图片放大 */
    _t.bindTargetEvent(bigImgPanel,eventType, function(e) {
        bigImgPanelBox.html('');
        bigImgPanel.hide();
        return false;
    });

    /* 绑定footerOFF相关事件 */
    _t.bindTargetEvent(_t.cacheInfo.targetObjList.footerOFF,docEventType,'span', function(e) {
        // 当前点击的对象的type
        var actionType = $(e.target).data('type');
        if(actionType) {
            switch (actionType) {
                // 满意度
                case 1:
                    _t.createSurveyPeopleDialog();
                    break;
                // 新会话
                case 2:
                    //if (_t.cacheFlag.isKeepSessions) {
                    //    _t.init();
                    //} else {
                    window.location.reload();
                    //}

                    // 清除cookie
                    _t.setCookie('c','');

                    //_t.cacheFlag.isOFF = false;
                    _t.common.footerManage.toggle();
                    // alert();
                    break;
                // 留言
                case 3:
                    //alert();
                    // 创建或显示留言弹窗
                    //TODO 跳转留言页
                    //var args = _t.config.backArgs ? [{
                    //    'sysNum' : _t.cacheInfo.api.sysNum
                    //},{
                    //    'uid' : _t.cacheInfo.api.uid
                    //},{
                    //    'back' : '1'
                    //}] : [{
                    //    'sysNum' : _t.cacheInfo.api.sysNum
                    //},{
                    //    'uid' : _t.cacheInfo.api.uid
                    //}];

                    ZC_Extend.linkAction(_t.config.leaveMsgLink,ZC.UrlParamTransmit());
                    //_t.createLeaveMessageDialog();
                    break;
            }
        }
    });
};
/*
 * 绑定目标元素的事件
 * @param {string|Object} targetObj 目标对象
 * @param {string} eventType 事件类型
 * @param {string} childTarget 子元素
 * @param {string} callback  回调方法
 * */
ZC.bindTargetEvent = function(targetObj,eventType,childTarget,callback) {
    if( typeof targetObj != 'object') {
        targetObj = $(targetObj);
    }

    if(childTarget && typeof childTarget == 'function') {
        var callback = childTarget;

        targetObj.off(eventType).on(eventType, function(e) {
            callback && callback(e);
        });
    } else {
        targetObj.off(eventType).on(eventType,childTarget, function(e) {
            callback && callback(e);
        });
    }
};
/*
 * 解绑事件
 * @param {string|Object} targetObj 目标对象
 * @param {string} eventType 事件方法
 * @param {string} callback  回调方法
 * */
ZC.unbindTargetEvent = function(targetObj,eventType,callback) {
    if( typeof targetObj != 'object') {
        targetObj = $(targetObj);
    }

    targetObj.off(eventType, function(e) {
        callback && callback(e);
    });
};
/*
 * 用户发送消息
 * @param {object} e event对象
 * @param {Boolean} isHidekeyboard 是否隐藏键盘
 * */
ZC.sendMsg = function(e,isHidekeyboard,docId,question) {
    var _t = this,
        api = _t.cacheInfo.api,
        customConfig = _t.cacheInfo.customConfig,
        sendBtnObj = _t.cacheInfo.targetObjList.sendBtn,
        inputMsg = _t.cacheInfo.targetObjList.inputMsg,
        inputMsgVal = inputMsg.val();
    //禁止发送空格
    inputMsgVal =  inputMsgVal.replace(/&nbsp;/g, "");
    inputMsgVal =  inputMsgVal.replace(/&nbsp/g, "");
    // 判断状态是否可用
    if(_t.cacheFlag.status === 'disabled') {
        return;
    } else {
        // 是否已聊天
        _t.cacheFlag.isUserTalked = true;

        // 禁用发送按钮
        _t.disabledFuncCallback && _t.disabledFuncCallback();
        // 启用发送按钮
        _t.cacheFlag.status = 'enabled';
        // 清空输入框数据
        // 触发输入框focus事件
        if(isHidekeyboard) {
            inputMsg.trigger('blur');
        } else {
            inputMsg.trigger('focus');
        }
        inputMsg.val('');

        /* 处理数据 */
        _t.processingData(1,inputMsgVal, function(textData,dom) {

            var robotSendCallback = function(res) {
                var resData = _t.config.isResData ? res.data : res;

                if(res.answerType == 3) {
                    $('#chatSwitch').show();
                }

                if(resData) {
                    // 用户当前的方位状态：-2.排队中，-1.机器人 0.离线   1.在线
                    if(resData.ustatus == 1) {
                        // 更新会话保持标识
                        _t.cacheFlag.isKeepSessions = true;
                        // 设置cookie
                        //_t.setCookie('KeepSessions', 1);
                        _t.manualModel();
                        return;
                    } else if(resData.ustatus == 0) {
                        _t.common.footerManage.toggle(_t.cacheFlag.isSurveyed ? _t.msgFlag ? '1' : '1-2' : _t.msgFlag ? '1' : '0-1-2');
                        return;
                    }

                    // 启用发送按钮
                    _t.enabledFuncCallback && _t.enabledFuncCallback();

                    _t.showRobotMsg(resData);

                    // 触发输入框focus事件
                    if(isHidekeyboard) {
                        inputMsg.trigger('blur');
                    } else {
                        inputMsg.trigger('focus');
                    }
                }
            },
                chatSendCallback = function(res) {
                var resData = _t.config.isResData ? res.data : res;
                if(resData) {
                    if(resData.status == 2) {
                        // 您已经与服务器断开连接,<a href="javascript: window.location.reload();">重新接入</a>
                        _t.showNoticeMsg(_t.formatLan(_t.cacheInfo.lan['L10003'],[_t.cacheInfo.lan['L10006']]),"system");
                    } else {
                        // 启用发送按钮
                        _t.enabledFuncCallback && _t.enabledFuncCallback();

                        // 触发输入框focus事件
                        if(isHidekeyboard) {
                            inputMsg.trigger('blur');
                        } else {
                            inputMsg.trigger('focus');
                        }
                    }
                }
            },
                chatSendErrorCallback = function(err) {

                if(err.statusText) {
                    _t.onResubmit(dom);
                }
            };

            if (textData.indexOf('zcv5')!== -1) {
              console.log('内容已被拦截')
              return false;
            }

            //判断发送类别：人工、机器人
            if(_t.cacheFlag.isPeopleModel) {
                api.chatSend(textData,chatSendCallback,chatSendErrorCallback);
                // 清除超时任务
                _t.clearTimeOutTask();
                //公司客服超时
                _t.manualTimeOutTask();
            } else {
                if(customConfig.type != 2) {
                    api.robotSend({
                        requestText : docId ? docId : textData,
                        question : question ? question : textData,
                        questionFlag : docId ? 1 : 0
                    },robotSendCallback);
                }
            }
        });

        _t.stopEvent(e);
    }
};
/*
 * 显示机器人的消息
 * @param {Object} res  返回的数据
 * */
ZC.showRobotMsg = function(res) {
    var _t = this,
        customConfig = _t.cacheInfo.customConfig,
        chatSwitch = _t.cacheInfo.targetObjList.chatSwitch,
        zcAudio = _t.cacheInfo.targetObjList.zcAudio,
        reg = /target="_self"/g,
        tmpHtml = '';

    //那么智能-机器人优先的模式情况下，人工按钮一进来是隐藏的，只有answerType为3和4的时候，才显示人工按钮
    if(customConfig.chatConnectButton == 1 && (res.answerType == 3 || res.answerType == 4)) {
        if(_t.cacheFlag.isWaitModel == false) {
            chatSwitch.show();
        }
    }
    // 替换打开方式
    res.answer = res.answer ? res.answer.replace(reg,'target="_blank"') : res.answer;

    // 判断是否有相似问法
    if(res.sugguestions) {
        var ulTmp = '<ul class="stionsList">',
            sugguestionsLen = res.sugguestions.length,
            itemObj = {},
            item = '',
            itemIndex = 0;

        for(var i = 0;i < sugguestionsLen;i++) {
            itemObj = res.sugguestions[i];
            item = itemObj.question;
            itemIndex = i + 1;

            item = item.replace("&","&amp;");
            item = item.replace("<","&lt;");
            item = item.replace(">","&gt;");
            item = item.replace("\"","&quot;");
            item = item.replace("\'","&qpos;");

            ulTmp += '<li><a href="javascript:;" class="answerBtn" style="color:' + customConfig.color + '" data-docid="' + itemObj.docId + '">' + itemIndex + ':' + item + '</a></li>';
        }
        ulTmp += '</ul>';

        //tmpHtml = '<div class="magBox leftMsg"><div class="serverHeader"><img src="'+face+'" /></div><div class="serverMsg"><p class="leftName">'
        //
        //    + name
        //    +'</p><div id="msgFlag"></div><div class="msgDiv serverDiv"><p class="msgText">'
        //    + ZC_Extend.getUrlRegex(text)
        //    +'</p></div></div></div>';
        var faceItem = _t.cacheInfo.customConfig.robotLogo ? _t.cacheInfo.customConfig.robotLogo : 'http://img.sobot.com/console/common/face/robot.png';
        tmpHtml = '<div class="magBox leftMsg"><div class="serverHeader"><img src="' + faceItem + '" /></div><div class="serverMsg"><p class="leftName">' + customConfig.robotName + '</p><div id="msgFlag"></div><div class="msgDiv"><p class="msgText">' + (res.answer ? ZC_Extend.getUrlRegex(res.answer) : '') + '</p><p class="stripe">' + (res.stripe ? res.stripe : '') + '</p>' + ulTmp + '</div></div></div>';
    } else {
        tmpHtml = _t.getLeftMsgHtml(customConfig.robotName,res.answer ? res.answer : '',_t.cacheInfo.customConfig.robotLogo);
    }

    _t.updateChatList(tmpHtml);

    // 是否支持播放提示音
    if(_t.config.isEnableAudio) {
        zcAudio[0].play();
    }
};
/*
 * 处理数据
 * @param {string} dataType 数据类型 1:文本 2：图片 3：语音 4：视频
 * */
ZC.processingData = function(dataType,data,callback) {
    var _t = this;

    // 1.判断数据类型
    switch (dataType) {
        case 1:
            _t.processingTextData(data,callback);
            break;
        case 2:
            _t.processingImgData(data,callback);
            break;
        case 3:
            _t.processingRadioData(data,callback);
            break;
        case 4:
            _t.processingVideoData(data,callback);
            break;
    }
};
/*
 * 处理文本数据
 * @param {string} data 数据
 *
 * */
ZC.processingTextData = function(data,callback) {
    var _t = this,
        textData = $.trim(data.toString()),
        regular = /^\s+$/,
        replaceList = [
    /*{
     reg: /(&lt;)/gi,
     res: '<'
     },{
     reg: /(&gt;)/gi,
     res: '>'
     },*/
    {
        reg : /(&quot;)/gi,
        res : '"'
    },{
        reg : /(&qpos;)/gi,
        res : "'"
    },{
        reg : /</gi,
        res : '&lt;'
    },{
        reg : />/gi,
        res : '&gt;'
    }],
        replaceListLen = replaceList.length;

    if(textData.length == 0 || regular.test(textData)) {
        return;
    } else {
        for(var i = 0,
            item;i < replaceListLen;i++) {
            item = replaceList[i];
            textData = textData.replace(item.reg,item.res);
        }

        // 更新聊天窗口
        var dom = _t.updateChatList(_t.getRightMsgHtml(textData));
        // 监听动画效果
        _t.robotAnimationEffect && _t.robotAnimationEffect(textData);

        callback && callback(textData,dom);
    }
};
/*
 * 处理图片数据
 * @param {string} data 数据
 *
 * */
ZC.processingImgData = function(data) {

};
/*
 * 处理语音数据
 * @param {string} data 数据
 *
 * */
ZC.processingRadioData = function(data) {

};
/*
 * 处理视频数据
 * @param {string} data 数据
 *
 * */
ZC.processingVideoData = function(data) {

};
/*
 * 更新聊天信息列表
 * @param {String} tmpHtml 拼装的html数据
 * @param {Boolean} isHistory 是否为历史消息
 * @param {Boolean} isPullDown 是否下拉刷新
 * */
ZC.updateChatList = function(tmpHtml,isHistory,isPullDown) {
    var _t = this,
        chatPanelList = _t.cacheInfo.targetObjList.chatPanelList,
        chatPanelChildren = '',
        dom;

    // 是否显示时间线
    if(_t.cacheFlag.isTimeLine) {
        chatPanelList.append(_t.getCenterMsgHtml(new Date().Format("hh:mm")));
    }

    // 是否是历史消息
    if(isHistory) {
        chatPanelChildren = chatPanelList.children();
        if(chatPanelChildren && chatPanelChildren.length) {
            chatPanelList.children().first().before(tmpHtml);
        } else {
            chatPanelList.append(tmpHtml);
        }
    } else {
        chatPanelList.append(tmpHtml);
        dom = chatPanelList.children().last();
    }

    // 判断是否为第一页，防止Scroll刷新导致的页面闪烁问题。
    if(!isPullDown) {
        _t.timeOutTaskFunc('updateChatList',800, function() {
            // 刷新Scroll
            _t.scrollRefresh();
        });
    }

    // 是否显示时间线
    _t.cacheFlag.isTimeLine = false;
    // 超时任务
    _t.timeOutTaskFunc('isTimeLine',1000 * 60, function() {
        _t.cacheFlag.isTimeLine = true;
    });

    return dom;
};

/*
 * 更新聊天记录发送状态
 * @param {tmpHtml} 要插入的重发图标
 * */
ZC.updateChatState = function(tmpHtml,dom,isReSubmit) {
    var _t = ZC,
        chatPanelList = _t.cacheInfo.targetObjList.chatPanelList,
        chatPanelChildren = chatPanelList.children().last().children(),
        api = _t.cacheInfo.api,
        customConfig = _t.cacheInfo.customConfig,
        targetObjList = _t.cacheInfo.targetObjList,
        inputMsg = targetObjList.inputMsg,
        inputMsgVal = inputMsg.val();

    // 如果是继续重发显示dom状态否则创建新的dom
    isReSubmit ? dom.find('.zc-c-reSubmit-icon').show() : dom.children().before(tmpHtml);

    dom.find('.zc-c-reSubmit-icon').unbind('click').bind('click', function(e) {
        var robotSendCallback = function(res) {
            var resData = _t.config.isResData ? res.data : res;

            if(res.answerType == 3) {
                $('#chatSwitch').show();
            }

            if(resData) {
                // 用户当前的方位状态：-2.排队中，-1.机器人 0.离线   1.在线
                if(resData.ustatus == 1) {
                    // 更新会话保持标识
                    _t.cacheFlag.isKeepSessions = true;
                    // 设置cookie
                    //_t.setCookie('KeepSessions', 1);
                    _t.manualModel();
                    return;
                } else if(resData.ustatus == 0) {
                    // 判断是否需要显示评价
                    //if (_t.cacheFlag.isOutOneMinute && _t.cacheFlag.isUserTalked && !_t.cacheFlag.isSurveyed) {
                    //TODO 不根据时间去判断
                    if(_t.cacheFlag.isUserTalked && !_t.cacheFlag.isSurveyed) {
                        //判断是否后台设置不需要留言
                        _t.common.footerManage.toggle(_t.msgFlag ? '0-1' : '0-1-2');
                    } else {
                        _t.common.footerManage.toggle(_t.msgFlag ? '1' : '1-2');
                    }
                    return;
                }

                // 启用发送按钮
                _t.enabledFuncCallback && _t.enabledFuncCallback();

                _t.showRobotMsg(resData);
            }
        },
            chatSendCallback = function(res) {
            var resData = _t.config.isResData ? res.data : res;

            if(resData) {

                if(resData.status == 2) {

                    // 您已经与服务器断开连接,<a href="javascript: window.location.reload();">重新接入</a>
                    _t.showNoticeMsg(_t.common.formatLan(_t.cacheInfo.lan['L10003'],[_t.cacheInfo.lan['L10006']]),"system");
                } else {

                    // 启用发送按钮
                    _t.enabledFuncCallback && _t.enabledFuncCallback();
                }
            }
        },
            chatSendErrorCallback = function(err) {

            if(err.statusText)
                _t.onResubmit(dom,true);
        },
            textData = dom.find('.msgText').html();

        dom.appendTo(chatPanelList);
        dom.find('.zc-c-reSubmit-icon').hide();

        //判断发送类别：人工、机器人
        if(_t.cacheFlag.isPeopleModel) {
            api.chatSend(textData,chatSendCallback,chatSendErrorCallback);
            // 清除超时任务
            _t.clearTimeOutTask();
            //公司客服超时
            _t.manualTimeOutTask();
        } else {
            if(customConfig.type != 2) {
                // FIXME !!!!! 连续给机器人发送消息会出现接口404
                api.robotSend({
                    requestText : docId ? docId : textData,
                    question : question ? question : textData,
                    questionFlag : docId ? 1 : 0
                },robotSendCallback);
            }
        }
    })
}
/*
 * 功能禁用
 * @param {string|Object} targetObj 目标对象
 * @param {string} callback  回调方法
 * */
ZC.disabledFunc = function(targetObj,callback) {
    if( typeof targetObj != 'object') {
        targetObj = $(targetObj);
    }
    // FIXME 目前就只加了一个disabled的class，后续视情况而定是否还需要其他操作。
    targetObj.addClass('disabled-func');

    callback && callback();
};
/*
 * 禁用发送按钮Callback
 * */
ZC.disabledFuncCallback = function() {
    var _t = this,
        sendBtnObj = _t.cacheInfo.targetObjList.sendBtn,
        inputMsg = _t.cacheInfo.targetObjList.inputMsg;

    _t.disabledFunc(sendBtnObj, function() {
        if(_t.config.isDisabledInputMsg) {
            inputMsg.attr({
                'disabled' : 'disabled'
            }).parent().addClass('disabled-func');
        }
        _t.cacheFlag.status = 'disabled';
        // FIXME 禁用时需要将转人工隐藏

    });
};
/*
 * 功能启用
 * @param {string|Object} targetObj 目标对象
 * @param {string} callback  回调方法
 * */
ZC.enabledFunc = function(targetObj,callback) {
    if( typeof targetObj != 'object') {
        targetObj = $(targetObj);
    }
    // FIXME 目前就只加了一个disabled的class，后续视情况而定是否还需要其他操作。
    targetObj.removeClass('disabled-func');

    callback && callback();
};
/*
 * 启用发送按钮Callback
 * */
ZC.enabledFuncCallback = function() {
    var _t = this,
        sendBtnObj = _t.cacheInfo.targetObjList.sendBtn,
        inputMsg = _t.cacheInfo.targetObjList.inputMsg;

    _t.enabledFunc(sendBtnObj, function() {
        if(_t.config.isDisabledInputMsg) {
            inputMsg.removeAttr('disabled').parent().removeClass('disabled-func');
        }
        _t.cacheFlag.status = 'enabled';
        inputMsg.trigger('focus');
    });
};
/*
 * LOADING
 * @return {Object} loading
 * */
ZC.loading = function() {
    var _t = this,
        loadingObj = _t.cacheInfo.targetObjList.loadingObj,
        showFunc = function() {
        if(loadingObj) {
            if(!_t.cacheFlag.isLoaded) {
                loadingObj.show();
            }
        }
    },
        hideFunc = function() {
        if(loadingObj) {
            if(_t.cacheFlag.isLoaded) {
                loadingObj.hide();
            }
        }
    };

    return {
        show : showFunc,
        hide : hideFunc
    };
};
/*
 * 阻止事件冒泡
 * */
ZC.stopEvent = function(e) {
    //发送完消息
    var event = e || window.event;
    event.returnValue = false;
    event.preventDefault();
    event.stopPropagation();
    return false;
};
/*
 * 初始化滚动条
 * */
ZC.scrollInit = function() {
    var _t = this;

    if(_t.Scroll) {
        return;
    } else {
        _t.Scroll = new IScroll(_t.config.targetList.chatPanel, {
            // probeType：1对性能没有影响。在滚动事件被触发时，滚动轴是不是忙着做它的东西。
            // probeType：2总执行滚动，除了势头，反弹过程中的事件。这类似于原生的onscroll事件。
            // probeType：3发出的滚动事件与到的像素精度。注意，滚动被迫requestAnimationFrame（即：useTransition：假）。
            probeType : 2,
            tap : true,
            click : true,// 是否支持点击事件 FIXME 需要设置为TRUE 否则重新接入无法点击
            mouseWheel : true,// 是否支持鼠标滚轮
            useTransition : true,
            useTransform : true,
            snap : false,
            scrollbars : false,// 是否显示滚动条
            bounce : true,// 边界反弹
            momentum : true,// 是否惯性滑动
            startY : -(_t.cacheInfo.targetObjList.pullDown.height()),
            preventDefaultException : {
                tagName : /^(INPUT|TEXTAREA|BUTTON|SELECT)$/,
                className : /^(msgText)$/
            }
        });

        // 下拉刷新
        _t.pullDownRefresh();

        // 刷新页面
        _t.scrollRefresh();
    }
}
/*
 * 刷新滚动
 * */
ZC.scrollRefresh = function() {
    var _t = this,
        chatPanel = _t.cacheInfo.targetObjList.chatPanel,
        y_index = chatPanel.find('.msgScroll')[0].scrollHeight - chatPanel.height();

    _t.Scroll.refresh();

    if(y_index > 0) {
        _t.Scroll.scrollTo(0,-y_index);
    }
};
/*
 * 获取URL参数，目前支持获取当前页面URL的参数
 * @param {string} url
 * @param {string|Array} paramName 参数名|参数名列表
 * @param {int} returnType 返回类型 0：String 1: Object
 * @return {string|Object} 返回当官参数值或者多个参数的对象
 * */
ZC.getUrlParam = function(paramName,returnType) {
    var _t = this,
        paramNameList = [],
        returnType = returnType === undefined ? 0 : returnType,
        paramUrl = window.location.search.substr(1),
    /*
     * 获取URL参数方法体
     * @param {Array} paramNameList 参数名列表
     * @param {int} returnType 返回类型 0：String 1: Object
     * */
        getUrlParamFunc = function(paramNameList,returnType) {
        var item = '',
            reg = '',
            res = '',
            returnData = returnType === 0 ? '' : {},
            tmpData = '';

        for(var i = 0,
            paramNameListLen = paramNameList.length;i < paramNameListLen;i++) {
            item = paramNameList[i];
            reg = new RegExp("(^|&)" + item + "=([^&]*)(&|$)");
            res = paramUrl.match(reg);
            tmpData = res != null ? decodeURI(decodeURI(res[2])) : null;

            if(returnType === 0) {
                returnData = tmpData;
            } else {
                returnData[item] = tmpData;
            }
        }
        //console.log(returnData);
        return returnData;
    };

    // 获取单个参数
    if(paramName && !$.isArray(paramName)) {
        paramNameList = [paramName];
        returnType = 0;
        // 获取指定参数列表中的参数
    } else if(paramName && $.isArray(paramName)) {
        paramNameList = paramName;
        returnType = 1;
        // 获取config配置中指定的参数
    } else {
        paramNameList = _t.config.paramNameList;
        returnType = 1;
    }

    return getUrlParamFunc(paramNameList,returnType);
};
/*
 * 客服发送消息监听
 * @param {object} event
 * */
ZC.msgListen = function(event) {
    var _t = ZC,
        api = _t.cacheInfo.api,
    //        data = $.parseJSON(event.data),
        data =
        event,
        sName = data.aname || '',// 客服名字
        typeStr = '',// 不同会话状态的拼接不同的提示语
        chatPanel = _t.cacheInfo.targetObjList.chatPanel,
        funcPanel = _t.cacheInfo.targetObjList.funcPanel,
        chatSwitchBox = _t.cacheInfo.targetObjList.chatSwitchBox,
        chatCameraBox = _t.cacheInfo.targetObjList.chatCameraBox,
        isSurveyed,
        tmpType;

    // 判断会话连接状态
    switch (data.type) {
        // 建立连接
        case 0:
            _t.cacheFlag.isConnected = true;
            //_t.updateFuncPanelDom(_t.cacheFlag.isWaitModel);
            break;
        //进入会话
        case 200:
            // 客服状态可用，显示客服欢迎语
            _t.manualHello(data);
            _t.onWaitHide();
            break;
        case 201:
            // "排队中，您在队伍中的第 " + data.count + " 个"
            //_t.showNoticeMsg(_t.formatLan(_t.cacheInfo.lan['L10004'], [data.count]), 'system');
            //_t.cacheFlag.isWaitModel = true;
            // FIXME 改用onWait来处理
            _t.onWait(data.count);
            break;
        // 客服发来消息
        case 202:
            _t.showNoticeMsg(data,202);
            break;
        case 203:
            // "您在思考人生？有问题请随时提问哦"
            _t.showNoticeMsg(_t.cacheInfo.customConfig.userTipWord || _t.cacheInfo.lan['L10005'],'system',true);
            break;
        case 204:
            // 处理type
            //if (_t.cacheFlag.isOutOneMinute && _t.cacheFlag.isUserTalked && !_t.cacheFlag.isSurveyed) {
            //    tmpType = '0-1-2';
            //} else {
            //    tmpType = '1-2';
            //}
            //TODO 会话结束后留言
            if(_t.cacheFlag.isUserTalked && !_t.cacheFlag.isSurveyed) {
                tmpType = _t.msgFlag ? '0-1' : '0-1-2';
            } else {
                tmpType = _t.msgFlag ? '1' : '1-2';
            }

            switch (data.status) {
                //人工客服离线导致用户下线
                case 1:
                    //typeStr = sName +"有事离开了,"+ typeStr;
                    typeStr = _t.formatLan(_t.cacheInfo.lan['L10008'],[sName,_t.cacheInfo.lan['L10006']]);
                    break;
                //被客服移除
                case 2:
                    //typeStr = sName +"结束了本次会话"+ typeStr;
                    typeStr = _t.formatLan(_t.cacheInfo.lan['L10008'],[sName,_t.cacheInfo.lan['L10006']]);
                    break;
                //被列入黑名单
                case 3:
                    //typeStr = sName +"结束了本次会话,";
                    typeStr = _t.formatLan(_t.cacheInfo.lan['L10009'],[sName]);
                    // 拉黑不显示满意度
                    tmpType = _t.msgFlag?'1':'1-2';
                    break;
                //长时间不说话
                case 4:
                    //typeStr = sName +"您长时间没有说话，本次会话已结束。"+ typeStr;
                    //                    typeStr = _t.formatLan(_t.cacheInfo.lan['L10010'], [_t.cacheInfo.lan['L10006']]);
                    typeStr = _t.cacheInfo.customConfig.userOutWord.replace(/<[^>]+>/g,"");
                    ;
                    break;
                //有新窗口打开
                case 6:
                    //typeStr = sName +"您已打开新聊天窗口"+ typeStr;
                    //typeStr = _t.formatLan(_t.cacheInfo.lan['L10011'], [sName, _t.cacheInfo.lan['L10006']]);
                    // FIXME 会话保持
                    tmpType = _t.cacheFlag.isSurveyed ? '0-1' : '1';
                    break;
            }
            // 处理footer显示
            if(tmpType) {
                // 关闭所有弹窗
                var dialogObj = _t.cacheInfo.dialog;
                for(var key in dialogObj) {
                    dialogObj[key].hide();
                }
                //alert();
                _t.common.footerManage.toggle(tmpType);
            }
            _t.showNoticeMsg(typeStr,'system');

            // 禁用输入框 FIXME 该功能还需要完善
            //_t.config.isDisabledInputMsg = true;
            //_t.disabledFuncCallback();

            //chatCameraBox.parent().hide();
            //chatSwitchBox.hide();
            // 设置chatPanel样式
            //chatPanel.css({'bottom': funcPanel.height()});
            // 清除超时任务
            _t.clearTimeOutTask();
            _t.cacheFlag.isPeopleModel = false;

            break;
        case 205:
            var onInputText = _t.formatLan(_t.cacheInfo.lan['L10020'],[_t.cacheInfo.customConfig.adminName]),
                onInputArr = _t.getSystemMsgHtml(onInputText),
                onInputHtml = onInputArr[0],
                dataCount = onInputArr[1];
            //console.log(onInputArr);
            // 标识塞入数组
            _t.cacheInfo.onInputArr.push(dataCount);

            // 是否可以显示客服输入状态（默认可以显示）
            if(_t.cacheFlag.isEnableOnInput) {
                // 更新Dom
                _t.updateChatList(onInputHtml);

                // 应该是每五秒从onInputArr里剔除一个
                // 超时隐藏正在输入
                _t.timeOutTaskFunc('onInput',5000, function() {
                    _t.cacheFlag.isEnableOnInput = true;
                    for(var i = 0;i < _t.cacheInfo.onInputArr.length;i++) {
                        $('.systemMsg').eq(_t.cacheInfo.onInputArr[i]).hide();
                    }
                    //$('.systemMsg').eq(_t.cacheInfo.onInputArr[0]).hide();
                    _t.cacheInfo.onInputArr.shift();
                });
            }

            // 超时前不可以继续显示
            _t.cacheFlag.isEnableOnInput = false;
            break;
        case 208:
            _t.updateChatList(_t.getRightMsgHtml(data.content));
            break;
    }
};
/*
 * 处理排队等待的提示显示处理
 * @param {Int} count 排队序号
 * */
ZC.onWait = function(count) {
    var _t = this,
        count = count || 0,
        onWaitText = '',
        onWaitArr = [],
        onWaitHtml = '',
        dataCount = 0;
    // 序号

    if(count) {
        _t.cacheFlag.isWaitModel = true;

        // "排队中，您在队伍中的第 " + data.count + " 个"
        //onWaitText = _t.formatLan(_t.cacheInfo.lan['L10004'], [count]);
        // "排队中，您在队伍中的第 " + data.count + " 个，请留言"
        //TODO 判断是否在后台有关闭留言功能
        onWaitText = _t.formatLan(_t.msgFlag ? _t.cacheInfo.lan['L10023'] : _t.cacheInfo.lan['L10022'],[_t.formatLan(_t.cacheInfo.lan['L10004'],[count])]);

        onWaitArr = _t.getSystemMsgHtml(onWaitText);
        onWaitHtml = onWaitArr[0];
        dataCount = onWaitArr[1];

        // 隐藏之前的排队信息
        _t.onWaitHide();

        // 标识塞入数组
        _t.cacheInfo.onWaitArr.push(dataCount);

        // 设置是否显示时间线为false，防止排队序号更新时导致的时间线显示问题
        _t.cacheFlag.isTimeLine = false;
        // 更新Dom
        _t.updateChatList(onWaitHtml);
        // 显示留言
        //TODO
        //_t.updateFuncPanelDom(4);
        _t.updateFuncPanelDom(2);

        /* 绑定暂无客服，留言点击事件 */
        _t.bindTargetEvent($('#systemMsgLeaveMessage'),_t.cacheInfo.eventType, function(e) {
            // 创建或显示留言弹窗
            //TODO 跳转到留言指定页面
            //var args = _t.config.backArgs ? [{
            //    'sysNum' : _t.cacheInfo.api.sysNum
            //},{
            //    'uid' : _t.cacheInfo.api.uid
            //},{
            //    'back' : '1'
            //}] : [{
            //    'sysNum' : _t.cacheInfo.api.sysNum
            //},{
            //    'uid' : _t.cacheInfo.api.uid
            //}];
            ZC_Extend.linkAction(_t.config.leaveMsgLink,ZC.UrlParamTransmit());
            // _t.createLeaveMessageDialog();
        });
    }
};

/*
 * 用户发送超时 尝试重发
 * */
ZC.onResubmit = function(dom,isReSubmit) {
    var _t = ZC;
    _t.updateChatState(_t.getErrorMsgHtml(),dom,isReSubmit);
}
/*
 * 隐藏排队信息
 * */
ZC.onWaitHide = function() {
    var _t = this;

    // 处理之前显示的排队信息
    if(_t.cacheFlag.isWaitModel && _t.cacheInfo.onWaitArr && _t.cacheInfo.onWaitArr.length) {
        // FIXME 之前是hide，改为remove，防止出现多个ID
        //$('.systemMsg').eq(_t.cacheInfo.onWaitArr[0]).hide();
        $('.systemMsg').eq(_t.cacheInfo.onWaitArr[0]).remove();
        _t.cacheInfo.onWaitArr.shift();
    }
}
/*
 * 显示提示消息
 * @param {String} typeStr 不同会话状态时的html
 * @param {String} type 依什么方式处理会话状态html
 * @param {Boolean} isHideSystemBox 是否隐藏.sysTemBox
 * */
ZC.showNoticeMsg = function(typeStr,type,isHideSystemBox,t1) {
    var _t = ZC,
        api = _t.cacheInfo.api,
        customConfig = _t.cacheInfo.customConfig,
        zcAudio = _t.cacheInfo.targetObjList.zcAudio,
        chatPanel = _t.cacheInfo.targetObjList.chatPanel,
        funcPanel = _t.cacheInfo.targetObjList.funcPanel,
    //systemMsgPanel = _t.cacheInfo.targetObjList.systemMsgPanel,
        chatSwitchBox = _t.cacheInfo.targetObjList.chatSwitchBox,
        chatCameraBox = _t.cacheInfo.targetObjList.chatCameraBox,
        timeDely = 1000 * 60 * customConfig.userTipTime,
        dataCount = 0,// 序号
    /*
     * 是否隐藏.systemBox
     * @param {Boolean} isHideSystemBox 是否隐藏.sysTemBox
     * */
        systemMsgPanelHide = function(isHideSystemBox) {
        if(isHideSystemBox) {
            /*_t.timeOutTaskFunc('systemMsgPanel', 5000, function () {
             $('.systemMsg').eq(dataCount).hide();
             });*/
            //console.log(t1)
            setTimeout(function() {
                $('.systemMsg').eq(_t.cacheInfo.systemMsgArr[0]).hide();
                _t.cacheInfo.systemMsgArr.shift();
            },t1?t1:5000);
        }
    },
    /*
     * 超时应答任务
     * */

        userTimeOutTasks = function() {
        _t.timeOutTaskFunc('userTimer',timeDely, function() {
            _t.cacheInfo.isShowNoticeMsg = true;
            _t.updateChatList(_t.getLeftMsgHtml(customConfig.adminName,customConfig.userTipWord,typeStr.aface));
        });
    };
    switch (type) {
        case 'system':
            var systemMsgHtmlArr = _t.getSystemMsgHtml(typeStr);
            _t.updateChatList(systemMsgHtmlArr[0]);
            if(isHideSystemBox) {
                // 标识塞入数组
                _t.cacheInfo.systemMsgArr.push(systemMsgHtmlArr[1]);
            }
            break;
        case 200:
            var data = typeStr;

            _t.cacheInfo.customConfig.adminName = data.aname;
            _t.cacheFlag.isPeopleModel = true;

            //chatSwitchBox.hide();
            //chatCameraBox.parent().show();
            _t.updateFuncPanelDom(3);
            // 设置chatPanel样式
            //chatPanel.css({'bottom': funcPanel.height()});

            // 判断是否保持会话
            if(_t.cacheFlag.isKeepSessions) {
                // FIXME 拉取会话记录，注意只插一次。
                api.getKeepDetail(function(data) {
                    _t.showHistory(data);
                });
            } else {
                // 判断是用户触发，还是客服触发的。判断当前是否是人工客服模式
                if(data.chatType == 1) {
                    // 客服{0}发起了会话
                    _t.updateChatList((_t.getSystemMsgHtml(_t.formatLan(_t.cacheInfo.lan['L10019'], [data.aname])))[0]);
                } else {
                    // 您好,{0}接受了您的请求
                    _t.updateChatList((_t.getSystemMsgHtml(_t.formatLan(_t.cacheInfo.lan['L10002'], [data.aname])))[0]);
                }

                // 显示客服欢迎语
                _t.updateChatList(_t.getLeftMsgHtml(data.aname,customConfig.adminHelloWord,data.aface));
            }

            // 隐藏排队提示信息
            _t.onWaitHide();

            // 清除超时任务
            _t.clearTimeOutTask();
            // 您在思考人生？有问题请随时提问哦~
            userTimeOutTasks();
            break;
        case 202:
            var data = typeStr;
            // FIXME 此处替换有问题，如果data只是target="_self"就会出问题。
            var re = /target="_self"/g;
            data.content = data.content.replace(re,'target="_blank"');
            // 显示客服发送的消息
            _t.updateChatList(_t.getLeftMsgHtml(data.aname,data.content,data.aface))
            // 是否支持播放提示音
            if(_t.config.isEnableAudio) {
                zcAudio[0].play();
            }

            // 清除超时任务
            _t.clearTimeOutTask();
            // 您在思考人生？有问题请随时提问哦~
            userTimeOutTasks();
            break;
    }

    // 调用是否隐藏.systemBox
    systemMsgPanelHide(isHideSystemBox);
};
/*
 * 拼装机器人或者客服发送的消息
 * @param {String} name 客服名称/机器人名称
 * @param {String} text 消息内容
 * */
ZC.getLeftMsgHtml = function(name,text,face) {
    //判断客服的头像   机器人   人工客服
    face = face ? face : 'http://img.sobot.com/console/common/face/robot.png';

    $('.titleName').html(name);
    var tmpHtml = '';
    if(name && text) {
        tmpHtml = '<div class="magBox leftMsg"><div class="serverHeader"><img src="' + face + '" /></div><div class="serverMsg"><p class="leftName">' + name + '</p><div id="msgFlag"></div><div class="msgDiv serverDiv"><div class="msgText">' + ZC_Extend.getUrlRegex(text) + '</div></div></div></div>';
    }

    return tmpHtml;
};
/*
 * 拼装用户发送的消息
 * @param {String} text 消息内容
 * */
ZC.getRightMsgHtml = function(text) {
    var tmpHtml = '';
    if(text) {
        //tmpHtml = '<div class="magBox rightMsg"><div class="msgDiv"><p class="msgText">'+ ZC_Extend.getUrlRegex(text)  +'</p></div></div>';
        var userFaceItem = ZC.cacheInfo.faceImg ? ZC.cacheInfo.faceImg : "http://img.sobot.com/console/common/face/user.png";
        tmpHtml = '<div class="magBox rightMsg"><div class="msgDiv"><p class="msgText">' + ZC_Extend.getUrlRegex(text) + '</p></div><div class="userHeader"><img src="' + userFaceItem + '" /></div></div>';
    }

    return tmpHtml;
};

/*
 * 创建用户重发icon
 * @params
 * */
ZC.getErrorMsgHtml = function() {
    return '<div class="zc-c-reSubmit-icon" ><div>';
}
/*
 * 拼装中间的系统提示消息
 * @param {String} text 消息内容
 * */
ZC.getCenterMsgHtml = function(text) {
    var tmpHtml = '';
    if(text) {
        tmpHtml = '<p class="msgData">' + text + '</p>';
    }

    return tmpHtml;
};
/*
 * 拼装中间的系统提示消息
 * @param {String} text 消息内容
 * */
ZC.getSystemMsgHtml = function(text) {
    var tmpHtml = '',
        dataCount = $('.systemMsg').length;
    if(text) {
        tmpHtml = '<p class="systemMsg" data-count="' + dataCount + '"><span class="systemMsgText">' + text + '</span></p>';
    }

    return [tmpHtml,dataCount];
};

/*
 * 显示历史记录
 * */
ZC.showHistory = function(res) {
    var _t = ZC,
        data = _t.config.isResData ? res.data : res,
        tmpHtml = _t.getCenterMsgHtml(_t.cacheInfo.lan['L10012']),// 没有更多记录
        oldCid = '',
        dataLen = data.length,
        item = '',
        itemLen = 0,
        itemChild = '',
        msgHtml = '',
        reg = /target="_self"/g;

    //console.log(data);
    // 保存时间戳
    if(res.length)
        window.GlobalTime = res[0].content[0].t;

    _t.cacheInfo.chatPanelListHeightOld = _t.cacheInfo.targetObjList.chatPanelList.height();
    // 如果有数据则下次加载下一页
    if(data && dataLen) {
        // 当前页数加1
        _t.cacheFlag.pageNow++;

        for(var i = 0;i < dataLen;i++) {
            item = data[i].content;
            itemLen = item.length;

            for(var j = 0;j < itemLen;j++) {
                itemChild = item[j];
                // 用户
                if(itemChild.senderType == 0) {
                    msgHtml = _t.getRightMsgHtml(itemChild.msg);
                } else {
                    //console.log(itemChild.senderFace)
                    msgHtml = _t.getLeftMsgHtml(
                    // 机器人：1  人工客服：2
                    itemChild.senderType == 1 ? _t.cacheInfo.customConfig.robotName : itemChild.senderName,itemChild.msg,itemChild.senderType == 1 ? _t.cacheInfo.customConfig.robotLogo : itemChild.senderFace);
                }

                // 判断会话ID（cid）
                if(itemChild.cid !== oldCid) {
                    tmpHtml = tmpHtml + _t.getCenterMsgHtml(itemChild.ts.substring(5,16));
                    oldCid = itemChild.cid;
                }

                tmpHtml = (tmpHtml + msgHtml).replace(reg,'target="_blank"');
            }
        }

        _t.updateChatList(tmpHtml,true,true);
        // 隐藏没有更多记录
        $(_t.cacheInfo.targetObjList.chatPanelList.children()[0]).hide();

        /* 初始化Scroll */
        _t.scrollInit();
    } else {
        // 没有更多记录标识
        _t.cacheFlag.noMoreHistroy = true;
        // 判断“没有更多记录”是否已存在
        if(_t.cacheInfo.lan['L10012'] != $(_t.cacheInfo.targetObjList.chatPanelList.children()[0]).html()) {
            _t.updateChatList(tmpHtml,true,true);
        }

        // 显示没有更多记录
        $(_t.cacheInfo.targetObjList.chatPanelList.children()[0]).show();
        // 隐藏下拉显示更多
        _t.cacheInfo.targetObjList.pullDown.hide();
    }

    setTimeout(function() {
        // 刷新Scroll
        _t.Scroll.refresh();
        // 获取chatPanelListHeightNew
        //_t.cacheInfo.chatPanelListHeightNew = _t.cacheInfo.targetObjList.chatPanelList.height();
        // 执行scroll滚动
        //_t.Scroll.scrollTo(0, _t.cacheInfo.chatPanelListHeightOld - _t.cacheInfo.chatPanelListHeightNew, 0);
    },1000);

    //历史记录修改用户头像
    if(ZC_Extend.getUrlQueryString('face') != '' && ZC_Extend.getUrlQueryString('face'))
        $('.magBox.rightMsg .userHeader').find('img').attr('src',ZC_Extend.getUrlQueryString('face'));
};
/*
 * 下拉刷新
 * */
ZC.pullDownRefresh = function() {
    var _t = this,
        pullDown = _t.cacheInfo.targetObjList.pullDown,
        pullDownClass = pullDown.attr('class'),
        pullDownLabel = pullDown.find('.pullDownLabel'),
    //加载状态 0默认，1显示加载状态，2执行加载数据，只有当为0时才能再次加载，这是防止过快拉动刷新
        loadingStep = 0;

    // 滚动中
    _t.Scroll.on('scroll', function() {
        // 是否可以放大图片，false。
        _t.cacheFlag.isEnableBigImg = false;

        if(this.y > 5 && !_t.cacheFlag.noMoreHistroy) {
            //下拉刷新效果
            pullDown.attr('class',pullDownClass);
            pullDown.show();
            pullDown.addClass('flip');
            // 准备刷新
            pullDown.html(_t.cacheInfo.lan['L10016']);
            loadingStep = 1;
        }
    });
    // 滚动结束
    _t.Scroll.on("scrollEnd", function() {
        // 是否可以放大图片，true。
        _t.cacheFlag.isEnableBigImg = true;

        if(loadingStep == 1 && !_t.cacheFlag.noMoreHistroy) {
            if(pullDown.attr('class').match('flip|loading')) {
                pullDown.removeClass('flip').addClass('loading');
                // 正在加载
                pullDown.html(_t.cacheInfo.lan['L10017']);
                loadingStep = 2;

                // 加载更多历史记录
                _t.cacheInfo.api.chatDetail(_t.showHistory,_t.cacheFlag.pageNow,_t.cacheFlag.pageSize);

                setTimeout(function() {
                    pullDown.removeClass('loading');
                    // 下拉显示更多
                    pullDown.html(_t.cacheInfo.lan['L10018']);
                    pullDownClass = pullDown.attr('class');
                    //pullDown.attr('class', '').hide();
                    pullDown.attr('class','');

                    _t.cacheInfo.chatPanelListHeightNew = _t.cacheInfo.targetObjList.chatPanelList.height();
                    _t.Scroll.scrollTo(0,_t.cacheInfo.chatPanelListHeightOld - _t.cacheInfo.chatPanelListHeightNew + 50,0);
                    loadingStep = 0;
                },500);
                //1秒
            }
        }
    });
};
/*
 * 获取用户信息
 * @return {Object} userInfo 用户信息
 * */
ZC.getUserInfo = function() {
    var _t = this,
        topPanel = _t.cacheInfo.targetObjList.topPanel,
        chatPanel = _t.cacheInfo.targetObjList.chatPanel,
        oSource = 4,// 用户来源 0：PC 1：微信 2：APP 3：微博 4：WAP FIXME 0：PC 1：移动端 2：APP
        sourceData = parseInt(_t.getUrlParam("source"));
        //console.log(sourceData);
    if(_t.cacheInfo.urlParamList['back']) {
        topPanel.css({
            'top' : '0'
        });
        chatPanel.css({
            'top' : '50px'
        });
    }

    // FIXME 注意此处的几个body1的隐藏显示操作，需要确认是否需要这几个功能
    /*if(top != self || document.referrer == "" || document.referrer.indexOf("sobot.com") != -1) {
    chatPanel.css({'top': 0});
    }*/

    /*if(_t.cacheInfo.UA == "micromessenger") {
    oSource = 1;
    chatPanel.css({'top': 0});
    }*/
    //alert( ZC_Extend.getUrlQueryString('visitUrl'));

    //alert( (ZC_Extend.getUrlQueryString('visitTitle')));

    return {
        source : sourceData >= 0 ? sourceData : oSource,
        tel : _t.cacheInfo.urlParamList.tel,
        uname : _t.cacheInfo.urlParamList.uname,
        partnerId : _t.cacheInfo.urlParamList.partnerId,
        email : _t.cacheInfo.urlParamList.email,
        visitUrl : ZC_Extend.getUrlQueryString('visitUrl') ? ZC_Extend.getUrlQueryString('visitUrl') : ZC_Extend.member.preURLLink,
        visitTitle : ZC_Extend.getUrlQueryString('visitTitle') ? ZC_Extend.getUrlQueryString('visitTitle') : '',
        face : ZC_Extend.getUrlQueryString('face') ? ZC_Extend.getUrlQueryString('face') : ''
    };
    //console.log(source);
};
/*
 * 获取用户自定义配置
 * @param {object} data
 * */
ZC.getCustomConfig = function(res) {
    var _t = ZC,
        data = _t.config.isResData ? res.data : res,
        customConfig = _t.cacheInfo.customConfig,
        chatSwitch = _t.cacheInfo.targetObjList.chatSwitch,
        chatSwitchBox = _t.cacheInfo.targetObjList.chatSwitchBox,
        topPanel = _t.cacheInfo.targetObjList.topPanel,
        sendBtn = _t.cacheInfo.targetObjList.sendBtn,
        setStyle = _t.cacheInfo.targetObjList.setStyle;
    if(data) {
        for(var item in data) {
            // 设的一个标识用来判断是否是否已走getCustomConfig
            if(!_t.cacheFlag.isGetCustomConfig && customConfig.hasOwnProperty(item)) {
                _t.cacheFlag.isGetCustomConfig = true;
            }
            _t.cacheInfo.customConfig[item] = data[item];
        }
    }
    // 设置用户配置
    //特殊设置
    if(customConfig.wurl) {
        chatSwitch.attr({
            'href' : customConfig.wurl,
            'target' : '_blank'
        });
    }

    //console.log(customConfig);
    //console.log(oSource);
    if(!customConfig.color){
        customConfig.color='#09aeb0';
    }
    // 设置页面
    document.title = customConfig.companyName;
    topPanel.css("background-color",customConfig.color);
    sendBtn.css("background-color",customConfig.color);
    //console.log(customConfig.color);
    chatSwitchBox.find('a').css("color",customConfig.color);
    // 设置样式
    setStyle.html('.zc-chat .zc-chat_msg .zc-chat_msg_scroll .rightMsg .msgDiv { background-color:' + customConfig.color + '; color:#fff;} .zc-chat .zc-chat_msg .zc-chat_msg_scroll .rightMsg .msgDiv:before { border-color: transparent ' + customConfig.color + '} .zc-chat .zc-chat_msg .zc-chat_msg_scroll .rightMsg .msgDiv .msgText p a{color:' + customConfig.color + ';} .zcDialog-header {background-color:' + customConfig.color + ';} .zcDialog .zcDialog-footer .zcDialog-cancel:hover {color:' + customConfig.color + ';} .zcDialog .zcDialog-footer .zcDialog-confirm:hover {color:' + customConfig.color
    // 评价弹窗
    + ';} .chackSpan {color: #fff; background-color:' + customConfig.color + ';} .surquick .surqList span i {color:' + customConfig.color + ';} .surquick .surqList span i:hover, .surquick .surqList span .chackSpan {color: #fff; background-color:' + customConfig.color
    // 技能组
    + ';} .zcDialog-groupList .zcDialog-body .groupList-btn span {border-color:' + customConfig.color + ';color:' + customConfig.color + ';} .zcDialog-groupList .zcDialog-body .groupList-btn span:hover {color: #fff; background-color:' + customConfig.color
    // 留言
    + ';} .zcDialog-leaveMessage .zcDialog-header {background-color:' + customConfig.color + ';} .zcDialog-leaveMessage .zcDialog-confirm {color:' + customConfig.color
    // 留言成功弹窗
    + ';} .recreateLeaveMessage {color:' + customConfig.color
    // 结束会话弹窗
    + ';} .zcDialog-close .zcDialog-body .iscloseDiv .surEndBtn {background-color:' + customConfig.color + ';}');

    /* 关闭loading */
    //_t.loading().hide();
};
/*
 * 切换客服类型
 *
 * */
ZC.switchModel = function() {
    //alert();
    var _t = this,
        customConfig = _t.cacheInfo.customConfig,
        switchModelFunc = function() {
        //alert(customConfig.type);
        // 仅机器人||机器人优先
        if(customConfig.type == 1 || customConfig.type == 3) {
            _t.robotModel();
            //TODO 留言按钮
            if(customConfig.type == 1) {
                $(_t.chatSwitch).hide();
                $(_t.leaveMessage).show();
            }

            // 客服优先
        } else {
            // 接口变更，导致人工客服优先的情况下必须主动创建会话连接
            if(!_t.cacheFlag.isConnected) {
                _t.manualModel();
            }
        }
    };
    // 用户当前的方位状态：-3.访问页面，-2.排队中，-1.机器人 0.离线   1.在线
    if(_t.config.ustatus == 1 || _t.config.ustatus == -2) {
        // 更新会话保持标识
        _t.cacheFlag.isKeepSessions = true;
        _t.manualModel();
        return;
    }
    // type已取到
    if(customConfig && customConfig.type != undefined && _t.cacheFlag.isGetCustomConfig) {
        switchModelFunc();
    } else {
        // 设置周期任务，检测customConfig.type是否有值以及API是否成功
        _t.cacheInfo.switchModelTimeTask = setInterval(function() {
            if(customConfig && customConfig.type != undefined && _t.cacheFlag.isGetCustomConfig) {
                clearInterval(_t.cacheInfo.switchModelTimeTask);
                switchModelFunc();
            }
        },500);
    }
};
/*
 * 人工客服模式
 * */
ZC.manualModel = function() {
    //alert();
    var _t = this,
        api = _t.cacheInfo.api,
        lan = _t.cacheInfo.lan,
        customConfig = _t.cacheInfo.customConfig,
        resData = '',
        callbackFun = function(res) {
        resData = _t.config.isResData ? res.data : res;
        // 默认给false，然后在分条件给true
        _t.cacheFlag.isWaitModel = false;
        //alert(resData.status);
        if(resData) {
            // 移除“暂无客服在线，留言”
            $('#systemMsgLeaveMessage').parents('.systemMsg').remove();
            //关闭留言功能  移除等待
            $('#systemMsgLeaveMsg').parents('.systemMsg').remove();
            //alert(resData.status);
            //console.log(_t.msgFlag);
            switch (resData.status) {
                case 0:
                    // 这里显示留言 隐藏 转人工
                    //$('#chatSwitch').hide();
                    //TODO  不隐藏转人工
                    _t.onWaitHide();
                    //隐藏之前系统的排队提示消息

                    // 改用onWait来处理
                    _t.onWait(resData.count);

                    //TODO 隐藏左边栏空白

                    break;
                // 连接正常
                case 1:
                    //$('#chatSwitchBox').css({'width':'45px','padding-right':'0'});
                    //$('#leaveMessage').css('display','none');
                    // 这里显示语音通话 隐藏 转人工
                    $('#chatSwitch').hide();

                    // 客服状态可用，显示客服欢迎语
                    _t.manualHello(resData);
                    _t.updateFuncPanelDom(3);
                    _t.onWaitHide();

                    // 绑定图片上传
                    //_t.imgUpload();

                    break;
                // 无客服，显示「留言」按钮
                case 2:
                    // 您好，当前无客服在线
                    //_t.showNoticeMsg(_t.formatLan(_t.cacheInfo.lan['L10022'], [customConfig.adminNonelineTitle]), 'system', false);
                    //TODO 后台关闭留言
                    _t.showNoticeMsg(_t.formatLan(_t.msgFlag ? _t.cacheInfo.lan['L10023'] : _t.cacheInfo.lan['L10022'],[customConfig.adminNonelineTitle]),'system',true,15000);
                    _t.updateFuncPanelDom(2);

                    /* 绑定暂无客服，留言点击事件 */
                    _t.bindTargetEvent($('#systemMsgLeaveMessage'),_t.cacheInfo.eventType, function(e) {
                        // 创建或显示留言弹窗
                        //TODO 跳转留言页
                        //var args = _t.config.backArgs ? [{
                        //    'sysNum' : _t.cacheInfo.api.sysNum
                        //},{
                        //    'uid' : _t.cacheInfo.api.uid
                        //},{
                        //    'back' : '1'
                        //}] : [{
                        //    'sysNum' : _t.cacheInfo.api.sysNum
                        //},{
                        //    'uid' : _t.cacheInfo.api.uid
                        //}];

                        ZC_Extend.linkAction(_t.config.leaveMsgLink,ZC.UrlParamTransmit());
                        //_t.createLeaveMessageDialog();
                    });

                    // 智能客服-优先
                    if(customConfig.type == 2) {
                        // 显示留言弹窗
                        //_t.createLeaveMessageDialog();
                        //TODO 跳转留言页
                        //var args = _t.config.backArgs ? [{
                        //    'sysNum' : _t.cacheInfo.api.sysNum
                        //},{
                        //    'uid' : _t.cacheInfo.api.uid
                        //},{
                        //    'back' : '1'
                        //}] : [{
                        //    'sysNum' : _t.cacheInfo.api.sysNum
                        //},{
                        //    'uid' : _t.cacheInfo.api.uid
                        //}];
                        ZC_Extend.linkAction(_t.config.leaveMsgLink,ZC.UrlParamTransmit());
                    }

                    if(customConfig.type == 4) {
                        _t.robotModel();
                    }

                    // 无客服不重复显示机器人欢迎语
                    //_t.robotHello();
                    break;
                // 黑名单用户
                case 3:
                    // 暂时无法转接人工客服
                    _t.showNoticeMsg(lan['L10001'],'system');
                    _t.updateFuncPanelDom(2);
                    break;
                // 用户在排队，显示「留言」按钮
                case 4:
                    //$('#chatSwitch').hide();
                    // $('#chatSwitchBox').css({'width':'0','padding-right':'0'});
                    _t.cacheFlag.isWaitModel = true;
                    _t.updateFuncPanelDom(4);
                    break;
            }
        }
    },
    // 显示技能值
        showGroup = function(res) {
        // 判断res类型
        if(res && $.isArray(res)) {
            res = {
                groupList : res
            }
        }

        // 用户当前的方位状态：-2.排队中，-1.机器人 0.离线   1.在线
        if(res.ustatus == 1) {
            // 更新会话保持标识
            _t.cacheFlag.isKeepSessions = true;
            // 设置cookie
            //_t.setCookie('KeepSessions', 1);
            _t.manualModel();
            return;
        } else if(resData.ustatus == 0) {
            //TODO 判断后台是否不需要设置留言
            //alert();
            _t.common.footerManage.toggle(_t.cacheFlag.isSurveyed ? _t.msgFlag ? '1' : '1-2' : _t.msgFlag ? '0-1' : '0-1-2');
            return;
        }
        // TODO 1.健壮
        if(res.groupList && res.groupList.length > 1) {
            var res = res.groupList;
            // TODO 2.根据结果渲染页面。
            var tmpHtml = '',
                _d,
                item;
            // 处理数据
            /*res.push({
             groupId: '999',
             recGroupName: '其他'
             });*/

            for(var i in res) {
                item = res[i];
                tmpHtml += '<a class="groupList-btn" data-groupid="' + item.groupId + '" href="javascript: void (0);"><span>' + item.recGroupName + '</span></a>';
            }
            // 拼装content
            tmpHtml = '<div class="groupList">' + tmpHtml + '</div>';

            // 判断是否已创建留意dialog
            if(_t.cacheInfo.dialog['groupList']) {
                _d = _t.cacheInfo.dialog['groupList'];
                _d.show();
            } else {
                _d = _t.cacheInfo.dialog['groupList'] = new ZC.common.dialog({
                    className : ['zcDialog-groupList'],
                    data : {
                        title : '选择咨询内容',
                        content : tmpHtml,
                        btn : {
                            cancle : {
                                title : '取消',
                                callback : function() {
                                    // 隐藏弹窗
                                    _d.hide();
                                    // 显示转人工按钮
                                    _t.updateFuncPanelDom(2);
                                }
                            }
                        },
                        btnList : ['cancle']
                    }
                });
                // 显示弹窗
                _d.show();
                // 绑定技能组点击事件
                //_d.dom.dialog.find('.groupList-btn').on('click', function () {
                //console.log(_t.cacheInfo.eventType)
                _t.bindTargetEvent(_d.dom.dialog.find('.groupList-btn'),_t.cacheInfo.eventType, function(e) {
                    // 隐藏弹窗
                    _d.hide();
                    // 获取groupId
                    var groupId = $(e.currentTarget).data('groupid');
                    // 如果没有建立连接就建立
                    api.createChat(_t.msgListen, function(res) {
                        callbackFun(res);
                    },groupId);
                });
            }
        } else {
            // 如果没有建立连接就建立
            if(res&&res.groupList.length>0){
                var groupId = res.groupList[0].groupId;
                api.createChat(_t.msgListen, function(res) {
                    callbackFun(res);
                },groupId);
            }else{
                api.createChat(_t.msgListen, function(res) {
                    callbackFun(res);
                });
            }
        }
    };

    // 只要点击转人工就隐藏转人工按钮
    //_t.cacheInfo.targetObjList.chatSwitchBox.hide();
    //TODO 20160530 弹出技能组不隐藏转人工按钮
    //_t.updateFuncPanelDom(1);
    // 是否已建立连接
    if(!_t.cacheFlag.isConnected) {
        //return;
        // 判断是否需要保持会话
        if(_t.cacheFlag.isKeepSessions) {
            // 如果没有建立连接就建立
            api.createChat(_t.msgListen, function(res) {
                callbackFun(res);
            });
            // 判断URL是否有groupId参数，如果有则直接创建会话 FIXME url上的groupId是区分大小写的。
        } else if(_t.cacheInfo.userInfo.groupId) {
            // 如果没有建立连接就建立
            api.createChat(_t.msgListen, function(res) {
                callbackFun(res);
            });
            // FIXME 判断是否需要走技能组 customConfig.groupflag: 0 不分组    1 分组;
        } else if(customConfig.groupflag) {
            // FIXME 调接口查询技能组，并弹窗显示
            api.getGroupList(function(res) {
                //console.log(res);
                showGroup(res);
            });
        } else {
            // 如果没有建立连接就建立
            api.createChat(_t.msgListen, function(res) {
                callbackFun(res);
            });
        }

        // 如果没有建立连接就建立
        /*api.createChat(_t.msgListen, function (res) {
         resData =  _t.config.isResData ? res.data : res;
         // 默认给false，然后在分条件给true
         _t.cacheFlag.isWaitModel = false;
         if (resData) {
         switch (resData.status) {
         case 0:
         // FIXME 改用onWait来处理
         _t.onWait(resData.count);
         break;
         // 连接正常
         case 1:
         // 客服状态可用，显示客服欢迎语
         _t.manualHello(resData);
         _t.updateFuncPanelDom(false);
         _t.onWaitHide();
         break;
         // 无客服
         case 2:
         // 您好，当前无客服在线
         _t.showNoticeMsg(customConfig.adminNonelineTitle, 'system', true);
         _t.updateFuncPanelDom(true);
         // 无客服不重复显示机器人欢迎语
         //_t.robotHello();
         break;
         // 黑名单用户
         case 3:
         // 暂时无法转接人工客服
         _t.showNoticeMsg(lan['L10001'], 'system');
         _t.updateFuncPanelDom(true);
         break;
         // 用户在排队
         case 4:
         _t.cacheFlag.isWaitModel = true;
         _t.updateFuncPanelDom(true);
         break;
         }
         }
         });*/
    }
};
/*
 * 显示人工客服欢迎语
 * @param {object} res
 * */
ZC.manualHello = function(data) {
    var _t = ZC;

    _t.showNoticeMsg(data,200);
    // 客服状态可用
    _t.cacheFlag.isEnableManual = true;
    /* 用户输入状态 */
    _t.periodTask();
}
/*
 * 机器人模式
 * */
ZC.robotModel = function() {
    var _t = this,
        customConfig = _t.cacheInfo.customConfig,
        chatPanel = _t.cacheInfo.targetObjList.chatPanel,
        funcPanel = _t.cacheInfo.targetObjList.funcPanel,
        chatSwitchBox = _t.cacheInfo.targetObjList.chatSwitchBox,
        chatCameraBox = _t.cacheInfo.targetObjList.chatCameraBox;

    // FIXME 接口变更，默认进来就是连接成功的。这样可以少走一次接口
    _t.updateFuncPanelDom(2);
    //alert(customConfig.type);
    // 判断是否为仅机器人模式
    if(customConfig.type == 1) {
        // 隐藏转人工
        //chatSwitchBox.hide();
        // 改用updateFuncPanelDom来处理
        // 机器人优先
        _t.updateFuncPanelDom(1);

    }/*else {
    if (_t.cacheFlag.isConnected) {
    // 显示转人工
    chatSwitchBox.show();
    } else {
    //chatSwitchBox.hide();
    _t.cacheInfo.robotModelTimeTask = setInterval(function () {
    if (customConfig && customConfig.type == 3 && _t.cacheFlag.isConnected) {
    clearInterval(_t.cacheInfo.robotModelTimeTask);
    // 显示转人工
    chatSwitchBox.hide();
    }
    }, 500);
    }
    }*/
    // 隐藏拍照 FIXME 此处可以不用，上面updateFuncPanelDom已经处理了。
    //chatCameraBox.parent().hide();
    // 设置chatPanel样式
    //chatPanel.css({'bottom': funcPanel.height()});
    // 机器人欢迎语
    _t.robotHello();
};
/*
 * 机器人欢迎语
 * */
ZC.robotHello = function() {
    var _t = this,
        chatSwitch = _t.cacheInfo.targetObjList.chatSwitch,
        robotName = _t.cacheInfo.customConfig.robotName,
        robotHelloWord = _t.cacheInfo.customConfig.robotHelloWord;

    // 正常情况chatConnectButton没有值，如果有值且=1的时候，转人工按钮是隐藏，机器人回答不了的时候才显示的
    if(_t.cacheInfo.customConfig.chatConnectButton == 1) {
        chatSwitch.hide();
    }

    // 更新Dom
    _t.updateChatList(_t.getLeftMsgHtml(robotName,robotHelloWord,_t.cacheInfo.customConfig.robotLogo));
};
/*
 * 机器人动画效果（监听用户输入内容，比如：抖动，打雷，闪电，翻转）
 * @param {String} textData 输入框内容
 * */
ZC.robotAnimationEffect = function(textData) {
    var _t = this,
        chatPanel = _t.cacheInfo.targetObjList.chatPanel,
        isEnabled = _t.config.isEnabledrobotAnimationEffect || false,
        effectList = _t.config.robotAnimationEffectList || {},
        item = '',
        itemVal = '',
        reg = '',
        isActive = false;
    // 是否触发动画

    if(isEnabled && effectList) {

        for(item in effectList) {
            itemVal = effectList[item];
            reg = new RegExp(item);

            isActive = reg.test(textData);
            if(isActive) {
                break;
            }
        }
        // FIXME 效果执行完后页面会白屏 (通过在chantPanel上添加删除Class可以解决问题)
        if(isActive && itemVal) {
            chatPanel.addClass(itemVal);

            _t.timeOutTaskFunc('robotAnimationEffect',2000, function() {
                chatPanel.removeClass(itemVal);
            });
        }
    }
};
/*
* 更新funcPanel内功能的显示隐藏  转人工之后隐藏
* @param {Boolean} isRobotModel 是否机器人模式
* @param {Number} mode 模式 1：robotOnlyMode 2: robotMode 3: manualMode
* */
/*ZC.updateFuncPanelDom = function (isRobotModel) {
var _t = this,
chatPanel = _t.cacheInfo.targetObjList.chatPanel,
funcPanel = _t.cacheInfo.targetObjList.funcPanel,
chatSwitchBox = _t.cacheInfo.targetObjList.chatSwitchBox,
chatCameraBox = _t.cacheInfo.targetObjList.chatCameraBox;

if (isRobotModel) {
// 显示转人工
chatSwitchBox.show();
chatCameraBox.parent().hide();
} else {
chatSwitchBox.hide();
chatCameraBox.parent().show();
}

// 设置chatPanel样式
chatPanel.css({'bottom': funcPanel.height()});
};*/
//TODO 模式
//模式 1：仅机器人 2：机器人 3：人工  4：留言 5：语音
ZC.updateFuncPanelDom = function(mode) {

    var _t = ZC,
        targetObjList = _t.cacheInfo.targetObjList,
        funcPanel = targetObjList.funcPanel,
        funcPanelClassList = _t.config.funcPanelClassList,
        chatPanel = _t.cacheInfo.targetObjList.chatPanel,
        funcPanel = _t.cacheInfo.targetObjList.funcPanel,
        chatSwitchBox = _t.cacheInfo.targetObjList.chatSwitchBox,
        chatCameraBox = _t.cacheInfo.targetObjList.chatCameraBox;
        modeClass = ''
    //$('#chatSwitchBox').css( {'width':'45px','padding-right':'15px'});
    //console.log(mode);
    //console.log(_t.msgFlag);
    switch (mode) {
        case 1:
            modeClass = funcPanelClassList.robotOnlyMode;
            //$('#chatSwitch').css('display','block');
            //$('#leaveMessage').css('display','none');

            $('#chatSwitch').css('display','none');
            //$('#leaveMessage').css('display','block');
            if(_t.msgFlag){
                $('#leaveMessage').css('display','none');
                $('#chatSwitchBox').css( {'width':'0','padding-right':'0'});
            }
            else{
                $('#leaveMessage').css('display','block');
            }
            //chatSwitchBox.hide();
            //chatCameraBox.parent().hide();
            break;
        case 2:
            modeClass = funcPanelClassList.robotMode;
            //chatSwitchBox.show();
            //chatCameraBox.parent().hide();
            break;
        case 3:
            $('#leaveMessage').css('display','none');
            //chatSwitchBox.show();
            //chatCameraBox.parent().hide();
            // 是否开启语音通话
            if(_t.cacheInfo.customConfig.onORoff === 1) {
                modeClass = funcPanelClassList.manualMode;
            } else {
                modeClass = funcPanelClassList.voiceMode;
            }
            $('#chatSwitch').css('display','none');
            $('#chatSwitchBox').css({
                'width' : '45px'
            });
            //$('#leaveMessage').css('display','block');
            break;
        case 4:
            //chatSwitchBox.show();
            //chatCameraBox.parent().hide();
            modeClass = funcPanelClassList.manualWaitMode;
    }

    // 移除所有模式的class，并添加新的class
    _t.updateTargetClass(chatSwitchBox,funcPanelClassList,true,modeClass);
    // 设置chatPanel样式
    chatPanel.css({
        'bottom' : funcPanel.height()
    });
};
/*
 * ZC.updateTargetClass 更新目标元素class
 * @param {Object} targetObj 目标元素对象
 * @param {Object} classList class列表对象
 * @param {Boolean/String} classDel 移除所有(true)或者将要移除的class
 * @param {String} classAdd 将要添加的class
 * */
ZC.updateTargetClass = function(targetObj,classList,classDel,classAdd) {
    var _t = ZC;

    // 判断targetObj
    if( typeof targetObj != 'object') {
        targetObj = $(targetObj);
    }

    // 判断classList
    if( typeof classList != 'object') {
        return;
    }

    // 判断是移除所有还是只移除某一个class
    if( typeof classDel === 'boolean' && classDel) {
        // 移除所有模式的样式
        for(var key in classList) {
            targetObj.removeClass(classList[key]);
        }
    } else {
        targetObj.removeClass(classDel);
    }

    // 添加一个class
    if( typeof classAdd === 'string' && classAdd) {
        targetObj.addClass(classAdd);
    }
};

/*
 * 上传图片
 * @param {}
 * */
ZC.uploadToServerBase64 = function(base64) {
    var _t = this,
        api = _t.cacheInfo.api,
        chatPanel = _t.cacheInfo.targetObjList.chatPanel,
        targetIndex = _t.cacheInfo.onUploadArr[0];

    $.ajax({
        url : _t.cacheInfo.rootPath + "/webchat/fileuploadBase64.action",
        //url:  "http://101.200.12.241/chat/webchat/fileuploadBase64.action",
        type : 'POST',
        dataType : "json",
        data : {
            base64 : base64,
            pid : api.pid
        },
        success : function(res) {
            var data = _t.config.isResData ? res.data : res,
                oImg = document.createElement("img");

            oImg.src = data.url;
            oImg.className = "webchat_img_upload";
            oImg.onload = function() {
                chatPanel.find('.UpIsImg .msgText').eq(targetIndex).html(oImg);
                chatPanel.find('.UpIsImg').eq(targetIndex).removeClass('UpIsImg');
                api.chatSend('<img  src="' + data.url + '" class="webchat_img_upload"/>');

                _t.cacheInfo.onUploadArr.shift();
                _t.scrollRefresh();
            };
            // 清除超时任务
            _t.clearTimeOutTask();
            //公司客服超时
            _t.manualTimeOutTask();
        },
        error : function() {
            chatPanel.find('.UpIsImg').eq(targetIndex).removeClass('UpIsImg');
        }
    });
};
/*
 * 客服超时任务
 * */
ZC.manualTimeOutTask = function() {
    var _t = this,
        customConfig = _t.cacheInfo.customConfig,
        timeDely = 1000 * 60 * customConfig.adminTipTime;

    _t.timeOutTaskFunc('manualTimer',timeDely, function() {

        _t.updateChatList(_t.getLeftMsgHtml(customConfig.adminName,customConfig.adminTipWord,""));
    });
};
/*
 * 清除超时任务
 * */
ZC.clearTimeOutTask = function() {
    var _t = this;

    // 清除超时任务
    clearTimeout(_t.cacheInfo.timeOutTask['manualTimer']);
    clearTimeout(_t.cacheInfo.timeOutTask['userTimer']);
};
/*
 * 超时任务方法
 * @param {number} timeHandle  时间句柄
 * @param {number} timeDely  延时
 * @param {function} callback  回调
 * */
ZC.timeOutTaskFunc = function(timeHandle,timeDely,callback) {
    var _t = this;

    clearTimeout(_t.cacheInfo.timeOutTask[timeHandle]);
    _t.cacheInfo.timeOutTask[timeHandle] = setTimeout(function() {
        callback && callback();
    },timeDely);
};
/*
 * 用户输入状态周期任务
 * */
ZC.periodTask = function() {
    var _t = this,
        api = _t.cacheInfo.api,
        customConfig = _t.cacheInfo.customConfig,
        inputMsg = _t.cacheInfo.targetObjList.inputMsg,
        inputMsgVal = '';

    setInterval(function() {
        if(_t.cacheFlag.isPeopleModel) {

            inputMsgVal = $.trim(inputMsg.val());

            if(customConfig.inputMsgVal == inputMsgVal) {
                return;
            }

            customConfig.inputMsgVal = inputMsgVal;

            if(inputMsgVal.length == 0 || inputMsgVal.length >= 50 || inputMsgVal == " ") {
                return;
            }

            inputMsgVal = inputMsgVal.replace("&lt;","<");
            inputMsgVal = inputMsgVal.replace("&gt;",">");
            inputMsgVal = inputMsgVal.replace("&quot;","\"");
            inputMsgVal = inputMsgVal.replace("&qpos;","\'");
            inputMsgVal = inputMsgVal.replace("&nbsp;"," ");
            inputMsgVal = inputMsgVal.replace("&nbsp;"," ");
            inputMsgVal = inputMsgVal.replace(/<\/?.+?>/g,"");

            api.chatInput(inputMsgVal);
        }
    },customConfig.inputTime);
};
/*
 * 时间格式化
 * @param {String} formatStr 格式化类型
 * */
Date.prototype.Format = function(formatStr) {
    var str = formatStr,
        Week = ['日','一','二','三','四','五','六'];

    str = str.replace(/yyyy|YYYY/,this.getFullYear());
    str = str.replace(/yy|YY/,(this.getYear() % 100) > 9 ? (this.getYear() % 100).toString() : '0' + (this.getYear() % 100));

    str = str.replace(/MM/,this.getMonth() > 9 ? (this.getMonth() + 1).toString() : '0' + (this.getMonth() + 1));
    str = str.replace(/M/g,this.getMonth() + 1);

    str = str.replace(/w|W/g,Week[this.getDay()]);

    str = str.replace(/dd|DD/,this.getDate() > 9 ? this.getDate().toString() : '0' + this.getDate());
    str = str.replace(/d|D/g,this.getDate());

    str = str.replace(/hh|HH/,this.getHours() > 9 ? this.getHours().toString() : '0' + this.getHours());
    str = str.replace(/h|H/g,this.getHours());
    str = str.replace(/mm/,this.getMinutes() > 9 ? this.getMinutes().toString() : '0' + this.getMinutes());
    str = str.replace(/m/g,this.getMinutes());

    str = str.replace(/ss|SS/,this.getSeconds() > 9 ? this.getSeconds().toString() : '0' + this.getSeconds());
    str = str.replace(/s|S/g,this.getSeconds());

    return str;
};

/*
 * 退出会话
 * @param {Boolean} 是否显示thanks窗口
 * */
ZC.chatOut = function(thanks) {
    var _t = ZC,
        api = _t.cacheInfo.api,
        targetObjList = _t.cacheInfo.targetObjList;

    // 更新保持会话标识
    _t.cacheFlag.isKeepSessions = false;
    // 更新status
    _t.cacheFlag.status = 'disabled';

    //TODO 判断是否评价过
    if(_t.cacheFlag.isSurveyed) {
        _t.common.footerManage.toggle(_t.msgFlag ? '1' : '1-2');
    } else {
        _t.common.footerManage.toggle(_t.msgFlag ? '0-1' : '0-1-2');
    }

    api.chatOut(function(res) {
        var data = _t.config.isResData ? res.data : res;

        if(data.status == 1) {
            // 更新是否已提交评论标识
            _t.cacheFlag.isCommented = false;
        }
    });
};

/*
 * ZC.setCookie 设置Cookie
 * @param {String} key
 * @param {Number} val
 * */
ZC.setCookie = function(key,val,date) {
    var _t = ZC,
        key = _t.cacheInfo.sysNum + "_" + key,
        dateNow = new Date(),
        dateStr = '';
    // 下一天
    dateNow.setTime(dateNow.getTime() + 24 * 3600 * 1000);
    // 转字符串
    dateStr = dateNow.toGMTString();

    document.cookie = key + "=" + val + ";expires=" + dateStr;
};
/*
 * ZC.getCookie 获取Cookie
 * @param {String} key
 * @return {Boolean}
 * */
ZC.getCookie = function(key) {
    var _t = ZC,
        key = _t.cacheInfo.sysNum + "_" + key,
        cookieStr = document.cookie,
        cookieArr = cookieStr.split('; '),
        cookieArrLen = cookieArr.length;

    for(var i = 0,
        item = '',
        itemArr = [];i < cookieArrLen;i++) {
        item = cookieArr[i];
        itemArr = item.split('=');

        if(key === itemArr[0]) {
            return itemArr[1];
        }
    }

    return false;
};
/*
 * ZC.clearCookie 清除Cookie
 * */
ZC.clearCookie = function(key) {
    var _t = ZC;

    _t.setCookie(key,"",-1);
};
/*
 * ZC.common ZC通用方法命名空间
 * */
ZC.namespace('ZC.common');

/*
 * dialog 组件 使用 new ZC.common.dialog
 * @param {Object} config 配置信息
 * @return {Object} 实例化对象
 * */
ZC.common.dialog = function(config) {

    var _t = this,
        _z =
        ZC,
        time = '-' + (new Date()).getTime(),
        eventType = _z.cacheInfo.eventType,
        docEventType = _z.cacheInfo.UA == 'xiaomi' ? 'touchstart' : eventType,
    // 默认配置
        defConfig = {
        // 如果没有设置ID则动态生成
        id : 'zcDialog' + time,
        //type: 'modal',   // type支持modal/alert
        className : [],// 最外层div的className
        // FIXME ??? 是否支持自定义样式。
        style : {

        },
        // 动画 Boolean|String
        animation : false,
        // 延时 Boolean|Number
        delay : false,
        // 键盘
        keyboard : true,
        // document 点击Document关闭
        document : true,
        // 遮罩 Boolean|Number Number型为Alpha值
        backdrop : true,
        // 结构
        structure : {
            header : true,
            body : true,
            errorMsg : false,
            footer : true
        },
        // 模板
        template : {
            boxStart : '<div id="' + 'zcDialog' + time + '"  class="zcDialog"><div class="zcDialog-modal">',
            boxEnd : '</div><div class="zcDialog-vertical"></div></div>',
            header : '<div class="zcDialog-header"></div>',
            bodyStart : '<div class="zcDialog-body">',
            bodyEnd : '</div>',
            errorMsg : '<div class="errorMsg"><span class="errorMsgText"></span><span class="errorMsgBtn"><a hidefocus href="javascript: void (0);" class="zhichiClose" title="结束对话"></a></span></div>',
            footer : '<div class="zcDialog-footer"></div>'
        },
        //template: '<div id="'+ 'zcDialog' + time +'"  class="zcDialog"><div class="zcDialog-modal"><div class="zcDialog-header"></div><div class="zcDialog-body"><div class="errorMsg"><span class="errorMsgText"></span><span class="errorMsgBtn"><a hidefocus href="javascript: void (0);" class="zhichiClose" title="结束对话"></a></span></div></div><div class="zcDialog-footer"></div></div></div>',
        // 数据
        data : {
            title : '',
            content : '',
            btn : {
                cancle : {
                    id : 'zcDialogCancle' + time,
                    title : '取消',
                    template : '<a id="' + 'zcDialogCancle' + time + '" class="zcDialog-btn zcDialog-cancel" href="javascript: void (0);"></a>',
                    callback : null
                },
                confirm : {
                    id : 'zcDialogConfirm' + time,
                    title : '确认',
                    template : '<a id="' + 'zcDialogConfirm' + time + '" class="zcDialog-btn zcDialog-confirm" href="javascript: void (0);"></a>',
                    callback : null
                }
            },
            // 按钮列表
            btnList : []
        },
        // 错误信息配置
        errorMsg : {
            // 是否启用错误信息
            isEnable : false,
            // 延时关闭(单位：毫秒);
            delay : false
        }
    },
    // 遮罩
        backdrop = {
        id : 'zcBackdrop' + time,
        template : '<div id="' + 'zcBackdrop' + time + '" class="zcBackdrop"></div>'
    },
    // 初始化配置信息
        initConfig = function() {
        if(config && typeof config === 'object') {
            // 深度合并
            return $.extend(true, {},defConfig,config);
        } else {
            return defConfig;
        }
    },
    // 初始化数据
        initData = function() {
        var data = config.data,
            tmpBtnObj = {};
        // 处理按钮
        for(var i = 0,
            btnListLen = data.btnList.length,
            item;i < btnListLen;i++) {
            item = data.btnList[i];
            if(data.btn.hasOwnProperty(item)) {
                tmpBtnObj[item] = data.btn[item];
            }
        }
        // 更新data
        config.data.btn = tmpBtnObj;

        // 取消按钮
        if(data.btn.hasOwnProperty('cancle') && (!data.btn.cancle.callback || typeof data.btn.cancle.callback !== 'function')) {
            data.btn.cancle.callback = function() {
                _t.hide();
            };
        }
        // 确认按钮
        if(data.btn.hasOwnProperty('confirm') && (!data.btn.confirm.callback || typeof data.btn.confirm.callback !== 'function')) {
            data.btn.confirm.callback = function() {
                _t.hide();
            };
        }

        return data;
    },
    // 初始化dom
        initDom = function() {
        // 初始化dialog Dom
        // 判断模板是否存在
        if(config.template) {
            // 判断模板是否为对象
            if( typeof config.template === 'object') {
                // 处理模板结构
                for(var key in config.structure) {
                    if(key === 'body') {
                        // 更新template对象
                        config.template['bodyStart'] = config.structure[key] ? config.template['bodyStart'] : '';
                        config.template['bodyEnd'] = config.structure[key] ? config.template['bodyEnd'] : '';
                    } else {
                        // 更新template对象
                        config.template[key] = config.structure[key] ? config.template[key] : '';
                    }
                }
                // 拼装template
                config.template = config.template['boxStart'] + config.template['header'] + config.template['bodyStart'] + config.template['errorMsg'] + config.template['bodyEnd'] + config.template['footer'] + config.template['boxEnd'];
            }

            // 插入body
            //$('body').append(config.template);
            $('.zc-chat').append(config.template);
            // 更新_t.dom
            _t.dom.dialog = $('#' + config.id);
            // 更新dialog class
            if(config.className && config.className.length) {
                for(var i = 0,
                    classNameLen = config.className.length,
                    item;i < classNameLen;i++) {
                    item = config.className[i];

                    _t.dom.dialog.addClass(item);
                }
            }
        }
        // 初始化backdrop Dom
        if(config.backdrop) {
            // 插入body
            //$('body').append(backdrop.template);
            $('.zc-chat').append(backdrop.template);
            // 更新_t.dom
            _t.dom.backdrop = $('#' + backdrop.id);
        }
    },
    // 初始化title/content
        initDomdata = function() {
        // 更新Header
        _t.dom.dialog.find('.zcDialog-header').html(config.data.title);
        // 更新Body,插入
        _t.dom.dialog.find('.zcDialog-body').append(config.data.content);
        // 更新Footer
        // 初始化“取消”按钮，绑定“取消”按钮点击事件
        if(config.data.btn.cancle) {
            var cancleItem = config.data.btn.cancle;

            _t.dom.dialog.find('.zcDialog-footer').append(cancleItem.template);
            _t.dom.dialog.find('#' + cancleItem.id).html(cancleItem.title);
            //_t.dom.dialog.find('#'+cancleItem.id).on('click', function () {
            _z.bindTargetEvent(_t.dom.dialog.find('#' + cancleItem.id),eventType, function() {
                cancleItem.callback();
            });
        }
        // 初始化“确认”按钮，绑定“确认”按钮点击事件
        if(config.data.btn.confirm) {
            var confirmItem = config.data.btn.confirm;

            _t.dom.dialog.find('.zcDialog-footer').append(confirmItem.template);
            _t.dom.dialog.find('#' + confirmItem.id).html(confirmItem.title);
            //_t.dom.dialog.find('#'+confirmItem.id).on('click', function () {
            _z.bindTargetEvent(_t.dom.dialog.find('#' + confirmItem.id),eventType, function() {
                confirmItem.callback();
            });
        }
    },
    // 初始化错误信息
        initErrorMsg = function() {
        // 错误信息
        if(config.errorMsg.isEnable) {
            _t.errorMsg = {
                target : _t.dom.dialog.find('.errorMsg')
            };
            _t.errorMsg.show = function(errorMsgText) {
                // 更新错误提示语
                if(errorMsgText) {
                    _t.errorMsg.target.find('.errorMsgText').text(errorMsgText);
                }
                _t.errorMsg.target.show();
                // 延时关闭
                if(config.errorMsg.delay) {
                    setTimeout(_t.errorMsg.hide,config.errorMsg.delay);
                }
            };
            _t.errorMsg.hide = function() {
                _t.errorMsg.target.hide();
            };
            // 绑定关闭事件
            //_t.errorMsg.target.find('.zhichiClose').on('click', function () {
            _z.bindTargetEvent(_t.errorMsg.target.find('.zhichiClose'),eventType, function() {
                _t.errorMsg.hide();
            });
        }
    },
    // 初始化 init
        init = function() {
        //console.log(ZC_Extend.getUrlQueryString('face'));

        // 初始化config
        config = initConfig();
        // 初始化数据
        config.data = initData();
        // 初始化dom
        initDom();
        // 初始化domData
        initDomdata();
        // 初始化errorMsg
        initErrorMsg();

        // 绑定键盘事件
        if(config.keyboard) {
            $('body').on('keyup', function(e) {
                if(27 === e.keyCode || 27 === e.which) {
                    _t.hide();
                }
            });
        }
        // 绑定Document事件,绑定遮罩点击事件
        if(config.document) {
            //$(document).on('click', function (e) {
            _z.bindTargetEvent(_t.dom.backdrop,docEventType, function(e) {
                if(e.target === e.currentTarget || e.target === _t.dom.dialog[0]) {
                    _t.hide();
                    if(config.data.btn.cancle) {
                        var cancleItem = config.data.btn.cancle;
                        cancleItem.callback();
                    }
                }
            });
        }
    };

    // dom对象
    _t.dom = {
        dialog : '',
        backdrop : ''
    };
    // 是否已创建dialog标识
    _t.isCreated = false;
    // data对象
    _t.data = {};

    // 创建 param {Function} callback 回调
    _t.create = function(callback) {
        if(!_t.isCreated) {
            _t.isCreated = true;
            init();
        }
        // 执行回调
        callback && callback();
    };
    // 重置 FIXME ??? 是否需要重置方法。
    _t.reSet = function() {

    };
    // 移除
    _t.remove = function() {
        if(_t.isCreated) {
            // 显示dialog
            _t.dom.dialog.remove();
            // 显示backdrop
            _t.dom.backdrop.remove();
            // 更新isCreated标识
            _t.isCreated = false;
        }
    };
    // 显示 param {Function} callback 回调
    _t.show = function(callback) {
        // 判断当前dialog是否已创建
        if(!_t.isCreated) {
            _t.create();
        };

        // FIXME ??? 是否考虑通过addClass来控制显示
        // 显示dialog
        _t.dom.dialog.fadeIn();
        // 显示backdrop
        _t.dom.backdrop.fadeIn();
        // 执行回调
        callback && callback();
    };
    // 隐藏 param {Function} callback 回调
    _t.hide = function(callback) {
        // 判断当前dialog是否已创建
        if(!_t.isCreated) {
            _t.create();
        };
        // 隐藏dialog
        _t.dom.dialog.fadeOut();
        // 隐藏backdrop
        _t.dom.backdrop.fadeOut();
        // 执行回调
        callback && callback();
    };
    // 切换 toggle param {Function} callback 回调
    _t.toggle = function(callback) {
        // 判断当前dialog是否已创建
        if(!_t.isCreated) {
            _t.create();
        };
        // 切换dialog显示、隐藏
        _t.dom.dialog.fadeToggle();
        // 切换backdrop显示、隐藏
        _t.dom.backdrop.fadeToggle();
        // 执行回调
        callback && callback();
    };

    return _t;
};

/*
 * 校验
 * @param {Object} el 目标对象
 * @param {Function} callback 回调方法
 * */
ZC.common.checkAll = function(el,callback) {
    var _t = ZC;

    if( typeof el == 'object' && el.find) {
        var elList = el.find('[reg]'),
            elListLen = elList.length,
            Reg = _t.config.Reg,
            errorMsg = null;

        if(elListLen) {
            // 循环校验
            for(var i = 0,
                item,
                itemVal,
                itemRegArr,
                itemReg,
                itemRegText;i < elListLen;i++) {
                // 判断是否已取得校验
                if(errorMsg) {
                    break;
                }

                item = $(elList[i]);
                itemVal = item.val();
                // 当前对象的Reg数组对象
                itemRegArr = Reg[item.attr('reg')];
                // 当前对象的Reg
                itemReg = itemRegArr[0];
                itemRegText = itemRegArr[1];
                for(var j in itemReg) {
                    // 判断是否已取得校验
                    if(errorMsg) {
                        break;
                    }
                    switch (j) {
                        case 'require':
                            // 判断require是否为true
                            if(itemRegText[j]) {
                                errorMsg = !itemVal.length ? itemRegText[j] : '';
                            }
                            break;
                        case 'maxLength':
                            errorMsg = itemVal.length > itemReg[j] ? itemRegText[j] : '';
                            break;
                        case 'minLength':
                            errorMsg = itemVal.length < itemReg[j] ? itemRegText[j] : '';
                            break;
                        case 'reg':
                            errorMsg = !itemReg[j].test(itemVal) ? itemRegText[j] : '';
                            break;
                    }
                }
            }
            // 执行回调
            if(callback) {
                return callback(errorMsg);
            } else {
                return errorMsg ? false : true;
            }
        }
    }
};

/* footer控制 */
ZC.common.footerManage = (function() {
    var _t = ZC,
        tmpObj = {};
    // 切换状态
    tmpObj.toggle = function(type) {
        var footer = _t.cacheInfo.targetObjList.funcPanel,
            blockObj;

        footer.removeClass('footerON footerOFF');
        // blockObj
        blockObj = footer.find('.footer-off .block');
        if(type) {
            footer.addClass('footerOFF');

            var typeArr = type.split('-'),
                typeArrLen = typeArr.length,
                item,
                tmpClassName;

            switch (typeArrLen) {
                case 1:
                    tmpClassName = 'blocks-one';
                    break;
                case 2:
                    tmpClassName = 'blocks-two';
                    break;
                case 3:
                    tmpClassName = 'blocks-three';
                    break;
            }
            // 处理样式
            footer.find('.footer-off').removeClass('blocks-one blocks-two blocks-three').addClass(tmpClassName);
            // 1.隐藏所有block
            blockObj.hide();
            // 2.显示相应的block
            for(var i = 0;i < typeArrLen;i++) {
                item = parseInt(typeArr[i]);
                $(blockObj[item]).show();
            }
        } else {
            footer.addClass('footerON');
        }
    };

    return tmpObj;
})();
/*
 * 文本框最大字数控制
 * @param {String} targetID 目标对象ID
 * @param {Number} maxLen 最大长度
 * */
ZC.common.textareaMaxlen = function(targetID,maxLen) {
    // 限制留言框最大字符数为200
    if(window.addEventListener) {
        document.getElementById(targetID).addEventListener('input', function() {
            if(this.value.length > maxLen) {
                this.value = this.value.substr(0,maxLen);
            }
        },false);
        // IE attachEvent
    } else if(window.attachEvent) {
        document.getElementById(targetID).attachEvent('onpropertychange', function() {
            if(this.value.length > maxLen) {
                this.value = this.value.substr(0,maxLen);
            }
        });
    }
};
/* 创建并显示留言弹窗 */
ZC.createLeaveMessageDialog = function() {
    var _t = ZC,
        _d,
        api = _t.cacheInfo.api,
        customConfig = _t.cacheInfo.customConfig;

    // 判断是否已创建留言dialog
    if(_t.cacheInfo.dialog['leaveMessage']) {
        _d = _t.cacheInfo.dialog['leaveMessage'];
        _d.show();
    } else {
        var tmpHtml = '<div class="leaveMessageBox">' + '<span class="leaveMessage-title">' + customConfig.msgTxt + '</span>' + '<form class="leaveMessage-form" id="leaveMessage-form">' + '<div class="linebox"><input reg="R1001" type="text" id="customerEmail" placeholder="邮箱"></div>' + '<div class="linebox"><textarea reg="R1002" id="ticketContent" placeholder="&nbsp;"></textarea></div>' + '</form>' + '</div>';

        _d = _t.cacheInfo.dialog['leaveMessage'] = new ZC.common.dialog({
            className : ['zcDialog-leaveMessage','zcDialog-full'],
            // 结构
            structure : {
                header : true,
                body : true,
                errorMsg : true,
                footer : true
            },
            data : {
                title : '<span class="header-left">请留言</span><span class="header-right"><a hidefocus href="javascript: void (0);" class="zhichiMin" title="最小化"><span></span></a></span>',
                content : tmpHtml,
                btn : {
                    confirm : {
                        title : '提交',
                        callback : function() {
                            // 校验
                            if(!_t.common.checkAll($('#leaveMessage-form'), function(errorMsg) {
                                if(errorMsg) {
                                    _d.errorMsg.show(errorMsg);
                                    return false;
                                } else {
                                    _d.errorMsg.hide();
                                    return true;
                                }
                            })) {
                                return;
                            };

                            api.postMsg({
                                ticketContent : _d.dom.dialog.find('#ticketContent').val() || '',
                                customerEmail : _d.dom.dialog.find('#customerEmail').val() || '',
                                customerPhone : '',
                                ticketFrom : 1,
                                customerSource : 1
                            }, function(res) {
                                // 判断是否提交成功 FIXME 需要取消健壮判断。
                                if(res && res.retCode === '000000') {
                                    // 隐藏弹窗
                                    _d.hide(function() {
                                        // 清除表单数据
                                        _d.dom.dialog.find('#customerEmail').val('');
                                        _d.dom.dialog.find('#ticketContent').val('');
                                    });
                                    // 显示留言成功dialog
                                    _t.createLeaveMessageSuccessDialog();
                                }
                            });
                        }
                    }
                },
                btnList : ['confirm']
            },
            // 错误信息配置
            errorMsg : {
                // 是否启用错误信息
                isEnable : true,
                // 延时关闭(单位：毫秒);
                delay : 5000
            }
        });
        // 显示弹窗
        _d.show(function() {
            // 处理样式
            //_d.dom.dialog.find('.zcDialog-header').css({'background-color': customConfig.color});
            //_d.dom.dialog.find('.zcDialog-footer .zcDialog-confirm').css({'color': customConfig.color});
            // 清除表单数据
            _d.dom.dialog.find('#customerEmail').val('');
            _d.dom.dialog.find('#ticketContent').val('');

            var $input = $('#ticketContent'),
                initPlaceholder,
                hidePHTip,
                dealPHTip;

            initPlaceholder = function($input,msg,classname) {
                var isIE = !!window.ActiveXObject || 'ActiveXObject' in window;
                var isPlaceholder = 'placeholder' in document.createElement('input');
                // if(isPlaceholder && !isIE){
                //     $input.attr('placeholder', msg);
                // }else{
                var $tip = $('<span class="' + classname + '">' + msg + '</span>');
                $input.after($tip);
                $.data($input[0],'tip',$tip);
                if($input.val() != '') {
                    hidePHTip($input);
                }
                dealPHTip($input,$tip);
                // }
            }
            hidePHTip = function($input) {
                var $tip = $.data($input[0],'tip');
                if($tip) {
                    $tip.hide();
                }
            }
            dealPHTip = function($input,$tip) {
                var _deal = function() {
                    var val = $input.val();
                    if(val == '') {
                        $tip.show();
                    } else {
                        $tip.hide();
                    }
                };
                $tip.click(function() {
                    $input.focus();
                });
                $input.on('input propertychange', function() {
                    clearTimeout(timeout);
                    var timeout = setTimeout(_deal,0);
                });
            }
            initPlaceholder($input,customConfig.msgTmp,'txt-tip');

            // // 设置文本域placeholder值
            // $('<style>' +
            //     '#ticketContent::-webkit-input-placeholder::before{content: "' + customConfig.msgTmp + '"; display: block; color: #999; }' +
            //     '#ticketContent::-moz-placeholder::before{content: "' + customConfig.msgTmp + '"; display: block; color: #999; }' +
            //     '#ticketContent:-moz-placeholder::before{content: "' + customConfig.msgTmp + '"; display: block; color: #999; }' +
            //     '#ticketContent:-ms-input-placeholder::before{content: "' + customConfig.msgTmp + '"; display: block; color: #999; }' +
            //     '</style>').appendTo('head');

            // 限制留言框最大字符数为200
            _t.common.textareaMaxlen('ticketContent',200);
            // 绑定最小化按钮
            //_d.dom.dialog.find('.zhichiMin').on('click', function () {
            _t.bindTargetEvent(_d.dom.dialog.find('.zhichiMin'),_t.cacheInfo.eventType, function() {
                _d.hide();
            });
        });
    }
};

/* 创建并显示留言成功弹窗 */
ZC.createLeaveMessageSuccessDialog = function() {
    var _t = ZC,
        _d,
        customConfig = _t.cacheInfo.customConfig;

    // 判断是否已创建留言dialog
    if(_t.cacheInfo.dialog['leaveMessageSuccess']) {
        _d = _t.cacheInfo.dialog['leaveMessageSuccess'];
        _d.show();
    } else {
        var tmpHtml = '<div class="leaveMessageSuccessBox">' + '<span class="leaveMessageSuccessBox-title"><span class="icon-img" style="background-color: ' + customConfig.color + '"><span></span></span><span class="icon-text">留言成功</span></span>' + '<span class="leaveMessageSuccessBox-info">我们将尽快联系您</span>' +
        //'<span class="leaveMessageSuccessBox-btn"><span class="recreateLeaveMessage">再次留言</span></span>'
        '</div>';

        _d = _t.cacheInfo.dialog['leaveMessageSuccess'] = new ZC.common.dialog({
            className : ['zcDialog-leaveMessageSuccess','zcDialog-full'],
            // 结构
            structure : {
                header : true,
                body : true,
                errorMsg : false,
                footer : false
            },
            data : {
                title : '<span class="header-left">请留言</span><span class="header-right"><a hidefocus href="javascript: void (0);" class="zhichiMin" title="最小化"><span></span></a></span>',
                content : tmpHtml,
                btnList : []
            }
        });
        // 显示leaveMessageSuccess
        _d.show(function() {
            // 处理样式
            //_d.dom.dialog.find('.zcDialog-header').css({'background-color': customConfig.color});
            //_d.dom.dialog.find('.recreateLeaveMessage').css({'color': customConfig.color});

        });
        // 绑定再次留言点击事件
        //_d.dom.dialog.find('.recreateLeaveMessage').on('click', function () {
        _t.bindTargetEvent(_d.dom.dialog.find('.recreateLeaveMessage'),_t.cacheInfo.eventType, function() {
            // 隐藏留言成功dialog
            _d.hide();
            // 显示留言dialog
            _t.cacheInfo.dialog['leaveMessage'].show();
        });
        // 绑定最小化按钮
        //_d.dom.dialog.find('.zhichiMin').on('click', function () {
        _t.bindTargetEvent(_d.dom.dialog.find('.zhichiMin'),_t.cacheInfo.eventType, function() {
            _d.hide();
        });
    }
};
/* 创建并显示结束会话弹窗 */
ZC.createCloseDialog = function() {
    var _t = ZC,
        _d,
        api = _t.cacheInfo.api,
        customConfig = _t.cacheInfo.customConfig;

    // 判断是否已创建留言dialog
    if(_t.cacheInfo.dialog['close']) {
        _d = _t.cacheInfo.dialog['close'];
        _d.show();
    } else {
        var tmpHtml = '<p>结束本次对话？</p>' + '<div class="iscloseDiv">' + '<a hidefocus href="javascript: void (0);" class="surEndBtn">立即结束</a>' + '<a hidefocus href="javascript: void (0);" class="surCloseBtn">取消</a>' + '</div>';

        _d = _t.cacheInfo.dialog['close'] = new ZC.common.dialog({
            className : ['zcDialog-close'],
            // 结构
            structure : {
                header : false,
                body : true,
                errorMsg : false,
                footer : false
            },
            data : {
                title : '',
                content : tmpHtml
            }
        });
        // 显示弹窗
        _d.show(function() {
            // 处理样式
            //_d.dom.dialog.find('.zcDialog-body .surEndBtn').css({'background-color': customConfig.color});

            // 绑定事件
            //_d.dom.dialog.find('.zcDialog-body .surEndBtn').on('click', function () {
            _t.bindTargetEvent(_d.dom.dialog.find('.zcDialog-body .surEndBtn'),_t.cacheInfo.eventType, function() {
                // 移除所有模式的样式
                //_t.updateTargetClass(targetObjList.surveyBox, feedbackClassList, true);
                // 提示信息：会话结束
                _t.showNoticeMsg(_t.formatLan(_t.cacheInfo.lan['L10021'],[_t.cacheInfo.lan['L10006']]),"system");
                // 禁用输入框、发送按钮
                //_t.disabledFuncCallback();
                // 会话是否结束
                //_t.cacheFlag.isOFF = true;
                _t.common.footerManage.toggle(_t.msgFlag ? '1' : '1-2');
                // 退出会话
                _t.chatOut(true);

                window.parent.postMessage('zhichiClose',"*");
                // 隐藏close弹窗
                _d.hide();
            });
            //_d.dom.dialog.find('.zcDialog-body .surCloseBtn').on('click', function () {
            _t.bindTargetEvent(_d.dom.dialog.find('.zcDialog-body .surCloseBtn'),_t.cacheInfo.eventType, function() {
                // 隐藏close弹窗
                _d.hide();
            });
        });
    }
};

/* 创建并显示机器人评价弹窗 */
ZC.createSurveyRobotDialog = function(isShowHeader) {
    var _t = ZC,
        _d,
        api = _t.cacheInfo.api,
        customConfig = _t.cacheInfo.customConfig,
        initDialog = function() {
        // 处理header显示
        if(isShowHeader) {
            _d.dom.dialog.find('.zcDialog-header').show();
        } else {
            _d.dom.dialog.find('.zcDialog-header').hide();
        }
        // 处理body显示
        _d.dom.dialog.find('.zcDialog-body .surquick').hide();
        // 处理footer显示
        _d.dom.dialog.find('.zcDialog-footer').hide();
        _d.dom.dialog.find('.zcDialog-body .active').removeClass('active');
        _d.dom.dialog.find('.zcDialog-body .chackSpan').removeClass('chackSpan');
    },
    // 提交评论
        surveySubmit = function(params) {
        api.comment(params, function(res) {
            // 更新已评价标识
            _t.cacheFlag.isSurveyed = true;

            if(_t.cacheFlag.isPeopleModel) {
                _t.setCookie('p',1);
            } else {
                _t.setCookie('r',1);
            }
            // 退出会话
            _t.chatOut();
            // 关闭评价dialog
            _d.hide();
            // 显示谢谢反馈
            _t.createSurveyThanksDialog();
        });
    };

    // 判断是否已创建dialog
    if(_t.cacheInfo.dialog['surveyRobot']) {
        _d = _t.cacheInfo.dialog['surveyRobot'];
        _d.show(initDialog);
    } else {
        var tmpHtml = '<div class="surveyRobot">' + '<div class="surmid">' + '<p class="surmidQus">是否解决了您的问题？</p>' + '<div class="chackyes">' + '<a hidefocus href="javascript:;" class="surYes"><span class="spanYes"></span>是</a>' + '<a hidefocus href="javascript:;" class="surNo"><span class="spanNo"></span>否</a>' + '</div>' + '</div>' + '<div class="surquick">' + '<p class="surquickp1">是否有以下情况？</p>' + '<div class="surqList">' + '<span><i>答非所问</i></span>' + '<span><i>理解能力差</i></span>' + '<span><i>问题不能回答</i></span>' + '<span><i>不礼貌</i></span>' + '</div>' + '<div class="surText">' + '<textarea id="surveyRobotRemark" class="surTextInput" placeholder="&nbsp;"></textarea>' + '</div>' + '</div>' + '</div>';

        _d = _t.cacheInfo.dialog['surveyRobot'] = new ZC.common.dialog({
            className : ['zcDialog-survey','zcDialog-surveyRobot'],
            // 结构
            structure : {
                header : true,
                body : true,
                errorMsg : false,
                footer : true
            },
            data : {
                title : '<span class="header-left"><span class="surTip"><span class="surtipbg"></span>提示：即将结束本次对话</span></span><span class="header-right"><a hidefocus href="javascript: void (0);" class="surEndBtn">立即结束</a><a hidefocus href="javascript: void (0);" class="surCloseBtn">取消</a></span>',
                content : tmpHtml,
                btn : {
                    confirm : {
                        title : '提交评价',
                        callback : function() {
                            // 添加标识，防重
                            if(!_t.cacheFlag.isCommented) {
                                _t.cacheFlag.isCommented = true;

                                var tagList = _d.dom.dialog.find('.zcDialog-body .surqList i'),
                                    tagListLen = tagList.length,
                                    tagStr = '';

                                for(var i = 0,
                                    item;i < tagListLen;i++) {
                                    item = tagList[i];

                                    if($(item).hasClass('chackSpan')) {
                                        tagStr += ',' + (i + 1);
                                    }
                                }
                                // 移除最前的一个逗号
                                tagStr = tagStr.substring(1);
                                // 提交评价
                                surveySubmit({
                                    // 当为机器人时，0代表未解决，5代表解决
                                    score : _d.data.score,
                                    // 标签 Number
                                    tag : tagStr,
                                    // 备注
                                    remark : _d.dom.dialog.find('.surTextInput').val(),
                                    // 0 机器人 1 人工
                                    type : 0
                                });
                            }
                        }
                    }
                },
                btnList : ['confirm']
            }
        });
        // 显示弹窗
        _d.show(function() {
            // 处理状态
            initDialog();

            // 处理样式
            //_d.dom.dialog.find('.zcDialog-header').css({'background-color': customConfig.color});
            //_d.dom.dialog.find('.zcDialog-footer .zcDialog-confirm').css({'color': customConfig.color});
            // 设置文本域placeholder值
            /*$('<style>' +
            '#surveyRobotRemark::-webkit-input-placeholder::before{content: "欢迎给我们的服务提建议"; display: block; color: #999; }' +
            '#surveyRobotRemark::-moz-placeholder::before{content: "欢迎给我们的服务提建议"; display: block; color: #999; }' +
            '#surveyRobotRemark:-moz-placeholder::before{content: "欢迎给我们的服务提建议"; display: block; color: #999; }' +
            '#surveyRobotRemark:-ms-input-placeholder::before{content: "欢迎给我们的服务提建议"; display: block; color: #999; }' +
            '</style>').appendTo('head');*/

            // 绑定事件
            // 立即结束
            //_d.dom.dialog.find('.zcDialog-header .surEndBtn').on('click', function () {
            _t.bindTargetEvent(_d.dom.dialog.find('.zcDialog-header .surEndBtn'),_t.cacheInfo.eventType, function() {
                // 提示信息：会话结束
                _t.showNoticeMsg(_t.formatLan(_t.cacheInfo.lan['L10021'],[_t.cacheInfo.lan['L10006']]),"system");
                // 禁用输入框、发送按钮
                //_t.disabledFuncCallback();
                // 会话是否结束
                //_t.cacheFlag.isOFF = true;
                _t.common.footerManage.toggle(_t.msgFlag ? '1' : '1-2');
                // 退出会话
                _t.chatOut(true);

                window.parent.postMessage('zhichiClose',"*");
                // 隐藏close弹窗
                _d.hide();
            });
            // 取消
            //_d.dom.dialog.find('.zcDialog-header .surCloseBtn').on('click', function () {
            _t.bindTargetEvent(_d.dom.dialog.find('.zcDialog-header .surCloseBtn'),_t.cacheInfo.eventType, function() {
                // 隐藏close弹窗
                _d.hide();
            });
            /* 绑定是否已解决中的“是” */
            //_d.dom.dialog.find('.zcDialog-body .surYes').on('click', function () {
            _t.bindTargetEvent(_d.dom.dialog.find('.zcDialog-body .surYes'),_t.cacheInfo.eventType, function() {
                _d.dom.dialog.find('.zcDialog-body .surYes').toggleClass('active');
                _d.dom.dialog.find('.zcDialog-body .surNo').removeClass('active');
                // 更新data数据
                _d.data.score = 5;

                // 添加标识，防重
                if(!_t.cacheFlag.isCommented) {
                    _t.cacheFlag.isCommented = true;

                    surveySubmit({
                        // 当为机器人时，0代表未解决，5代表解决
                        score : 5,
                        // 标签 Number
                        tag : '',
                        // 备注
                        remark : '',
                        // 0 机器人 1 人工
                        type : 0
                    });
                }
            });
            /* 绑定是否已解决中的“否” */
            //_d.dom.dialog.find('.zcDialog-body .surNo').on('click', function () {
            _t.bindTargetEvent(_d.dom.dialog.find('.zcDialog-body .surNo'),_t.cacheInfo.eventType, function() {
                _d.dom.dialog.find('.zcDialog-body .surNo').toggleClass('active');
                _d.dom.dialog.find('.zcDialog-body .surYes').removeClass('active');
                // 更新data数据
                _d.data.score = 0;

                _d.dom.dialog.find('.zcDialog-body .surquick').show();
                _d.dom.dialog.find('.zcDialog-footer').show();
                // 更新输入框文本 '欢迎给我们的服务提建议'
                _d.dom.dialog.find('.zcDialog-body .surTextInput').val('');
            });
            /* 默认评价选项点击事件 */
            //_d.dom.dialog.find('.zcDialog-body .surqList').on('click', 'i', function (e) {
            _t.bindTargetEvent(_d.dom.dialog.find('.zcDialog-body .surqList'),_t.cacheInfo.eventType,'i', function() {
                $(e.currentTarget).toggleClass("chackSpan");
            });
            // 限制留言框最大字符数为200
            _t.common.textareaMaxlen('surveyRobotRemark',70);
        });

    }
};
/* 创建并显示人工客服评价弹窗 */
ZC.createSurveyPeopleDialog = function(isShowHeader) {
    var _t = ZC,
        _d,
        api = _t.cacheInfo.api,
        customConfig = _t.cacheInfo.customConfig,
        modeClass,
        eventType = _t.cacheInfo.eventType,
        docEventType = _t.cacheInfo.UA == 'xiaomi' ? 'touchstart' : eventType,
        initDialog = function() {
        // 处理header显示
        if(isShowHeader) {
            _d.dom.dialog.find('.zcDialog-header').show();
        } else {
            _d.dom.dialog.find('.zcDialog-header').hide();
        }
        // 处理body显示
        _d.dom.dialog.find('.zcDialog-body .surquick').hide();
        // 处理footer显示
        //_d.dom.dialog.find('.zcDialog-footer').hide();
        _d.dom.dialog.find('.zcDialog-footer').show();
        _d.dom.dialog.find('.zcDialog-footer .zcDialog-cancel').show();
        _d.dom.dialog.find('.zcDialog-footer .zcDialog-confirm').hide();

        _d.dom.dialog.find('.zcDialog-body .chose').removeClass('chose');
        _d.dom.dialog.find('.zcDialog-body .chackSpan').removeClass('chackSpan');
    },
    // 提交评论
        surveySubmit = function(params) {
        api.comment(params, function(res) {
            // 更新已评价标识
            _t.cacheFlag.isSurveyed = true;

            if(_t.cacheFlag.isPeopleModel) {
                _t.setCookie('p',1);
            } else {
                _t.setCookie('r',1);
            }
            // 退出会话
            _t.chatOut();
            // 关闭评价dialog
            _d.hide();
            // 显示谢谢反馈
            _t.createSurveyThanksDialog();

        });
    };

    // 判断是否已创建dialog
    if(_t.cacheInfo.dialog['surveyPeople']) {
        _d = _t.cacheInfo.dialog['surveyPeople'];
        _d.show(initDialog);
    } else {
        var tmpHtml = '<div class="surveyPeople">' + '<div class="surmid">' + '<p class="surmidQus">评价客服</p>' + '<div class="chackStart">' + '<span></span>' + '<span></span>' + '<span></span>' + '<span></span>' + '<span></span>' + '</div>' + '</div>' + '<div class="surquick">' + '<p class="surquickp1">请监督客服是否有以下问题</p>' + '<div class="surqList">' + '<span><i>服务态度差</i></span>' + '<span><i>回答不及时</i></span>' + '<span><i>没解决问题</i></span>' + '<span><i>不礼貌</i></span>' + '</div>' + '<div class="surText">' + '<textarea id="surveyPeopleRemark" class="surTextInput" placeholder="&nbsp;"></textarea>' + '</div>' + '</div>' + '</div>';

        _d = _t.cacheInfo.dialog['surveyPeople'] = new ZC.common.dialog({
            className : ['zcDialog-survey','zcDialog-surveyPeople'],
            // 结构
            structure : {
                header : true,
                body : true,
                errorMsg : false,
                footer : true
            },
            data : {
                title : '<span class="header-left"><span class="surTip"><span class="surtipbg"></span>提示：即将结束本次对话</span></span><span class="header-right"><a hidefocus href="javascript: void (0);" class="surEndBtn">立即结束</a><a hidefocus href="javascript: void (0);" class="surCloseBtn">取消</a></span>',
                content : tmpHtml,
                btn : {
                    confirm : {
                        title : '提交评价',
                        callback : function() {
                            // 添加标识，防重
                            if(!_t.cacheFlag.isCommented) {
                                _t.cacheFlag.isCommented = true;

                                var tagList = _d.dom.dialog.find('.zcDialog-body .surqList i'),
                                    tagListLen = tagList.length,
                                    tagStr = '';

                                for(var i = 0,
                                    item;i < tagListLen;i++) {
                                    item = tagList[i];

                                    if($(item).hasClass('chackSpan')) {
                                        tagStr += ',' + (i + 1);
                                    }
                                }
                                // 移除最前的一个逗号
                                tagStr = tagStr.substring(1);
                                // 提交评价
                                surveySubmit({
                                    // 当为机器人时，0代表未解决，5代表解决
                                    score : _d.data.score,
                                    // 标签 Number
                                    tag : tagStr,
                                    // 备注
                                    remark : _d.dom.dialog.find('.surTextInput').val(),
                                    // 0 机器人 1 人工
                                    type : 1
                                });
                            }
                        }
                    },
                    cancle : {
                        title : '取消',
                        callback : function() {
                            _d.hide();
                        }
                    }
                },
                btnList : ['confirm','cancle']
            }
        });
        // 显示弹窗
        _d.show(function() {
            // 处理状态
            initDialog();

            // 处理样式
            //_d.dom.dialog.find('.zcDialog-header').css({'background-color': customConfig.color});
            //_d.dom.dialog.find('.zcDialog-body .surqList i').css({'color': customConfig.color, 'border-color': customConfig.color});
            //_d.dom.dialog.find('.zcDialog-footer .zcDialog-confirm').css({'color': customConfig.color});
            /*$('<style>' +
            '#surveyPeopleRemark::-webkit-input-placeholder::before{content: "欢迎给我们的服务提建议"; display: block; color: #999; }' +
            '#surveyPeopleRemark::-moz-placeholder::before{content: "欢迎给我们的服务提建议"; display: block; color: #999; }' +
            '#surveyPeopleRemark:-moz-placeholder::before{content: "欢迎给我们的服务提建议"; display: block; color: #999; }' +
            '#surveyPeopleRemark:-ms-input-placeholder::before{content: "欢迎给我们的服务提建议"; display: block; color: #999; }' +
            '</style>').appendTo('head');*/

            // 绑定事件
            // 立即结束
            //_d.dom.dialog.find('.zcDialog-header .surEndBtn').on('click', function () {
            _t.bindTargetEvent(_d.dom.dialog.find('.zcDialog-header .surEndBtn'),_t.cacheInfo.eventType, function() {
                // 提示信息：会话结束
                _t.showNoticeMsg(_t.formatLan(_t.cacheInfo.lan['L10021'],[_t.cacheInfo.lan['L10006']]),"system");
                // 禁用输入框、发送按钮
                //_t.disabledFuncCallback();
                // 会话是否结束
                //_t.cacheFlag.isOFF = true;
                _t.common.footerManage.toggle(_t.msgFlag ? '1' : '1-2');
                // 退出会话
                _t.chatOut(true);

                window.parent.postMessage('zhichiClose',"*");
                // 隐藏close弹窗
                _d.hide();
            });
            // 取消
            //_d.dom.dialog.find('.zcDialog-header .surCloseBtn').on('click', function () {
            _t.bindTargetEvent(_d.dom.dialog.find('.zcDialog-header .surCloseBtn'),_t.cacheInfo.eventType, function() {
                // 隐藏close弹窗
                _d.hide();
            });
            //选星
            _d.dom.dialog.find('.chackStart').on('mouseleave', function(e) {
                var currentTarget = $(e.currentTarget);

                // 判断是否已点击过
                if(_t.cacheFlag.isCheckedStart) {
                    return;
                }

                _d.dom.dialog.find('.chackStart span').removeClass('chose');
            });
            _d.dom.dialog.find('.chackStart span').on('mouseover', function(e) {
                var currentTarget = $(e.currentTarget),
                    indexVal = currentTarget.index();

                // 判断是否已点击过
                if(_t.cacheFlag.isCheckedStart) {
                    return;
                }

                _d.dom.dialog.find('.chackStart span').each(function(i) {
                    if(i <= indexVal) {
                        $(this).addClass('chose');
                    } else {
                        $(this).removeClass('chose');
                    }
                });
            });
            //_d.dom.dialog.find('.chackStart span').on('click', function (e) {
            _t.bindTargetEvent(_d.dom.dialog.find('.chackStart span'),docEventType, function(e) {
                var currentTarget = $(e.currentTarget),
                    indexVal = currentTarget.index();

                // 是否已点击过
                _t.cacheFlag.isCheckedStart = true;

                _d.dom.dialog.find('.chackStart span').removeClass('chose');
                _d.dom.dialog.find('.chackStart span').each(function(i) {
                    if(i <= indexVal) {
                        $(this).addClass("chose");
                    }
                });

                // 更新data数据
                _d.data.score = indexVal + 1;

                // 4星的时候也需要评价
                if(3 >= indexVal) {
                    _d.dom.dialog.find('.zcDialog-body .surquick').show();
                    _d.dom.dialog.find('.zcDialog-footer .zcDialog-cancel').remove();
                    _d.dom.dialog.find('.zcDialog-footer .zcDialog-confirm').show();
                    _d.dom.dialog.find('.zcDialog-footer').show();
                    // 更新输入框文本 '欢迎给我们的服务提建议'
                    _d.dom.dialog.find('.zcDialog-body .surTextInput').val('');
                } else {
                    // 添加标识，防重
                    if(!_t.cacheFlag.isCommented) {
                        _t.cacheFlag.isCommented = true;

                        // 提交评价
                        surveySubmit({
                            // 当为机器人时，0代表未解决，5代表解决
                            score : _d.data.score,
                            // 标签 Number
                            tag : '',
                            // 备注
                            remark : '',
                            // 0 机器人 1 人工
                            type : 1
                        });
                    }
                }
            });
            /* 默认评价选项点击事件 */
            //_d.dom.dialog.find('.zcDialog-body .surqList').on('click', 'i', function (e) {
            _t.bindTargetEvent(_d.dom.dialog.find('.zcDialog-body .surqList'),_t.cacheInfo.eventType,'i', function(e) {
                $(e.currentTarget).toggleClass("chackSpan");
            });
            // 限制留言框最大字符数为70
            _t.common.textareaMaxlen('surveyPeopleRemark',70);
        });
    }
};

/* 创建并显示谢谢反馈弹窗 */
ZC.createSurveyThanksDialog = function() {
    var _t = ZC,
        _d,
        autoHide = function() {
        setTimeout(function() {
            _d.hide();
        },2500);
    };

    // 判断是否已创建留言dialog
    if(_t.cacheInfo.dialog['surveyThanks']) {
        _d = _t.cacheInfo.dialog['surveyThanks'];
        _d.show(autoHide);
    } else {
        _d = _t.cacheInfo.dialog['surveyThanks'] = new ZC.common.dialog({
            className : ['zcDialog-surveyThanks'],
            // 结构
            structure : {
                header : false,
                body : true,
                errorMsg : false,
                footer : false
            },
            data : {
                content : '<div class="surThanks"><p>感谢您的反馈^-^！</p></div>'
            }
        });
        // 显示弹窗
        _d.show(autoHide);
    }
};
/* 创建语音通话弹窗 */
ZC.createVoiceCallsDialog = function() {
    var _t = ZC,
        _d,
        api = _t.cacheInfo.api;

    // 判断是否已创建留言dialog
    if(_t.cacheInfo.dialog['voiceCalls']) {
        _d = _t.cacheInfo.dialog['voiceCalls'];
        _d.show();
    } else {
        _d = _t.cacheInfo.dialog['voiceCalls'] = new ZC.common.dialog({
            className : ['zcDialog-voiceCalls'],
            // 结构
            structure : {
                header : false,
                body : true,
                errorMsg : true,
                footer : true
            },
            data : {
                //content: '<div class="persistence">继续！</div>'
                /*content: '<p>立即和客服通话</p><div class="addCall"><input type="text" id="voiceCallsNum">'+
                 '<a hidefocus="" href="javascript:;" class="sendCallBtn">提交</a>'+
                 '<a hidefocus="" href="javascript:;" class="addCallClose">取消</a>'+
                 '</div>',*/
                content : '<p>立即和客服通话</p><div class="addCall" id="addCallBox"><input reg="R1003" type="text" id="voiceCallsNum" placeholder="请输入您的电话"></div>',
                btn : {
                    confirm : {
                        title : '提交',
                        callback : function() {

                            // 校验
                            if(!_t.common.checkAll($('#addCallBox'), function(errorMsg) {
                                if(errorMsg) {
                                    _d.errorMsg.show(errorMsg);
                                    return false;
                                } else {
                                    _d.errorMsg.hide();
                                    return true;
                                }
                            })) {
                                return;
                            };
                            // 提交
                            // 防重
                            if(_t.cacheFlag.isSubmitedTelNum) {
                                return;
                            } else {
                                api.sendCall({
                                    called : $('#voiceCallsNum').val()
                                }, function(res) {
                                    _t.cacheFlag.isSubmitedTelNum = true;
                                    _t.showNoticeMsg(_t.cacheInfo.lan['L10027'],"system");
                                    _d.hide();
                                    // 显示语音通话提交成功
                                    _t.createVoiceCallsSuccessDialog();
                                });
                            }
                        }
                    },
                    cancle : {
                        title : '取消',
                        callback : function() {
                            _d.hide();
                        }
                    }
                },
                btnList : ['confirm','cancle']
            },
            // 错误信息配置
            errorMsg : {
                // 是否启用错误信息
                isEnable : true,
                // 延时关闭(单位：毫秒);
                delay : 5000
            }
        });
        // 显示弹窗
        _d.show();
    }
};
// 语音通话提交成功
ZC.createVoiceCallsSuccessDialog = function() {
    var _t = ZC,
        _d,
        autoHide = function() {
        setTimeout(function() {
            _d.hide();
        },2500);
    };

    // 判断是否已创建留言dialog
    if(_t.cacheInfo.dialog['voiceCallsSuccess']) {
        _d = _t.cacheInfo.dialog['voiceCallsSuccess'];
        _d.show(autoHide);
    } else {
        _d = _t.cacheInfo.dialog['voiceCallsSuccess'] = new ZC.common.dialog({
            className : ['zcDialog-voiceCallsSuccess'],
            // 结构
            structure : {
                header : false,
                body : true,
                errorMsg : false,
                footer : false
            },
            data : {
                content : '<div class="voiceCallsSuccess"><p>提交成功，客服将在2分钟内给您致电</p></div>'
            }
        });
        // 显示弹窗
        _d.show(autoHide);
    }
};
//TODO 留言关闭事件
ZC.leaveSwitch = function() {
};
//TODO url参数传递
ZC.UrlParamTransmit = function(){
    var _t = ZC;
    //var args = _t.config.backArgs ? [{
    //    'sysNum' : _t.cacheInfo.api.sysNum
    //},{
    //    'uid' : _t.cacheInfo.api.uid
    //},{
    //    'back' : '1'
    //}] : [{
    //    'sysNum' : _t.cacheInfo.api.sysNum
    //},{
    //    'uid' : _t.cacheInfo.api.uid
    //}];
    var args =  [{
        'sysNum' : _t.cacheInfo.api.sysNum
    },{
        'uid' : _t.cacheInfo.api.uid
    }];
    if(_t.config.backArgs){
        args.push({'back':'1'});
    }
    if(_t.config.sourceArgs){
        args.push({'source':_t.config.sourceVal});
    }
    return args;
}

/*
* 初始化页面
* */
// 执行loading效果
//ZC.loading().show();
$(function() {
    /* 配置参数（FIXME 注意不要直接赋值config，否则会覆写） */
    ZC.config.targetList = {
        sendBtn : '#sendBtn',// 发送按钮
        inputMsg : '#inputMsg',// 问题输入框
        chatPanel : '#chatPanel',// 消息列表面板
        chatPanelList : '#chatPanelList',//消息列表
        funcPanel : '#funcPanel',// 聊天功能面板
        chatSwitch : '#chatSwitch',// 转人工
        chatSwitchBox : '#chatSwitchBox',// 转人工BOX
        chatCamera : '#chatCamera',// 拍照File
        chatCameraBox : '#chatCameraBox',// 拍照BOX
        chatImg : '.webchat_img_upload',// 上传的图片
        //systemMsgPanel: '#systemMsgPanel', // 系统通知消息面板
        bigImgPanel : '#bigImgPanel',// 大图面板
        bigImgPanelBox : '#bigImgPanelBox',// 大图盒子
        loadingObj : '.zc-loading',// loading
        zcAudio : '#zcAudio',// audio
        setStyle : '#setStyle',// setStyle
        pullDown : '#pullDown',// 下拉刷新
        topPanel : '#topPanel',// 顶部面板
        goBackBtn : '#goBackBtn',// 返回按钮
        voiceCalls : '#voiceCalls',
        leaveMessage : '#leaveMessage',
        footerOFF : '.footer-off',
        systemMsgLeaveMessage : '#systemMsgLeaveMessage'
    };
    ZC.cacheFlag.isLoaded = true;
    /* 初始化页面 */
    ZC.init();

});
