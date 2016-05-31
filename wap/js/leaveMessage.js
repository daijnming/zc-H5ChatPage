'use strict';

/**
 * Created by yangfan on 2016/1/22.
 */

/*
* 留言单页
*
* */

/* ZC */
var ZC = ZC || {};
/* ZC.LM */
ZC.LM = {};
/* 版本 */
ZC.LM.Version = '2.0.1';

/* 配置参数 */
ZC.LM.config = {
    // 可取的参数列表
    paramNameList: [
        'sysNum',
        'source',
        'tel',
        'uname',
        'partnerId',
        'email',
        'back',
        'uid',
        'pid'
    ],
    // 校验包
    Reg: {
        // 邮箱
        'R1001': [
            {
                require: true,
                //需要保持与console一致
                //reg: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
                reg:/^[a-zA-Z0-9]+([-_\.][a-zA-Z0-9]+)*(?:@(?!-))(?:(?:[A-Za-z0-9-]*)(?:[A-Za-z0-9](?!-))(?:\.(?!-)))+[A-Za-z]{2,}$/
            },
            {
                require: '请填写邮箱',
                reg: '邮箱格式错误！'
            }
        ],
        // 留言
        'R1002': [
            {
                require: true,
                maxLength: 200
            },
            {
                require: '请填写问题描述',
                maxLength: '最多可输入200个字符'
            }
        ],
        // 手机号
        'R1003': [
            {
                require: true,
                // FIXME !! 座机（需要区号） & 手机号 & 木有400/800电话
                reg: /(^(\d{3,4}-)?\d{7,8})$|(^13\d{9}$)|(^14)[5,7]\d{8}$|(^15[0,1,2,3,5,6,7,8,9]\d{8}$)|(^17)[6,7,8]\d{8}$|(^18\d{9}$)/
            },
            {
                require: '请输入您的电话',
                reg: '电话号码错误'
            }
        ]
    }
};

/* cacheInfo */
ZC.LM.cacheInfo = {
    UA: '',
    eventType: '',
    // host相关信息
    host: {
        protocol: '',
        name: '',
        urlList: {}
    },
    dialog: {},
    // 本地配置的config信息
    customConfig: {}
};
var sourceConfig ='1';//匹配来源 默认为1
/* init */
ZC.LM.init = function () {
    var _t = this;

    /* 获取host相关参数 */
    _t.cacheInfo.host.protocol = window.location.protocol;
    /* 获取UA */
    _t.cacheInfo.UA = _t.getUA();
    /* 获取eventType */
    _t.cacheInfo.eventType = _t.getEventType();
    /* 获取URL参数 */
    _t.cacheInfo.urlParamList = _t.getUrlParam();
    /* 获取sysNum */
    _t.cacheInfo.sysNum = _t.cacheInfo.urlParamList.sysNum;
    /* 获取用户信息 */
    _t.cacheInfo.userInfo = _t.getUserInfo();
    /* 获取配置信息 */
    _t.getCustomConfig();

};

/*
 * 获取URL参数，目前支持获取当前页面URL的参数
 * @param {string} url
 * @param {string|Array} paramName 参数名|参数名列表
 * @param {int} returnType 返回类型 0：String 1: Object
 * @return {string|Object} 返回当官参数值或者多个参数的对象
 * */
