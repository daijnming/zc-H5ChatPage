
var initConfig = function(){
  //存储数据对象
  var That = {};
  That.cacheInfo = {};
  //Dom元素
  var headerBack,//返回条颜色
      userChatBox,//用户聊天内容背景色
      chatMsgList,//聊天窗体
      pullDown;//下拉刷新

  //暂时系统支持英语中文，英文提示语
  var language ={'isOpen':true,'lan':'zh'};

  //api
  var host = 'http://test.sobot.com/chat';
  var api={
    config_url:host+'/user/config.action',
    init_url:host+'/user/init.action'
  };

  //引用外部js
  var Comm = require('../util/comm.js');
  var Promise = require('../util/promise.js');

  //初始化配置信息
  var config = {
    //FIXME 初始化url参数
    initParams:function(){
      var that = That.cacheInfo.initParams={};
      var _urlParams = Comm.getQueryParam();
      if(_urlParams){
        for(var item in _urlParams){
          that[item]=_urlParams[item];
        }
      }
    },
    //FIXME 初始化UA参数
    initUA:function(){
        var that = That.cacheInfo.initUA ={};
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
         for(var i = 0,item = '';i < pcUaListLen;i++) {
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
   initBrowser :function(){
     var that = That.cacheInfo.initBrowser ={};
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
   initLanguage : function(){
     var that = That.cacheInfo.initLanguage={};
     //如果打开就显示系统提示
    if(language.isOpen){
      that.open = true;
      that.lan= language.lan;
    }else{
      that.open = false;
    }
  },
  //FIXME 初始化Event类型
   initEventType : function(){
     var that = That.cacheInfo.initEventType = {};
     if(That.cacheInfo.initUA.UA == 'xiaomi') {
       //小米是mousedown事件
       that.type = 'mousedown';
      //  return 'mousedown';
   } else if(That.cacheInfo.initUA.UA != 'pc') {
       var isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),
           hasTouch = 'ontouchstart' in window && !isTouchPad;
           that.type = hasTouch?'touchstart':'mousedown';
      //  return hasTouch ? 'touchstart' : 'mousedown';
   } else {
        that.type='click';
      //  return 'click';
   }
  },
  //FIXME 初始化用户信息
   initUserInfo : function(){
      //工单来源，0客服提交，1 PC普通用户留言提交，2 H5普通用户留言提交，3普通用户微信提交，4普通用户APP提交
      // 用户来源，PC 0,微信 1 ,APP 2,WAP 4
      var oSource = 1,// 用户来源 0：PC 1：微信 2：APP 3：微博 4：WAP FIXME 0：PC 1：移动端 2：APP
      urlParams = Comm.getQueryParam(),
      sourceData = urlParams['source'];
      //若有back参数就显示返回状态栏
      if(urlParams['back']&&urlParams['back']==1) {
          $(headerBack).addClass('show');
      }
      That.cacheInfo.initUserInfo = {
          source : sourceData >= 0 ? sourceData : oSource,
          tel : urlParams['tel']?urlParams['tel']:'',
          uname : urlParams['uname']?urlParams['uname']:'',
          partnerId : urlParams['partnerId']?urlParams['partnerId']:'',
          email : urlParams['email']?urlParams['email']:'',
          visitUrl : urlParams['visitUrl'] ? urlParams['visitUrl'] : Comm.preURLLink,
          visitTitle : urlParams['visitTitle'] ? urlParams['visitTitle'] : '',
          face : urlParams['face'] ? urlParams['face']: ''
      };
  },
  //FIXME 初始化SysNum系统 id
   initSysNum : function(){
     That.cacheInfo.initSysNum = Comm.getQueryParam()['sysNum'];
  }
};
  //FIXME 初始化接口参数
  var initBasicInfo = function() {
        Promise.when(function() {
            var promise = new Promise();
            $.ajax({
                'url' :api.init_url,
                'data' : {
                },
                'dataType' : 'json'
            }).success(function(ret) {
                promise.resolve({
                    'token' : ret.token
                });
            }).fail(function(ret) {
                promise.reject({
                    'token' : null
                });
            });
            return promise;
        }).then(basicInfoHandler,basicInfoHandler).then(function(value,promise) {
            $.ajax({
                'url' : '/chat/admin/connect.action',
                'dataType' : 'json',
                'type' : 'get',
                'data' : {
                    'uid' : queryParam.id,
                    'way' : 1,
                    'st' : queryParam.st || 1,
                    'lt' : queryParam.lt || new Date().getTime(),
                    'token' : token
                }
            }).done(function(ret) {
                if(ret.status == 1 || ret.status == 2) {
                    for(var el in ret) {
                        global[el] = ret[el];
                    }
                    global.baseUrl = location.protocol + "//" + location.host + "/chat/" + ((!value.success) ? 'admins/' : '');
                    if(!value.success) {
                        global.scriptPath = "//static.sobot.com/chat/admins/";
                    } else {
                        global.scriptPath = global.baseUrl;
                    }
                    $(".js-loading-layer").hide();
                    promise.resolve(ret);
                } else {
                    $(window).unbind("beforeunload");
                    window.close();
                    window.location.href = "/console/login";
                }
            });
        }).then(function(value,promise) {
            new HearBeat(that).start();
            $body.trigger("core.onload",[global]);
            getMessage();
        });
  };
  //初始化Dom元素
  var paramsDom = function(){
    headerBack = $('.js-header-back');
    userChatBox =$('.js-userMsgOuter');
    chatMsgList = $('.js-chatMsgList');
    pullDown = $('.js-pullDown');
  };
  var initPlagsin = function(){
    config.initUA();
    config.initParams();
    config.initLanguage();
    config.initSysNum();
    config.initBrowser();
    config.initUserInfo();
    config.initEventType();
  };


  var init = function(){
    paramsDom();
    initPlagsin();
  };
  init();

  return That.cacheInfo;

};
module.exports = initConfig;
