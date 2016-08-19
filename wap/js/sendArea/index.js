/**
 *
 * @author daijm
 */
function TextArea(window) {
    //var that = {};
    var global;
    var listener = require("../../../common/util/listener.js");
    //表情
    var ZC_Face = require('../util/qqFace.js')();
    //上传附件
    var uploadImg = require('./uploadImg.js')();
    //当前状态
    //var CurrentState = require('../../../common/mode/currentState.js');
    //模拟placeholder
    //var placeholder = require('./placeholder.js');
    //alert()
    var evaluate=require("./evaluate.js");
    /* var inputCache = {};*/
     //模板引擎
    var template = require('./template.js');
    var global;
    var $node;
    var currentCid,
        currentUid,
        answer,
        //记住输入框的状态,点击发送后要保持
        focusStatus,
        currentStatus,
        //用户输入的内容在客服提示
        timer,
        //会话是否结束, 用于阻止某些事件
        sessionEnd=false,
        //判断用户是否说过话
        //isSpeak=false,
        //是否评价过 -1表示用户没有说过话，0表示说过话没有评论过，1表示评论过
        isEvaluated= -1,
        isRepeat=false;
        //0为机器人，1为人工
    var transferFlag=0;
    var browserType="";
    var phoneType="",
    phoneTypeFlag=false;
    var browserInfo="";
    var eventType="";
    //判断当前机型是否为不兼容输入框弹起机型的浏览器,false为兼容，true为不兼容
    var browserFlag=false,
        ucbrowserFlag=false;
    //传给聊天的url
    var statusHandler=function(data){
        currentStatus=data;
        if(currentStatus=="human"){
            transferFlag=1;
            $qqFaceTip.removeClass("activehide");
            //上传图片按钮
            $uploadImg.removeClass("activehide");
            //满意度评价
            $satisfaction.removeClass("activehide");
            //提示文本
            $textarea.attr("placeholder","")
        }else if(currentStatus == 'robot'){
            transferFlag=0;
            $uploadImg.addClass("activehide");
            $satisfaction.removeClass("activehide");
            $textarea.attr("placeholder","请简要描述您的问题")
        }
    };
    var changeStatusHandler=function(data){
        //hide,转人工按钮隐藏
        if(data.action=="hide"){
            $artificial.addClass("activehide");
            //解禁输入框
            $textarea.attr("placeholder","").attr("contenteditable","true")
        }else{
            $artificial.removeClass("activehide");
        }
    }
    //用户输入，工作台提示
    var chatAdminshowtextHandler=function(){
        clearInterval(timer);
        timer = setTimeout(function(){
            var content=$textarea.text();
            $.ajax({
                type : "post",
                url : "/chat/user/input.action",
                dataType : "json",
                data : {
                    cid :currentCid,
                    uid:currentUid,
                    content:content
                }
            });
        },500)
    };
    var showSendBtnHandler = function(evt) {
        //最大输入长度1024
        var str = $textarea.text();
        str=str.trim();
        if (str.length > 1024) {
            $textarea.text(str.substring(0,1024))
        };
        //判断当前是否为人工模式
        if(transferFlag==0){
            robotmodeButton();
        }else{
            manualmodeButton();
        }
        //工作台提示信息
        chatAdminshowtextHandler();
        //实时监测第三方输入法
        specialModelshideKeyboardHandler();
    };
    var robotmodeButton=function(){
        var _text = $textarea.text();
        if(_text) {
            $sendBtn.removeClass("activehide")
            $add.addClass("activehide")
            //$(".addhover").addClass("activehide")
            hideChatAreaHandler();
        } else {
            $sendBtn.addClass("activehide")
            hideChatAreaHandler();
            $add.removeClass("activehide")
        }
        if(document.activeElement.id=="js-textarea"){
            focusStatus=true;
        }
    };
    var manualmodeButton=function(){
        var _text = $textarea.text();
        if(_text) {
            $sendBtn.removeClass("activehide")
            $add.addClass("activehide")
           // $(".addhover").addClass("activehide")
        } else {
            $sendBtn.addClass("activehide")
            hideChatAreaHandler();
            $add.removeClass("activehide")
            $textarea.blur(); 
            //$(".js-wrapper").css("height","100%");
            //$(".js-chatArea").css({"top":"auto","height":"262px","bottom":"0"})
            $textarea.focus();
        }
        if(document.activeElement.id=="js-textarea"){
            focusStatus=true;
        }
    };
    var onbtnSendHandler = function(evt) {
        var str = $textarea.text();
        str=str.trim();
        //判断输入框是否为空
        if(str.length == 0 || /^\s+$/g.test(str)) {
            $textarea.html("")
            return false;
        } else {
            //过滤表情
            //ZC_Face.analysisRight(str);
            //xss
            var $dom = $('<div></div>').text(str);
            var s = $dom.html();
            //通过textarea.send事件将用户的数据传到显示台
            var date= currentUid + +new Date();
            listener.trigger('sendArea.send',[{
                'answer' : s,
                'uid' : currentUid,
                'cid' : currentCid,
                'dateuid' : date,
                'date': +new Date(),
                'token':"",
                'sendAgain':false,
                'currentStatus':currentStatus

            }]);
        };
        //清空待发送框
        $textarea.html("");
        //发送前是什么状态，发送后就是什么状态
        //获取document上获取焦点的id,当点击回车发送的时候不让它执行blur事件，否则出现兼容问题
        if(evt.keyCode != "13"){
            if(focusStatus){
                //输入框遮挡兼容处理
                $add.removeClass("activehide");
                if(browserFlag){
                    setTimeout(function(){
                        specialModelshideKeyboardHandler();
                    },50)
                };
                //alert(phoneTypeFlag);
                if(phoneTypeFlag==false){
                    //alert("进来了")
                    //如果不是iphone手机，则手动调键盘
                    //setTimeout(function(){
                        $textarea.blur();
                        $textarea.focus();
                    //},100)
                   
                }
            }else{
                $add.removeClass("activehide");
            }  
        }else{
            $add.removeClass("activehide");
        } 
        $sendBtn.addClass("activehide");
        autoSizePhone();
    };
    var sendedKeepFocus=function(){

    };
    var showChatAddHandler=function(){
        $textarea.blur();
        //与键盘优化
        if($chatArea.hasClass("showChatAdd")){
            //隐藏
            hideChatAreaHandler();
            //0为机器人模式
            if(transferFlag==0){
                $add.removeClass("activehide")
                $qqFaceTip.addClass("activehide")
            }else{
                $add.removeClass("activehide")
                $qqFaceTip.removeClass("activehide")
            }
            autoSizePhone();
        } else {
            setTimeout(function(){
                //显示
                $chatArea.addClass("showChatAdd");
                $chatArea.removeClass("showChatEmotion");
                $chatAdd.show();
                $chatEmotion.hide();
                $chatArea.removeClass("hideChatArea").addClass("showChatArea");
                //0为机器人模式
                if(transferFlag==0){
                    $qqFaceTip.addClass("activehide")
                }else{
                    $qqFaceTip.removeClass("activehide")
                }
                autoSizePhone();
            },500)
        }
        focusStatus=false;
    };
    var showChatEmotionHandler=function(){
        $textarea.blur();
        //与键盘优化
        if($chatArea.hasClass("showChatEmotion")){
            //隐藏
            hideChatAreaHandler();
            autoSizePhone();
        } else {
            setTimeout(function(){
                //显示
                $chatArea.addClass("showChatEmotion");
                $chatArea.removeClass("showChatAdd");
                $chatAdd.hide();
                $chatEmotion.css("display","inline-block");
                $chatArea.removeClass("hideChatArea").addClass("showChatArea");
                if(transferFlag==0){
                    $qqFaceTip.addClass("activehide");
                    $add.removeClass("activehide")
                }else{
                    var _text=$textarea.text();
                    if(_text){
                         $add.addClass("activehide")
                        $sendBtn.removeClass("activehide")
                    }else{
                        $add.removeClass("activehide")
                        $sendBtn.addClass("activehide");
                    }
                }
                autoSizePhone();
            },500)
        }
        focusStatus=false;
    };
    var hideChatAreaHandler = function() {   
        //setTimeout(function(){
            $chatArea.removeClass("showChatAdd");
            $chatArea.removeClass("showChatEmotion");
            //不能动画,否则会跟键盘不和谐
            $chatArea.removeClass("showChatArea").addClass("hideChatArea");
            //$chatArea.css({"bottom":"-213px"}).removeClass("showChatArea");
            autoSizePhone();
            var _text=$textarea.text();
            if(transferFlag==0){
                //$(".qqFaceTiphover").addClass("activehide");
                $qqFaceTip.addClass("activehide");
                //$(".addhover").addClass("activehide");
                if(_text){
                    $add.addClass("activehide");
                    //$(".addhover").addClass("activehide");
                    $sendBtn.removeClass("activehide");
                }else{
                    $add.removeClass("activehide");
                    $sendBtn.addClass("activehide");
                }
            }else{
                //$(".qqFaceTiphover").addClass("activehide");
                $qqFaceTip.removeClass("activehide");
                //$(".addhover").addClass("activehide");
                if(_text){
                    $add.addClass("activehide");
                    //$(".addhover").addClass("activehide");
                    $sendBtn.removeClass("activehide");
                }else{
                    $add.removeClass("activehide");
                    $sendBtn.addClass("activehide");
                }
            }
         //},100);
        //输入框遮挡下收起
        inputUPHandler();
        focusStatus=false;
    };
    //表情、加号切换
    var tabChatAreaHandler=function(){
        //当点表情按钮的时候再给加号添加切换卡类名，否则动画效果会被覆盖
        var id=$(this).attr("data-id");
        $(id).removeClass("activehide");
    };
     //定位光标
    var gotoxyHandler=function(data){
        //表情img标签
        var src=data[0].answer;
         //将新表情追加到待发送框里
        var _html=$textarea.html()+src;
        $textarea.html(_html);
        var textarea=document.getElementById('js-textarea');
        textarea.scrollTop = textarea.scrollHeight;
        //提示文本
        //$textarea.attr("placeholder","当前是人工")
        //显示发送按钮
        manualmodeButton();
        //调整窗体高度
        autoSizePhone();
    };
    //模拟退格
    var backDeleteHandler=function(){
        var _html=$textarea.text();
        if(_html.length==1){
            _html="";

        }else{
            _html=$.trim(_html.substring(0,_html.length-1));
        }
        $textarea.text(_html);
        focusStatus=false
    };
    var onImageUpload = function(data) {
        //通过textarea.send事件将用户的数据传到显示台
        var img='<img class="webchat_img_upload uploadedFile" src="'+data[0].answer+'">';
        listener.trigger('sendArea.send',[{
         'answer' :img,
         'uid' : currentUid,
         'cid' : currentCid,
         //时间戳
         'dateuid' : data[0].token,
         'date': data[0].date,
         'token':data[0].token,
         //false证明不是重发(仅限图片)
         'sendAgain':false,
         'currentStatus':currentStatus
         }]);
        focusStatus=false;
        //输入框遮挡下收起
        inputUPHandler();
    };
    var artificialHandler=function(){
            $textarea.blur();
             //isSpeak=false;
            if(isRepeat==false){
                isRepeat=true;
                listener.trigger('sendArea.artificial');
                //防止快速点击转人工按钮
                setTimeout(function(){
                    isRepeat=false;
                },2000)
            }
            //autoSizePhone();
            focusStatus=false;
 
    };
    //宽高自适应手机
    var autoSizePhone=function(){
        //var _height=$(".chatArea").offset().top;
        //console.log(_height);
        //alert($(".sendarea").offset().top+18);
        listener.trigger('sendArea.autoSize',$chatArea);
    };
    //结束会话
    var endSessionHandler=function(status){
       switch(status) {
            case -3://人工优先模式，转人工失败,有客服排队中
                $qqFaceTip.addClass("activehide");
                //$satisfaction.addClass("activehide");
                break;
            case -2://仅人工模式，转人工失败,有客服排队中
                $textarea.attr("placeholder","排队中，请稍候...").attr("contenteditable","false");
                $artificial.addClass("activehide");
                $qqFaceTip.addClass("activehide");
                //$satisfaction.addClass("activehide");
                break;
            case -4://websocket中断，重连三次关闭
            case -1://仅人工模式，转人工失败,无客服
            case 1://客服自己离线了
            case 2://客服把你T了
            case 3://客服把你拉黑了
            case 4://长时间不说话
            case 6://有新窗口打开
            case 7://机器人超时下线
                $chatArea.removeClass("hideChatArea").addClass("showChatArea");
                $(".js-textarea").blur();
                 //为了iphone下的输入框遮挡兼容
                setTimeout(function(){
                    $(".js-chatArea").css("height","64px");
                },100)
                $keepSession.hide();
                $endSession.show();
                autoSizePhone();
                sessionEnd=true;
                if(status==-1){//仅人工模式，转人工失败,无客服
                    //移除满意度评价
                    $(".js-satisfaction").addClass("activehide");
                }
                //留言开关
                if(global.apiConfig.msgflag==1){
                    $(".js-leaveMsgBtn").addClass("activehide");
                }
                //flex兼容处理
                if($(".sendarea").css("display")!="flex"){
                    $(".endSession").css({"display":"inline-block"});
                };
               
                break;
        }
    };
    //重新开始新会话
    var newMessage=function(){
        var ua = navigator.userAgent.toLowerCase();
            if(ua.match(/MicroMessenger/i)=="micromessenger") {
                //微信内置浏览器必须使用添加随机数此方法
                var random=+new Date();
                str=window.location.href.replace("#","");
                //alert(str)
                window.location.href=str+"&refresh="+random;
            } else {
                window.location.reload();
            }
    };
    var evaluateHandler=function(){
        $.ajax({
            type : "post",
            url : "/chat/user/isComment.action",
            dataType : "json",
            data : {
                cid : global.apiInit.cid,
                uid : global.apiInit.uid,
                type: transferFlag
            },
            success:function(req){
                isEvaluated=req.isComment;
                //console.log(req.isComment);
                 //1表示评论过
                if(isEvaluated==1){
                    var evaluateSystem={type:'system',status:'evaluated',data:{content:'您已完成评价'}}
                    listener.trigger('sendArea.sendAreaSystemMsg',evaluateSystem);
                }else if(isEvaluated==0){//0表示说过话没有评论过
                    //防止用户快速多次点击弹层
                    var conf={};
                    var _html = doT.template(template.layerOpacity0)(conf);
                    $(document.body).append(_html);
                    //评价
                    evaluate(transferFlag,global);
                }else{//-1表示用户没有说过话
                    var evaluateSystem={type:'system',status:'firstEvaluate',data:{content:'资询后才能评价服务质量'}}
                    listener.trigger('sendArea.sendAreaSystemMsg',evaluateSystem);
                }
                focusStatus=false;
            }
        });
    };
    var hideKeyboard=function(data){
        //会话没结束的时候点击屏幕输入框失去焦点
        $textarea.blur();
        var viewHeight = $(document).height()-$(".sendarea").height();
        //data<viewHeight说明当前文本框处于抬起状态
        if(!sessionEnd&&data<viewHeight){
            $chatArea.removeClass("showChatArea").removeClass("showChatEmotion").removeClass("showChatAdd").addClass("hideChatArea");
            var _text = $textarea.text();
            if(transferFlag==0){
                if(_text) {
                    $qqFaceTip.addClass("activehide");
                } else {
                    $add.removeClass("activehide");
                    $qqFaceTip.addClass("activehide");
                }
            }else{
                if(_text) {
                    $qqFaceTip.removeClass("activehide");
                } else {
                    $add.removeClass("activehide");
                    $qqFaceTip.removeClass("activehide");
                }
            }
            inputUPHandler();
            focusStatus=false;
            autoSizePhone();
        }
    };
    //特殊机型输入框处理，降低
    var specialModelsHandler=function(){
       
    };
    //特殊机型输入框处理，抬高
    var specialModelshideKeyboardHandler=function(){
       //输入框遮罩只能输入单行，否则出兼容问题
       if(browserFlag==true){
            $(".js-textarea").css("max-height","20px");
        }
        //iphone6+下的safri浏览器和qq浏览器和微信浏览器
        if(phoneType=="iphone-6+"&&browserType=="safari"){
            $(".js-wrapper").css("height","288px");
            $(".js-chatArea").css({"top":"288px","height":"50px"});
            $(".js-noSliding").css("height","290px");
            setTimeout(function(){
                $(window).scrollTop('1'); 
            },50);
           
        }
        if(phoneType=="iphone-6+"&&browserType=="mqqbrowser"){
            $(".js-wrapper").css("height","283px");
            $(".js-chatArea").css({"top":"283px","height":"50px"});
            $(".js-noSliding").css("height","290px");
            setTimeout(function(){
                $(window).scrollTop('1'); 
            },50)
            
        }
        if(phoneType=="iphone-6+"&&(browserType=="micromessenger"||browserType=="qq")){
            $(".js-wrapper").css("height","286px");
            $(".js-chatArea").css({"top":"286px","height":"50px"});
            $(".js-noSliding").css("height","290px");
            setTimeout(function(){
                $(window).scrollTop('1'); 
            },50)
           
        }
        if(phoneType=="iphone-6+"&&browserType=="ucbrowser"){
            $(".js-wrapper").css("height","294px");
            $(".js-chatArea").css({"top":"294px","height":"50px"});
            //$(".js-noSliding").css("height","20px");
            setTimeout(function(){
                $(window).scrollTop('1'); 
            },50)
            
        }
         //iphone6
        if(phoneType=="iphone-6"&&(browserType=="safari"||browserType=="mqqbrowser"||browserType=="micromessenger"||browserType=="qq")){
            $(".js-wrapper").css("height","229px");
            $(".js-chatArea").css({"top":"229px","height":"50px"});
            $(".js-noSliding").css("height","230px");
            setTimeout(function(){
                $(window).scrollTop('1'); 
            },50);
             
        }
        if(phoneType=="iphone-6"&&browserType=="ucbrowser"){
            $(".js-wrapper").css("height","240px");
            $(".js-chatArea").css({"top":"240px","height":"50px"});
            //$(".js-noSliding").css("height","20px");
            setTimeout(function(){
                $(window).scrollTop('1'); 
            },50);
             
        }
        //iphone5
        if(phoneType=="iphone-5"&&(browserType=="safari"||browserType=="mqqbrowser"||browserType=="micromessenger"||browserType=="qq")){
            $(".js-wrapper").css("height","129px");
            $(".js-chatArea").css({"top":"129px","height":"50px"});
            $(".js-noSliding").css("height","150px");
            setTimeout(function(){
                $(window).scrollTop('1'); 
            },50);
             
        }
        if(phoneType=="iphone-5"&&browserType=="ucbrowser"){
            $(".js-wrapper").css("height","140px");
            $(".js-chatArea").css({"top":"140px","height":"50px"});
            //$(".js-noSliding").css("height","20px");
            setTimeout(function(){
                $(window).scrollTop('1'); 
            },50)
             
        }
        //华为荣耀6
        if(browserType=="safari"&&browserInfo.indexOf('h60-l03')!=-1){
            $(".js-wrapper").css("height","218px");
            $(".js-chatArea").css({"top":"218px","height":"50px"});
            $(window).scrollTop('1');
        }
        //魅族note2
        if(browserType=="safari"&&browserInfo.indexOf('mz-m2')!=-1){
            $(".js-wrapper").css("height","315px");
            $(".js-chatArea").css({"top":"315px","height":"50px"});
            $(window).scrollTop('1');
        }
        //魅族mx5
        if(browserType=="safari"&&browserInfo.indexOf('mz-mx5')!=-1){
            $(".js-wrapper").css("height","315px");
            $(".js-chatArea").css({"top":"315px","height":"50px"});
            $(window).scrollTop('1');
        } 
        //小米3
        if(browserType=="miuibrowser"&&browserInfo.indexOf('mi 3')!=-1){
            $(".js-wrapper").css("height","253px");
            $(".js-chatArea").css({"top":"253px","height":"50px"});
            $(window).scrollTop('1');
        }
        autoSizePhone();
    };
    //禁止输入框滑动，ios下有bug
    var noSliding=function(event){
        if(browserFlag==true){
             return false;//内容框超过五行也不能滑动
        }
    };
    var initHover=function(){
        $add.on("touchstart",function(){
            $(this).addClass("addhover");
        });
        $add.on("touchend",function(){
            setTimeout(function(){
                $add.removeClass("addhover")
            },300)
        });
        $qqFaceTip.on("touchstart",function(){
            $(this).addClass("qqFaceTiphover");
        });
        $qqFaceTip.on("touchend",function(){
            setTimeout(function(){
                $qqFaceTip.removeClass("qqFaceTiphover")
            },300)
        });
        $uploadImg.on("touchstart",function(){
            $(".uploadImgbg").addClass("uploadImgbgHover");
        });
        $uploadImg.on("touchend",function(){
            setTimeout(function(){
                $(".uploadImgbg").removeClass("uploadImgbgHover")
            },300)
        });
        $satisfaction.on("touchstart",function(){
            $(".satisfactionbg").addClass("satisfactionbgHover");
        });
        $satisfaction.on("touchend",function(){
            setTimeout(function(){
                $(".satisfactionbg").removeClass("satisfactionbgHover")
            },300)
        });
        $leaveMessage.on("touchstart",function(){
            $(".leaveMessagebg").addClass("leaveMessagebgHover");
        });
        $leaveMessage.on("touchend",function(){
            setTimeout(function(){
                $(".leaveMessagebg").removeClass("leaveMessagebgHover")
            },300)
        });
        
    };
    var flexcompatible=function(){ 
        $(".textarea").css({"width":"70%"}); 
        $(".endSession span").css({"display":"inline-block"});
        $(".endSession span").css({"width":"28%"});
    };
    var inputUPHandler=function(){ 
        if(browserFlag==true){
            $(".js-wrapper").css("height","100%");
            $(".js-chatArea").css({"top":"auto","height":"262px","bottom":"0"})
            $(".js-noSliding").css("height","0");
        };
        //$textarea.blur();
        //$(".js-add").removeClass("activehide")
        autoSizePhone();
    };
    var parseDOM = function() {
        $chatArea=$(".js-chatArea");
        $sendBtn = $(".js-sendBtn");
        $textarea = $(".js-textarea");
        $sendarea=$(".sendarea");
        //转人工按钮
        $artificial=$(".js-artificial")
        $add = $(".js-add");
        $chatAdd = $(".js-chatAdd");
        //上传图片按钮
        $uploadImg=$(".js-uploadImg");
        //表情按钮
        $emotion = $(".js-emotion");
        $chatEmotion = $(".js-chatEmotion");
        $tab=$(".js-tab");
        //会话弹窗
        $keepSession=$(".js-keepSession")
        //结束会话弹窗
        $endSession=$(".js-endSession");
        //新会话
        $newMessage=$(".js-newMessage");
        //评价
        $satisfaction=$(".js-satisfaction");
        //oTxt = document.getElementById("js-textarea");
        //留言按钮
        $leaveMessage= $(".js-leaveMessage");
        //提示
        //$placeholder=$(".js-placeholder");
        $qqFaceTip=$(".qqFaceTip");
    };

    var bindLitener = function() {
        //发送按钮
        $sendBtn.on(eventType,onbtnSendHandler);
        //qq表情
        $emotion.on(eventType,onEmotionClickHandler);
        $textarea.on("keyup",showSendBtnHandler);
        // 发送消息
        document.getElementById("js-textarea").addEventListener('input',showSendBtnHandler, false);
        //$textarea.on("keydown",chatAdminshowtextHandler);
        $textarea.on("focus",hideChatAreaHandler); 
        $textarea.on("focus",specialModelshideKeyboardHandler);
        $add.on(eventType,showChatAddHandler);
        $emotion.on(eventType,showChatEmotionHandler);
        //表情、加号切换
        $tab.on(eventType,tabChatAreaHandler)
        //定位光标
        listener.on("sendArea.gotoxy",gotoxyHandler);
        //模拟退格
        listener.on("sendArea.backDelete",backDeleteHandler);
        //发送图片
        listener.on("sendArea.uploadImgUrl",onImageUpload);
        $(window).on("resize",autoSizePhone);
        listener.on("listMsg.hideKeyboard",hideKeyboard);
        listener.on("listMsg.realScrollBottom",autoSizePhone);
        //转人工
        $artificial.on(eventType,artificialHandler);
        //结束会话
        listener.on("core.sessionclose",endSessionHandler);
        //新会话
        $newMessage.on(eventType,newMessage);
        //评价弹窗
        $satisfaction.on(eventType,evaluateHandler);
        //禁止滑动输入框
        $chatArea.on('touchmove',noSliding);
        $(".js-noSliding").on('touchmove',noSliding);
         
        //上传图片收起加号域
        listener.on("sendArea.closeAddarea",hideChatAreaHandler);
        //机器人超时会话
        listener.on("listMsg.robotAutoOffLine",endSessionHandler);
        //为了解决输入框遮挡问题
        $textarea.on("blur",function(){
            setTimeout(function(){
                inputUPHandler();
            },50);
        });
        //回车发送
        $textarea.on('keydown', function(evt) {
            if (evt.keyCode == "13") {
               /* var innerStr=$(".js-textarea").html();
                //判断输入框是否为空
                if(innerStr.length == 0 || /^\s+$/g.test(innerStr)) {
                    $textarea.html("")
                    return false;
                } else {*/
            //iphone人工模式下的回车会执行失焦事件
            if(transferFlag==1&&browserFlag){
                $textarea.blur();
                focusStatus=false;    
            }
            onbtnSendHandler(evt);
                    /*//回车执行发送
                    onbtnSendHandler(evt); 
                    //iphone下的uc浏览器不让它执行下面这一句，否则会出现问题
                    if(ucbrowserFlag==false){
                        setTimeout(function(){
                          specialModelshideKeyboardHandler();
                        },200)
                    }*/
                //}
                return false;
            }
        });
    };
    var onEmotionClickHandler = function() {
       listener.trigger('sendArea.faceShow');
    };
    var initPlugsin = function() {//插件
        //上传图片
        //uploadFun = uploadImg($uploadBtn,node,core,window);
        //statusHandler();
        //iphone下用tap事件，输入框不失焦
        eventType =navigator.userAgent.toLowerCase().indexOf("mobile") >=0?'tap':'click';
        phoneTypeFlag =navigator.userAgent.toLowerCase().indexOf("iphone") >=0?true:false;
        //alert(phoneTypeFlag);
        //alert(navigator.userAgent.toLowerCase());
        autoSizePhone();
    };
    var init = function() {
        //parseDOM();
        initPlugsin();
        bindLitener();
    //初始化按钮
        $qqFaceTip.addClass("activehide");
        $sendBtn.addClass("activehide");
        //hover效果
        initHover();
        //flex兼容处理
        if($(".sendarea").css("display")!="flex"){
           flexcompatible();
        }
    
        
    };
    (function(){
        parseDOM();
        //是否隐藏按钮
        listener.on("core.buttonchange",changeStatusHandler);
        //改变当前状态
        listener.on("core.statechange",statusHandler);
    })();
    listener.on("core.onload", function(data) { 
        global = data[0];
        currentUid=global.apiInit.uid;
        currentCid=global.apiInit.cid;
        //将uid传入上传图片模块
        listener.trigger('sendArea.sendInitConfig',{"uid":currentUid,"sysNum":global.sysNum});
        //获取当前浏览器的版本
        browserType=global.browser.browser;
        phoneType=global.UAInfo.iphoneVersion;
        browserInfo= navigator.userAgent.toLowerCase();
        //iphone下的浏览器都不支持第三方输入法弹起
        if(phoneType=="iphone-5"||phoneType=="iphone-6"||phoneType=="iphone-6+"){
             browserFlag=true;
        };
        //iphone下的uc浏览器
        if(browserType=="ucbrowser"&&(phoneType=="iphone-5"||phoneType=="iphone-6"||phoneType=="iphone-6+")){
             ucbrowserFlag=true;
        };
        //各种杂牌安卓手机的自带safari浏览器
        if(browserType=="safari"&&(browserInfo.indexOf('h60-l03')!=-1||browserInfo.indexOf('mz-m2')!=-1||browserInfo.indexOf('mz-mx5')!=-1)){
             browserFlag=true;
        };
        //小米浏览器
        if(browserType=="miuibrowser"&&browserInfo.indexOf('mi 3')!=-1){
             browserFlag=true;
        };
        
        /*//qq浏览器
        if(browserType=="qq"&&phoneType=="iphone-5"||phoneType=="iphone-6"||phoneType=="iphone-6+"){
            browserFlag=true;
        }
        //qq浏览器
        if(browserType=="mqqbrowser"&&phoneType=="iphone-5"||phoneType=="iphone-6"||phoneType=="iphone-6+"){
            browserFlag=true;
        }
        //微信浏览器
        if(browserType=="micromessenger"&&phoneType=="iphone-5"||phoneType=="iphone-6"||phoneType=="iphone-6+"){
            browserFlag=true;
        }*/
        //alert(browserType);
        var msgflag=global.apiConfig.msgflag;
        //为1移除留言按钮
        if(msgflag==1){
            $leaveMessage.remove();
        }else{
            var hostUrl=global.apiConfig.leaveMsgUrl;
            var conf=$.extend({
                'hostUrl':hostUrl
            });
            var _html = doT.template(template.leaveMessageBtn)(conf);
            var _html2 = doT.template(template.leaveMessageEndBtn)(conf);
            $leaveMessage.append(_html);
            $endSession.append(_html2);
        };
        $(".js-endSession").hide();
        //用户设置样式
        var userColor=global.userInfo.color;
        $sendBtn.css({"background-color":userColor})
        //转人工的url（需求)
        var wurl=global.apiConfig.wurl||"";
        if(wurl){
            $(".js-artificial").remove()
            $(".js-textarea").before('<a class="artificial" target="_parent" href="'+wurl+'"></a>')
        }
        init();
    });

}

module.exports = TextArea;