ZC.LM.getUrlParam = function (paramName, returnType) {
    var _t = this,
        paramNameList = [],
        returnType = returnType === undefined ? 0 : returnType,
        paramUrl = window.location.search.substr(1),
        /*
         * 获取URL参数方法体
         * @param {Array} paramNameList 参数名列表
         * @param {int} returnType 返回类型 0：String 1: Object
         * */
        getUrlParamFunc = function (paramNameList, returnType) {
            var item = '',
                reg = '',
                res = '',
                returnData = returnType === 0 ? '' : {},
                tmpData = '';

            for (var i = 0, paramNameListLen = paramNameList.length; i < paramNameListLen; i ++) {
                item = paramNameList[i];
                reg = new RegExp("(^|&)"+ item +"=([^&]*)(&|$)");
                res = paramUrl.match(reg);
                tmpData =  res != null ?  decodeURI(decodeURI(res[2])) : null;

                if (returnType === 0) {
                    returnData = tmpData;
                } else {
                    returnData[item] = tmpData;
                }
            }

            return returnData;
        };

    // 获取单个参数
    if (paramName && !$.isArray(paramName)) {
        paramNameList = [paramName];
        returnType = 0;
        // 获取指定参数列表中的参数
    } else if (paramName && $.isArray(paramName)) {
        paramNameList = paramName;
        returnType = 1;
        // 获取config配置中指定的参数
    } else {
        paramNameList = _t.config.paramNameList;
        returnType = 1;
    }

    return getUrlParamFunc(paramNameList, returnType);
};

/*
 * 获取用户信息
 * @return {Object} userInfo 用户信息
 * */
ZC.LM.getUserInfo = function () {
    var _t = this,
        oSource = 1,// 用户来源 0：PC 1：微信 2：APP 3：微博 4：WAP FIXME 0：PC 1：移动端 2：APP
        sourceData = parseInt(_t.getUrlParam("source"));

    return {
        source: sourceData >= 0 ? sourceData : oSource,
        tel: _t.cacheInfo.urlParamList.tel,
        uname: _t.cacheInfo.urlParamList.uname,
        partnerId: _t.cacheInfo.urlParamList.partnerId,
        email: _t.cacheInfo.urlParamList.email
    };
};

/* 获取UA */
ZC.LM.getUA = function () {
    var _t = this,
        uaList = [
            // FIXME 是否添加魅族机器'mz'还需验证。
            'mz',
            'xiaomi',
            'android',
            'ipad',
            'iphone'
        ],
        pcUaList = [
            'windows',
            'linux'
        ],
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
    for (var i = 0, item = ''; i < uaListLen; i ++) {

        if (returnUA.length) {
            break;
        }

        item = uaList[i];
        // FIXME 是否需要通过正则来匹配，避免贪婪导致的识别错误
        // 或者处理UA阶段会把iPhone、iPod touch等都识别为iPhone，然后再通过widht&height来区分版本
        uaIndex = userAgent.indexOf(item);
        // 1.需要识别iphone版本
        if (item === 'iphone' && uaIndex > 0) {
            // 依据宽高来判断iPhone版本
            // 返回iPhone版本
            switch (uaWidth) {
                case 320:
                    iphoneVersion = 'iphone-5';  // iPhone 4 (4, 4S) && iPhone 5 (5c, 5s)
                    break;
                case 375:
                    iphoneVersion = 'iphone-6';  // iPhone 6
                    break;
                case 414:
                    iphoneVersion = 'iphone-6+'; // iPhone 6+
                    break;
            }

            // 定义全局的iphoneVersion
            _t.cacheInfo.iphoneVersion = iphoneVersion;
            returnUA = item;
            break;
        }
        // 2.识别其他机器
        if (uaIndex > 0) {
            returnUA = item;
            break;
        }
    }
    // 再取PC端UA
    if (uaIndex <= 0) {
        for (var i = 0, item = ''; i < pcUaListLen; i ++) {
            item = pcUaList[i];
            uaIndex = userAgent.indexOf(item);

            if (uaIndex > 0) {
                returnUA = 'pc';
                break;
            }
        }
    }

    return returnUA;
};

/* 定义单击事件类型 */
ZC.LM.getEventType = function () {
    var _t = this;

    if(_t.cacheInfo.UA == 'xiaomi'){
        //小米是mousedown事件
        return 'mousedown';
    } else if (_t.cacheInfo.UA != 'pc') {
        var isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),
            hasTouch = 'ontouchstart' in window && !isTouchPad;
        return hasTouch ? 'touchstart' : 'mousedown';
    } else {
        return 'click';
    }
};

/*
 * 获取用户自定义配置
 * */
