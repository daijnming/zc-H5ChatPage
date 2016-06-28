var initConfig = function() {

    //引用外部js
    var Comm = require('./comm.js');
    var Promise = require('./util/promise.js');

    var outerPromise = new Promise();
    //api接口
    var api = {
        config_url : '/chat/user/config.action',
        init_url : '/chat/user/init.action'
    };
    //存储数据对象
    var That = {};
    That.cacheInfo = {};

    That.cacheInfo.flags = {
        status : 'enabled',
        isLoaded : false,
        pageNow : 1,
        pageSize : 20,
        moreHistroy : false,
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
    //是否开启系统提示语
    var isLanOpen = true,
        lanType = 'CN';
    // 语言设置 系统提示语言 'CN' 中文   ‘EN’ 英文  ‘JP’ 日文
    var lanConfig = function(lanType) {
        switch (lanType) {
            case 'CN':
                return {
                    'L10001' : '暂时无法转接人工客服',
                    'L10002' : '您好,{0}接受了您的请求',// 注意多个替换点从0开始
                    'L10003' : '您已经与服务器断开连接,{0}',
                    'L10004' : '排队中，您在队伍中的第{0}个',
                    'L10005' : '您在思考人生？有问题请随时提问哦',
                    'L10006' : '<a href="javascript: window.location.reload();">重新接入</a>',
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
                };
            case 'EN':
                return {
                    'L10001' : 'Sorry!',
                    'L10002' : 'Hello,{0}Plase holdon'
                };
            case "JP":
                break;

        }
    };
    //初始化配置信息
    var config = {
        //FIXME 初始化url参数
        initParams : function() {
            var that = That.cacheInfo.urlParams = {};
            var _urlParams = Comm.getQueryParam();
            if(_urlParams) {
                for(var item in _urlParams) {
                    that[item] = _urlParams[item];
                }
            }
        },
        //FIXME 初始化UA参数
        initUA : function() {
            var that = That.cacheInfo.UAInfo = {};
            // FIXME 是否添加魅族机器'mz'还需验证。
            uaList = ['mz','xiaomi','android','ipad','iphone'],
            pcUaList = ['windows','linux','mac'],
            uaListLen = uaList.length,
            pcUaListLen = pcUaList.length,
            userAgent = navigator.userAgent.toLowerCase(),
            uaWidth = $(window).width(),
            uaHeight = $(window).height(),
            uaIndex = 0,
            iphoneVersion = 'iphone-5',
            returnUA = '';
            that.uaHeight = uaHeight;
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
                    that.iphoneVersion = iphoneVersion;
                    that.UA = item;
                    break;
                }
                // 2.识别其他机器
                if(uaIndex > 0) {
                    that.UA = item;
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
                        that.UA = 'pc';
                        break;
                    }
                }
            }
        },
        //FIXME 初始化浏览器信息
        initBrowser : function() {
            var that = That.cacheInfo.browser = {};
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
                    that.browser = item;
                    return;
                    //  return item;
                }
            }
        },
        //FIXME 初始化语言设置
        initLanguage : function() {
            var that = That.cacheInfo.language = {};
            //如果打开就显示系统提示
            if(isLanOpen) {
                that.open = true;
                that.lan = lanConfig(lanType);
            } else {
                that.open = false;
            }
        },
        //FIXME 初始化Event类型
        initEventType : function() {
            var that = That.cacheInfo.eventType = {};
            if(That.cacheInfo.UAInfo.UA == 'xiaomi') {
                //小米是mousedown事件
                that.type = 'mousedown';
                //  return 'mousedown';
            } else if(That.cacheInfo.UAInfo.UA != 'pc') {
                var isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),
                    hasTouch = 'ontouchstart' in window && !isTouchPad;
                that.type = hasTouch ? 'touchstart' : 'mousedown';
                //  return hasTouch ? 'touchstart' : 'mousedown';
            } else {
                that.type = 'click';
                //  return 'click';
            }
        },
        //FIXME 初始化用户信息
        initUserInfo : function() {
            //工单来源，0客服提交，1 PC普通用户留言提交，2 H5普通用户留言提交，3普通用户微信提交，4普通用户APP提交
            // 用户来源，PC 0,微信 1 ,APP 2,WAP 4
            var oSource = 4,// 用户来源 0：PC 1：微信 2：APP 3：微博 4：WAP FIXME 0：PC 1：移动端 2：APP
                urlParams = Comm.getQueryParam(),
                sourceData = urlParams['source'];
            That.cacheInfo.userInfo = {
                source : sourceData >= 0 ? sourceData : oSource,
                tel : urlParams['tel'] ? urlParams['tel'] : '',
                uname : urlParams['uname'] ? urlParams['uname'] : '',
                partnerId : urlParams['partnerId'] ? urlParams['partnerId'] : '',
                email : urlParams['email'] ? urlParams['email'] : '',
                visitUrl : urlParams['visitUrl'] ? urlParams['visitUrl'] : Comm.preURLLink,
                visitTitle : urlParams['visitTitle'] ? urlParams['visitTitle'] : '',
                face : urlParams['face'] ? urlParams['face'] : 'http://img.sobot.com/console/common/face/user.png',//默认用户头像
                back : urlParams['back'] ? urlParams['back'] : ''
            };
        },
        //FIXME 初始化SysNum系统 id
        initSysNum : function() {
            That.cacheInfo.sysNum = Comm.getQueryParam()['sysNum'];
        }
    };

    var judgeEnviroment = function() {
        var promise = new Promise();
        $.ajax({
            'url' : '/wap/admins_new/getEnvironment',
            'dataType' : 'json',
            'data' : {},
            'success' : function(ret) {
                promise.resolve('success');
            },
            'error' : function(ret) {
                promise.resolve('fail');
            }
        });
        return promise;
    };

    var getLeaveMessage = function(params) {
        var arr = ['leaveMessage.html'];
        var count = 0;
        for(var el in params) {
            var value = encodeURIComponent(params[el]);
            if(count == 0) {
                arr.push("?")
            } else {
                arr.push("&");
            }
            arr.push(el + "=" + value);
            count++;
        }
        var str = '您可以<a href="' + arr.join("") + '" >留言</a>"';
        var div = $("<div></div>");
        div.html(str);
        console.log(str);
        return div.text();
    };
    //promise方法
    var promiseHandler = function() {
        judgeEnviroment().then(function(value,promise) {
            var promise = promise || new Promise();
            config.initUA();
            config.initParams();
            config.initLanguage();
            config.initSysNum();
            config.initBrowser();
            config.initUserInfo();
            config.initEventType();
            $.ajax({
                type : "post",
                url : api.config_url,
                dataType : "json",
                data : {
                    sysNum : That.cacheInfo.sysNum,
                    source : That.cacheInfo.userInfo.source
                },
                success : (function(data) {
                    That.cacheInfo.apiConfig = data;
                    if(value === 'success') {
                        data.websocketUrl = "";
                    } else {
                        data.websocketUrl = "ws://139.129.95.94:9000/ws";
                    }
                    promise.resolve();
                })
            });
            return promise;
        }).then(function() {
            $.ajax({
                type : "post",
                url : api.init_url,
                dataType : "json",
                data : {
                    sysNum : That.cacheInfo.sysNum,
                    source : That.cacheInfo.userInfo.source,
                    partnerId : That.cacheInfo.userInfo.partnerId,
                    tel : That.cacheInfo.userInfo.tel,
                    email : That.cacheInfo.userInfo.email,
                    uname : That.cacheInfo.userInfo.uname,
                    visitTitle : That.cacheInfo.userInfo.visitTitle,
                    visitUrl : That.cacheInfo.userInfo.visitUrl,
                    face : That.cacheInfo.userInfo.face
                },
                success : function(res) {
                    var data = res.data ? res.data : res;
                    That.cacheInfo.apiInit = data;
                    That.cacheInfo.apiConfig.leaveMsg = That.cacheInfo.apiConfig.msgflag == 0 ? getLeaveMessage(That.cacheInfo.urlParams) : '';
                    outerPromise.resolve(That.cacheInfo);
                }
            });
        });
    };

    var init = function() {
        promiseHandler();
    };
    init();
    return outerPromise;

};
module.exports = initConfig;