ZC.LM.getCustomConfig = function () {
    var _t = ZC.LM,
        customConfig = _t.cacheInfo.customConfig,
        leaveMessageStyle = $('#leaveMessageStyle');
    $.ajax({
        type: "post",
        url: '/chat/user/config.action',
         //url: 'http://test.sobot.com/chat/user/config.action',
        dataType: "jsonp",
        data: {
            sysNum: _t.cacheInfo.sysNum,
            source: _t.cacheInfo.userInfo.source
        },
        success : function (data) {
            if (data) {
                for (var item in data) {
                    _t.cacheInfo.customConfig[item] = data[item];
                }

                // 设置页面
                //document.title = customConfig.companyName;
                $('#prePage').css('background-color',customConfig.color);
                //$('.zcDialog-btn').css('background-color',customConfig.color);
                // 设置样式
                leaveMessageStyle.html(
                    '.zcDialog-header {background-color:'
                    + customConfig.color
                    + ';} .zcDialog .zcDialog-footer .zcDialog-cancel:hover {color:'
                    + customConfig.color
                    //+ ';} .zcDialog .zcDialog-footer .zcDialog-confirm:hover {color:'
                    //+ customConfig.color
                        // 留言
                    + ';} .zcDialog-leaveMessage .zcDialog-header {background-color:'
                    + customConfig.color
                    + ';} .zcDialog-leaveMessage .zcDialog-footer .zcDialog-confirm {background-color:'
                    + customConfig.color
                        // 留言成功弹窗
                    + ';} .recreateLeaveMessage {color:'
                    + customConfig.color
                    + ';} .zcDialog-leaveMessage #prePage {background-color:'
                        + customConfig.color
                    +'}'
                );

                /* 创建留言dialog */
                _t.createLeaveMessageDialog();
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
ZC.LM.bindTargetEvent = function (targetObj, eventType, childTarget, callback) {
    if (typeof targetObj != 'object') {
        targetObj = $(targetObj);
    }

    if (childTarget && typeof childTarget == 'function') {
        var callback = childTarget;

        targetObj.off(eventType).on(eventType, function (e) {
            callback && callback(e);
        });
    } else {
        targetObj.off(eventType).on(eventType, childTarget, function (e) {
            callback && callback(e);
        });
    }
};
/*
 * 文本框最大字数控制
 * @param {String} targetID 目标对象ID
 * @param {Number} maxLen 最大长度
 * */
ZC.LM.textareaMaxlen = function (targetID, maxLen) {
    // 限制留言框最大字符数为200
    if (window.addEventListener) {
        document.getElementById(targetID).addEventListener('input', function () {
            if (this.value.length > maxLen) {
                this.value = this.value.substr(0, maxLen);
            }
        }, false);
        // IE attachEvent
    } else if (window.attachEvent) {
        document.getElementById(targetID).attachEvent('onpropertychange', function () {
            if (this.value.length > maxLen) {
                this.value = this.value.substr(0, maxLen);
            }
        });
    }
};

/*
 * 校验
 * @param {Object} el 目标对象
 * @param {Function} callback 回调方法
 * */
ZC.LM.checkAll = function (el, callback) {
    var _t = ZC.LM;

    if (typeof el == 'object' && el.find) {
        var elList = el.find('[reg]'),
            elListLen = elList.length,
            Reg = _t.config.Reg,
            errorMsg = null;

        if (elListLen) {
            // 循环校验
            for (var i = 0, item, itemVal, itemRegArr, itemReg, itemRegText; i < elListLen; i++) {
                // 判断是否已取得校验
                if (errorMsg) {
                    break;
                }

                item = $(elList[i]);
                itemVal = item.val();
                // 当前对象的Reg数组对象
                itemRegArr = Reg[item.attr('reg')];
                // 当前对象的Reg
                itemReg = itemRegArr[0];
                itemRegText = itemRegArr[1];
                for (var j in itemReg) {
                    // 判断是否已取得校验
                    if (errorMsg) {
                        break;
                    }
                    switch (j) {
                        case 'require':
                            // 判断require是否为true
                            if (itemRegText[j]) {
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
            if (callback) {
                return callback(errorMsg);
            } else {
                return errorMsg ? false : true;
            }
        }
    }
};

/*
 * dialog 组件 使用 new ZC.LM.dialog
 * @param {Object} config 配置信息
 * @return {Object} 实例化对象
 * */
ZC.LM.dialog = function (config) {

    var _t = this,
        _z = ZC.LM,
        time = '-' + (new Date()).getTime(),
        eventType = _z.cacheInfo.eventType,
        docEventType = _z.cacheInfo.UA == 'xiaomi' ? 'touchstart' : eventType,
        // 默认配置
        defConfig = {
            // 如果没有设置ID则动态生成
            id: 'zcDialog' + time,
            //type: 'modal',   // type支持modal/alert
            className: [],  // 最外层div的className
            // FIXME ??? 是否支持自定义样式。
            style: {

            },
            // 动画 Boolean|String
            animation: false,
            // 延时 Boolean|Number
            delay: false,
            // 键盘
            keyboard: true,
            // document 点击Document关闭
            document: true,
            // 遮罩 Boolean|Number Number型为Alpha值
            backdrop: true,
            // 结构
            structure: {
                header: true,
                body: true,
                errorMsg: false,
                footer: true
            },
            // 模板
            template: {
                boxStart: '<div id="'+ 'zcDialog' + time +'"  class="zcDialog"><div class="zcDialog-modal">',
                boxEnd: '</div><div class="zcDialog-vertical"></div></div>',
                header: '<div class="zcDialog-header"></div>',
                bodyStart: '<div id="prePage" class="zcDialog-prePage"><a href="javascript:window.history.back();"><img src="images/return.png" /><span class="back">返回</span></a><span class="leaveMsg">留言</span></div><div class="zcDialog-body">',
                bodyEnd: '</div>',
                errorMsg: '<div class="errorMsg"><span class="errorMsgText"></span><span class="errorMsgBtn"><a hidefocus href="javascript: void (0);" class="zhichiClose" title="结束对话"></a></span></div>',
                footer: '<div class="zcDialog-footer"></div>'
            },
            //template: '<div id="'+ 'zcDialog' + time +'"  class="zcDialog"><div class="zcDialog-modal"><div class="zcDialog-header"></div><div class="zcDialog-body"><div class="errorMsg"><span class="errorMsgText"></span><span class="errorMsgBtn"><a hidefocus href="javascript: void (0);" class="zhichiClose" title="结束对话"></a></span></div></div><div class="zcDialog-footer"></div></div></div>',
            // 数据
            data: {
                title: '',
                content: '',
                btn: {
                    cancle: {
                        id: 'zcDialogCancle' + time,
                        title: '取消',
                        template: '<a id="'+ 'zcDialogCancle' + time +'" class="zcDialog-btn zcDialog-cancel" href="#0" style="position:relative;z-index:1000;"></a>',
                        callback: null
                    },
                    confirm: {
                        id: 'zcDialogConfirm' + time,
                        title: '确认',
                        template: '<a id="'+ 'zcDialogConfirm' + time +'" class="zcDialog-btn zcDialog-confirm" style="position:relateive;z-index:1000;"></a>',
                        callback: null
                    }
                },
                // 按钮列表
                btnList: []
            },
            // 错误信息配置
            errorMsg: {
                // 是否启用错误信息
                isEnable: false,
                // 延时关闭(单位：毫秒);
                delay: false
            }
        },
        // 遮罩
        backdrop = {
            id: 'zcBackdrop' + time,
            template: '<div id="'+ 'zcBackdrop' + time +'" class="zcBackdrop"></div>'
        },
        // 初始化配置信息
        initConfig = function () {
            if (config && typeof config === 'object') {
                // 深度合并
                return $.extend(true, {}, defConfig, config);
            } else {
                return defConfig;
            }

        },
        // 初始化数据
        initData = function () {
            var data = config.data,
                tmpBtnObj = {};
            // 处理按钮
            for (var i = 0, btnListLen = data.btnList.length, item; i < btnListLen; i++) {
                item = data.btnList[i];
                if (data.btn.hasOwnProperty(item)) {
                    tmpBtnObj[item] = data.btn[item];
                }
            }
            // 更新data
            config.data.btn = tmpBtnObj;

            // 取消按钮
            if (data.btn.hasOwnProperty('cancle') && (!data.btn.cancle.callback || typeof data.btn.cancle.callback !== 'function')) {
                data.btn.cancle.callback = function () {
                    _t.hide();
                };
            }
            // 确认按钮
            if (data.btn.hasOwnProperty('confirm') && (!data.btn.confirm.callback || typeof data.btn.confirm.callback !== 'function')) {
                data.btn.confirm.callback = function () {
                    _t.hide();
                };
            }

            return data;
        },
        // 初始化dom
        initDom = function () {
            // 初始化dialog Dom
            // 判断模板是否存在
            if (config.template) {
                // 判断模板是否为对象
                if (typeof config.template === 'object') {
                    // 处理模板结构
                    for (var key in config.structure) {
                        if (key === 'body') {
                            // 更新template对象
                            config.template['bodyStart'] = config.structure[key] ? config.template['bodyStart'] : '';
                            config.template['bodyEnd'] = config.structure[key] ? config.template['bodyEnd'] : '';
                        } else {
                            // 更新template对象
                            config.template[key] = config.structure[key] ? config.template[key] : '';
                        }
                    }
                    // 拼装template
                    config.template = config.template['boxStart']+
                        config.template['header']+
                        config.template['bodyStart']+
                        config.template['errorMsg']+
                        config.template['bodyEnd']+
                        config.template['footer']+
                        config.template['boxEnd'];
                }

                // 插入body
                $('body').append(config.template);
                // 更新_t.dom
                _t.dom.dialog = $('#'+ config.id);
                // 更新dialog class
                if (config.className && config.className.length) {
                    for (var i = 0, classNameLen = config.className.length, item; i < classNameLen; i++) {
                        item = config.className[i];

                        _t.dom.dialog.addClass(item);
                    }
                }
            }
            // 初始化backdrop Dom
            if (config.backdrop) {
                // 插入body
                $('body').append(backdrop.template);
                // 更新_t.dom
                _t.dom.backdrop = $('#'+ backdrop.id);
            }
        },
        // 初始化title/content
        initDomdata = function () {
            // 更新Header
            _t.dom.dialog.find('.zcDialog-header').html(config.data.title);
            // 更新Body,插入
            _t.dom.dialog.find('.zcDialog-body').append(config.data.content);
            // 更新Footer
            // 初始化“取消”按钮，绑定“取消”按钮点击事件
            if (config.data.btn.cancle) {
                var cancleItem = config.data.btn.cancle;

                _t.dom.dialog.find('.zcDialog-footer').append(cancleItem.template);
                _t.dom.dialog.find('#'+cancleItem.id).html(cancleItem.title);
                //_t.dom.dialog.find('#'+cancleItem.id).on('click', function () {
                _z.bindTargetEvent(_t.dom.dialog.find('#'+cancleItem.id), eventType, function () {
                    cancleItem.callback();
                });
            }
            // 初始化“确认”按钮，绑定“确认”按钮点击事件
            if (config.data.btn.confirm) {
                var confirmItem = config.data.btn.confirm;

                _t.dom.dialog.find('.zcDialog-footer').append(confirmItem.template);
                _t.dom.dialog.find('#'+confirmItem.id).html(confirmItem.title);
                //_t.dom.dialog.find('#'+confirmItem.id).on('click', function () {
                _z.bindTargetEvent(_t.dom.dialog.find('#'+confirmItem.id), eventType, function () {
                    confirmItem.callback();
                });
            }
        },
        // 初始化错误信息
        initErrorMsg = function () {
            // 错误信息
            if (config.errorMsg.isEnable) {
                _t.errorMsg = {
                    target: _t.dom.dialog.find('.errorMsg')
                };
                _t.errorMsg.show = function (errorMsgText) {
                    // 更新错误提示语
                    if (errorMsgText) {
                        _t.errorMsg.target.find('.errorMsgText').text(errorMsgText);
                    }
                    _t.errorMsg.target.show();
                    // 延时关闭
                    if (config.errorMsg.delay) {
                        setTimeout(_t.errorMsg.hide, config.errorMsg.delay);
                    }
                };
                _t.errorMsg.hide = function () {
                    _t.errorMsg.target.hide();
                };
                // 绑定关闭事件
                //_t.errorMsg.target.find('.zhichiClose').on('click', function () {
                _z.bindTargetEvent(_t.errorMsg.target.find('.zhichiClose'), eventType, function () {
                    _t.errorMsg.hide();
                });
            }
        },
        // 初始化 init
        init = function () {
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
            if (config.keyboard) {
                $('body').on('keyup', function (e) {
                    if (27 === e.keyCode || 27 === e.which) {
                        _t.hide();
                    }
                });
            }
            // 绑定Document事件,绑定遮罩点击事件
            if (config.document) {
                //$(document).on('click', function (e) {
                _z.bindTargetEvent(_t.dom.backdrop, docEventType, function (e) {
                    if (e.target === e.currentTarget || e.target === _t.dom.dialog[0]) {
                        _t.hide();
                        if (config.data.btn.cancle) {
                            var cancleItem = config.data.btn.cancle;
                            cancleItem.callback();
                        }
                    }
                });
            }
            //TODO 判断是否有back参数 显示返回状态栏
            var res = ZC_Extend.getUrlQueryString('back');
            var res1 = ZC_Extend.getUrlQueryString('source');
            if(res1){
                sourceConfig = res1;
            }
            if(res&&res=='1'){

                $('#prePage').show();
            }
        };

    // dom对象
    _t.dom = {
        dialog: '',
        backdrop: ''
    };
    // 是否已创建dialog标识
    _t.isCreated = false;
    // data对象
    _t.data = {};

    // 创建 param {Function} callback 回调
    _t.create = function (callback) {
        if (!_t.isCreated) {
            _t.isCreated = true;
            init();
        }
        // 执行回调
        callback && callback();
    };
    // 重置 FIXME ??? 是否需要重置方法。
    _t.reSet = function () {

    };
    // 移除
    _t.remove = function () {
        if (_t.isCreated) {
            // 显示dialog
            _t.dom.dialog.remove();
            // 显示backdrop
            _t.dom.backdrop.remove();
            // 更新isCreated标识
            _t.isCreated = false;
        }
    };
    // 显示 param {Function} callback 回调
    _t.show = function (callback) {
        // 判断当前dialog是否已创建
        if (!_t.isCreated) {
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
    _t.hide = function (callback) {
        // 判断当前dialog是否已创建
        if (!_t.isCreated) {
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
    _t.toggle = function (callback) {
        // 判断当前dialog是否已创建
        if (!_t.isCreated) {
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

/* 创建并显示留言弹窗 */
ZC.LM.createLeaveMessageDialog = function () {
    var _t = ZC.LM,
        _d,
        flag=1,//防止重复提交
        customConfig = _t.cacheInfo.customConfig;

    // 判断是否已创建留言dialog
    if (_t.cacheInfo.dialog['leaveMessage']) {
        _d = _t.cacheInfo.dialog['leaveMessage'];
        _d.show();
    } else {
        var msgTmp='<div class="js-msgTmp" style="display:none;">'+customConfig.msgTmp+'</div>';
         $(msgTmp).appendTo("body")
           msgTmp= $(".js-msgTmp").text();
        var tmpHtml = '<div class="leaveMessageBox">' +
            '<span class="leaveMessage-icon"><img src="./images/leaveMsgIcon.png" alt="留言"></span>' +
            '<span class="leaveMessage-title">' + customConfig.msgTxt + '</span>' +
            '<form class="leaveMessage-form" id="leaveMessage-form">' +
            '<div class="linebox"><input reg="R1001" type="text" id="customerEmail" placeholder="邮箱"></div>' +
            '<div class="linebox"><textarea reg="R1002" id="ticketContent" placeholder="'+msgTmp+'"></textarea></div>' +
            '</form>' +
            '</div>';

        //for(var tmp in customConfig){
        //    console.log(tmp+':'+customConfig[tmp]);
        //}
        //console.log('denzel:'+customConfig);
        _d = _t.cacheInfo.dialog['leaveMessage'] = new _t.dialog({
            className: [
                'zcDialog-leaveMessage',
                'zcDialog-full'
            ],
            // 结构
            structure: {
                header: false,
                body: true,
                errorMsg: true,
                footer: true
            },
            data: {
                title: '<span class="header-left">请留言</span><span class="header-right"><a hidefocus href="javascript: void (0);" class="zhichiMin" title="最小化"><span></span></a></span>',
                content: tmpHtml,
                btn: {
                    confirm: {
                        title: '提交',
                        callback: function () {
                            // 校验
                            if (!_t.checkAll($('#leaveMessage-form'), function (errorMsg) {
                                    if (errorMsg) {
                                        _d.errorMsg.show(errorMsg);
                                        return false;
                                    } else {
                                        _d.errorMsg.hide();
                                        return true;
                                    }
                                })) {
                                return;
                            };
                            //console.log(flag);
                            if(flag==1){
                                _d.dom.dialog.find('.zcDialog-confirm').css("background-color","#ccc")
                                flag=2;
                                $.ajax({
                                    type: "post",
                                    url: '/chat/data/postMsg.action',
                                    //url:'http://test.sobot.com/chat/data/postMsg.action',
                                    dataType: "jsonp",
                                    data: {
                                        uid: _t.cacheInfo.urlParamList.uid,
                                        companyId: _t.cacheInfo.urlParamList.sysNum,
                                        ticketContent: _d.dom.dialog.find('#ticketContent').val() || '',
                                        customerEmail: _d.dom.dialog.find('#customerEmail').val() || '',
                                        customerPhone: '',
                                        //ticketFrom: 1,
                                        //customerSource: 1
                                        ticketFrom:sourceConfig==1?3:sourceConfig,
                                        customerSource:sourceConfig
                                    },
                                    success : function (res) {
                                        // 判断是否提交成功 FIXME 需要取消健壮判断。
                                        if (res && res.retCode === '000000') {
                                            // 隐藏弹窗
                                            _d.hide(function () {
                                                // 清除表单数据
                                                _d.dom.dialog.find('#customerEmail').val('');
                                                _d.dom.dialog.find('#ticketContent').val('');
                                            });
                                            // 显示留言成功dialog
                                            _t.createLeaveMessageSuccessDialog();
                                        }
                                    }
                                });

                            }else{
                                return false;
                            }
 
                        }
                    }
                },
                btnList: [
                    'confirm'
                ]
            },
            // 错误信息配置
            errorMsg: {
                // 是否启用错误信息
                isEnable: true,
                // 延时关闭(单位：毫秒);
                delay: 5000
            }
        });
        // 显示弹窗
        _d.show(function () {
            // 处理样式
            //_d.dom.dialog.find('.zcDialog-header').css({'background-color': customConfig.color});
            //_d.dom.dialog.find('.zcDialog-footer .zcDialog-confirm').css({'color': customConfig.color});
            // 清除表单数据
            _d.dom.dialog.find('#customerEmail').val('');
            _d.dom.dialog.find('#ticketContent').val('');

            // 设置文本域placeholder值
            //console.log(customConfig.msgTmp);

            //创建临时存储dom
           // $('#ticketContent').val( customConfig.msgTmp);
           // (function(){
           //
           //
           //     var tmpDom = '<textarea id="tmpMsg" style="display: none;">'+customConfig.msgTmp+'</textarea>';
           //     $('.leaveMessageBox').append(tmpDom);
           //     var html = $($('#tmpMsg').val());
           //     var txt = html.text();
           //     $('<span id="res" style="display: none;">'+txt+'</span>').appendTo($('.leaveMessageBox'));
           //
           //     $('<style>' +
           //         '#ticketContent::-webkit-input-placeholder::before{content: "' + $('#res').text() + '"; display: block; color: #999; }' +
           //         '#ticketContent::-moz-placeholder::before{content: "' + $('#res').text() + '"; display: block; color: #999; }' +
           //         '#ticketContent:-moz-placeholder::before{content: "' + $('#res').text() + '"; display: block; color: #999; }' +
           //         '#ticketContent:-ms-input-placeholder::before{content: "' + $('#res').text() + '"; display: block; color: #999; }' +
           //      '</style>').appendTo('head');
           // })()
            //
           /* var txt=$('<p>'+customConfig.msgTmp+'</p>').text();
            $('<style>' +
                '#ticketContent::-webkit-input-placeholder::before{content: "' + txt + '"; display: block; color: #999; }' +
                '#ticketContent::-moz-placeholder::before{content: "' + txt + '"; display: block; color: #999; }' +
                '#ticketContent:-moz-placeholder::before{content: "' + txt + '"; display: block; color: #999; }' +
                '#ticketContent:-ms-input-placeholder::before{content: "' + txt + '"; display: block; color: #999; }' +
                '</style>').appendTo('head');*/

            // 限制留言框最大字符数为200
            //_t.textareaMaxlen('ticketContent', 200);
            // 绑定最小化按钮
            //_d.dom.dialog.find('.zhichiMin').on('click', function () {
            _t.bindTargetEvent(_d.dom.dialog.find('.zhichiMin'), _t.cacheInfo.eventType, function () {
                _d.hide();
            });
        });
    }
};

/* 创建并显示留言成功弹窗 */
ZC.LM.createLeaveMessageSuccessDialog = function () {
    var _t = ZC.LM,
        _d,
        customConfig = _t.cacheInfo.customConfig;

    // 判断是否已创建留言dialog
    if (_t.cacheInfo.dialog['leaveMessageSuccess']) {
        _d = _t.cacheInfo.dialog['leaveMessageSuccess'];
        _d.show();
    } else {
        var tmpHtml = '<div class="leaveMessageSuccessBox">' +
            '<span class="leaveMessageSuccessBox-title"><span class="icon-img" style="background-color: '+ customConfig.color +'"><span></span></span><span class="icon-text">留言成功</span></span>' +
            '<span class="leaveMessageSuccessBox-info">我们将尽快联系您</span>' +
                //'<span class="leaveMessageSuccessBox-btn"><span class="recreateLeaveMessage">再次留言</span></span>'
            '</div>';

        _d = _t.cacheInfo.dialog['leaveMessageSuccess'] = new _t.dialog({
            className: [
                'zcDialog-leaveMessageSuccess',
                'zcDialog-full'
            ],
            // 结构
            structure: {
                header: false,
                body: true,
                errorMsg: false,
                footer: false
            },
            data: {
                title: '<span class="header-left">请留言</span><span class="header-right"><a hidefocus href="javascript: void (0);" class="zhichiMin" title="最小化"><span></span></a></span>',
                content: tmpHtml,
                btnList: []
            }
        });
        // 显示leaveMessageSuccess
        _d.show(function () {
            // 处理样式
            //_d.dom.dialog.find('.zcDialog-header').css({'background-color': customConfig.color});
            //_d.dom.dialog.find('.recreateLeaveMessage').css({'color': customConfig.color});

        });
        // 绑定再次留言点击事件
        //_d.dom.dialog.find('.recreateLeaveMessage').on('click', function () {
        _t.bindTargetEvent(_d.dom.dialog.find('.recreateLeaveMessage'), _t.cacheInfo.eventType, function () {
            // 隐藏留言成功dialog
            _d.hide();
            // 显示留言dialog
            _t.cacheInfo.dialog['leaveMessage'].show();
        });
        // 绑定最小化按钮
        //_d.dom.dialog.find('.zhichiMin').on('click', function () {
        _t.bindTargetEvent(_d.dom.dialog.find('.zhichiMin'), _t.cacheInfo.eventType, function () {
            _d.hide();
        });
    }
};

/*
* 执行初始化
* */
$(function () {
  ZC.LM.init();
});
