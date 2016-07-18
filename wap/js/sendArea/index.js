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
        isEvaluated= -1;
        //0为机器人，1为人工
    var transferFlag=0;
    //传给聊天的url
    var statusHandler=function(data){
        currentStatus=data;
        if(currentStatus=="human"){
            transferFlag=1;
            $(".qqFaceTip").removeClass("activehide");
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
        //hide,转人工按钮隐藏,当前为人工模式
        if(data.action=="hide"){
            $artificial.addClass("activehide");
            $uploadImg.removeClass("activehide");
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
        }
        //判断当前是否为人工模式
        if(transferFlag==0){
            robotmodeButton();
        }else{
            manualmodeButton();
        }
        chatAdminshowtextHandler()
        
    };
    var robotmodeButton=function(){
        var _text = $textarea.text();
        if(_text) {
            $sendBtn.removeClass("activehide")
            $(".add").addClass("activehide")
            $(".addhover").addClass("activehide")
            hideChatAreaHandler();
        } else {
            $sendBtn.addClass("activehide")
            hideChatAreaHandler();
            $(".add").removeClass("activehide")
        }
        if(document.activeElement.id=="js-textarea"){
            focusStatus=true;
        }
    };
    var manualmodeButton=function(){
        var _text = $textarea.text();
        if(_text) {
            $sendBtn.removeClass("activehide")
            $(".add").addClass("activehide")
            $(".addhover").addClass("activehide")
        } else {
            $sendBtn.addClass("activehide")
            hideChatAreaHandler();
            $(".add").removeClass("activehide")
            $textarea.blur();
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
            var s = "";
            s = str.replace(/&/g, "&amp;");   
            s = s.replace(/</g, "&lt;");   
            s = s.replace(/>/g, "&gt;");   
            s = s.replace(/ /g, "&nbsp;");   
            s = s.replace(/\'/g, "&#39;");   
            s = s.replace(/\"/g, "&quot;");   
            s = s.replace(/\n/g, "<br>");
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
        //获取document上获取焦点的id
        if(focusStatus==true){
            $textarea.blur();
            $textarea.focus();
        }else{
            $(".add").removeClass("activehide")
        }
        $sendBtn.addClass("activehide")
        autoSizePhone();
    };
    var sendedKeepFocus=function(){
        //var t1=document.getElementById("js-textarea");
        
         
    };
    var showChatAddHandler=function(){
        //与键盘优化
        if($chatArea.hasClass("showChatAdd")){
            //隐藏
            hideChatAreaHandler();
            //0为机器人模式
            if(transferFlag==0){
                $(".addhover").addClass("activehide")
                $(".add").removeClass("activehide")
                $(".qqFaceTiphover").addClass("activehide")
                $(".qqFaceTip").addClass("activehide")
            }else{
                $(".addhover").addClass("activehide")
                $(".add").removeClass("activehide")
                $(".qqFaceTiphover").addClass("activehide")
                $(".qqFaceTip").removeClass("activehide")
            }

        } else {
            setTimeout(function(){
                //显示
                $chatArea.addClass("showChatAdd");
                $chatArea.removeClass("showChatEmotion");
                $chatAdd.show();
                $chatEmotion.hide();
                $chatArea.removeClass("hideChatArea").addClass("showChatArea");
                /*$chatArea.animate({
                    bottom : "0"
                },200);*/
                //0为机器人模式
                if(transferFlag==0){ 
                    $(".qqFaceTiphover").addClass("activehide")
                    $(".qqFaceTip").addClass("activehide")
                    $(".addhover").removeClass("activehide")
                    $(".add").addClass("activehide")
                }else{
                    $(".addhover").removeClass("activehide")
                    $(".add").addClass("activehide")
                    $(".qqFaceTiphover").addClass("activehide")
                    $(".qqFaceTip").removeClass("activehide")
                }
                autoSizePhone();
            },400)
        }
        focusStatus=false;
    };
    var showChatEmotionHandler=function(){
        //与键盘优化
        if($chatArea.hasClass("showChatEmotion")){
            //隐藏
            hideChatAreaHandler()
        } else {
            setTimeout(function(){
                //显示
                $chatArea.addClass("showChatEmotion");
                $chatArea.removeClass("showChatAdd");
                $chatAdd.hide();
                $chatEmotion.css("display","inline-block");
                $chatArea.removeClass("hideChatArea").addClass("showChatArea");
                if(transferFlag==0){
                    $(".qqFaceTiphover").addClass("activehide");
                    $(".qqFaceTip").addClass("activehide");
                    $(".addhover").addClass("activehide")
                    $(".add").removeClass("activehide")
                }else{
                    var _text=$textarea.text();
                    $(".qqFaceTiphover").removeClass("activehide")
                    $(".qqFaceTip").addClass("activehide");
                    $(".addhover").addClass("activehide")
                    if(_text){
                         $(".add").addClass("activehide")
                        $(".addhover").addClass("activehide")
                        $sendBtn.removeClass("activehide")
                    }else{
                        $(".add").removeClass("activehide")
                        $sendBtn.addClass("activehide");
                    }
                }
                autoSizePhone();
            },400)
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
                $(".qqFaceTiphover").addClass("activehide");
                $(".qqFaceTip").addClass("activehide");
                $(".addhover").addClass("activehide");
                if(_text){
                    $(".add").addClass("activehide");
                    $(".addhover").addClass("activehide");
                    $sendBtn.removeClass("activehide");
                }else{
                    $(".add").removeClass("activehide");
                    $sendBtn.addClass("activehide");
                }
            }else{
                $(".qqFaceTiphover").addClass("activehide");
                $(".qqFaceTip").removeClass("activehide");
                $(".addhover").addClass("activehide");
                if(_text){
                    $(".add").addClass("activehide");
                    $(".addhover").addClass("activehide");
                    $sendBtn.removeClass("activehide");
                }else{
                    $(".add").removeClass("activehide");
                    $sendBtn.addClass("activehide");
                }
            }
         //},100);
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
        //$textarea.html("");
        $textarea.text(_html);
        //manualmodeButton();
        //autoSizePhone();
        focusStatus=false
    };
    var onImageUpload = function(data) {
        //onFileTypeHandler(data);
        //通过textarea.send事件将用户的数据传到显示台
        //var date= currentUid + +new Date();
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
    };
    var artificialHandler=function(){
        //isSpeak=false;
        listener.trigger('sendArea.artificial');
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
            case -2://仅人工模式，转人工失败,有客服排队中
                $textarea.attr("placeholder","排队中，请等待...").attr("contenteditable","false");
                $artificial.addClass("activehide");
                $satisfaction.addClass("activehide");
                break;
            case -1://仅人工模式，转人工失败,无客服
            case 1://客服自己离线了
            case 2://客服把你T了
            case 3://客服把你拉黑了
            case 4://长时间不说话
            case 6://有新窗口打开
                $chatArea.removeClass("hideChatArea").addClass("showChatArea");
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
                break;
        }
    };
    //重新开始新会话
    var newMessage=function(){
        var ua = navigator.userAgent.toLowerCase();
            if(ua.match(/MicroMessenger/i)=="micromessenger") {
                //微信内置浏览器必须使用添加随机数此方法
                var random=+new Date();
                window.location.href=window.location.href+"&refresh="+random;
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
    var hideKeyboard=function(){
        //会话没结束的时候点击屏幕输入框失去焦点
        $textarea.blur();
        if(!sessionEnd){
            $chatArea.removeClass("showChatArea").removeClass("showChatEmotion").removeClass("showChatAdd").addClass("hideChatArea");
            var _text = $textarea.text();
            if(transferFlag==0){
                if(_text) {
                    $(".qqFaceTiphover").addClass("activehide");
                    $(".addhover").addClass("activehide");
                    $(".qqFaceTip").addClass("activehide");
                } else {
                    $(".qqFaceTiphover").addClass("activehide");
                    $(".addhover").addClass("activehide");
                    $(".add").removeClass("activehide");
                    $(".qqFaceTip").addClass("activehide");
                }
            }else{
                if(_text) {
                    $(".qqFaceTiphover").addClass("activehide");
                    $(".addhover").addClass("activehide");
                    $(".qqFaceTip").removeClass("activehide");
                } else {
                    $(".qqFaceTiphover").addClass("activehide");
                    $(".addhover").addClass("activehide");
                    $(".add").removeClass("activehide");
                    $(".qqFaceTip").removeClass("activehide");
                }
            }
            focusStatus=false;
            autoSizePhone();
        }
    };
    //特殊机型输入框处理，降低
    var specialModelsHandler=function(){
        var browserType= navigator.userAgent;
        //alert(browserType);
        if(browserType.indexOf("MZ-MX5 Build/LRX22C")>-1){
           $chatArea.css({"top":"592px"})
        };
        if(browserType.indexOf("MZ-m2 note Build/LMY47D")>-1){
           $chatArea.css({"top":"592px"})
        };
        if(browserType.indexOf("H60-L03 Build/HDH60-L03")>-1||browserType.indexOf("HUAWEI_H60_L03/5.0")>-1){
           $chatArea.css({"top":"437px"})
        }
    };
    //特殊机型输入框处理，抬高
    var specialModelshideKeyboardHandler=function(){
        var browserType= navigator.userAgent;
        //alert(browserType);
        if(browserType.indexOf("MZ-MX5 Build/LRX22C")>-1){
           $chatArea.css({"top":"357px"})
        };
        if(browserType.indexOf("MZ-m2 note Build/LMY47D")>-1){
           $chatArea.css({"top":"357px"})
        };
        if(browserType.indexOf("H60-L03 Build/HDH60-L03")>-1||browserType.indexOf("HUAWEI_H60_L03/5.0")>-1){
           $chatArea.css({"top":"250px"})
        }
    };
    //禁止输入框滑动，ios下有bug
    var noSliding=function(){
        return false;
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
    };
    
    var bindLitener = function() {
        //发送按钮
        $sendBtn.on("click",onbtnSendHandler);
        //qq表情
        $emotion.on("click",onEmotionClickHandler);
        $textarea.on("keyup",showSendBtnHandler);
        // 发送消息
        document.getElementById("js-textarea").addEventListener('input',showSendBtnHandler, false);
        //$textarea.on("keydown",chatAdminshowtextHandler);
        $textarea.on("focus",hideChatAreaHandler);
        $add.on("click",showChatAddHandler);
        $emotion.on("click",showChatEmotionHandler);
        //表情、加号切换
        $tab.on("click",tabChatAreaHandler)
        //定位光标
        listener.on("sendArea.gotoxy",gotoxyHandler);
        //模拟退格
        listener.on("sendArea.backDelete",backDeleteHandler);
        //发送图片
        listener.on("sendArea.uploadImgUrl",onImageUpload);
        $(window).on("resize",autoSizePhone);
        listener.on("listMsg.hideKeyboard",hideKeyboard);
        //转人工
        $artificial.on("click",artificialHandler);
        
        //结束会话
        listener.on("core.sessionclose",endSessionHandler);
        //新会话
        $newMessage.on("click",newMessage);
        //评价弹窗
        $satisfaction.on("click",evaluateHandler);
        //禁止滑动输入框
        $chatArea.on('touchmove',noSliding);
        //上传图片收起加号域
        listener.on("sendArea.closeAddarea",hideChatAreaHandler);
    };
    var onEmotionClickHandler = function() {
       listener.trigger('sendArea.faceShow');
    };
    var initPlugsin = function() {//插件
        //上传图片
        //uploadFun = uploadImg($uploadBtn,node,core,window);
        //statusHandler();
        autoSizePhone();
    };
    var init = function() {
        //parseDOM();
        initPlugsin();
        bindLitener();
    //初始化按钮
        $(".addhover").addClass("activehide");
        $(".qqFaceTip").addClass("activehide");
        $(".qqFaceTiphover").addClass("activehide");
        $sendBtn.addClass("activehide");
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
        init();
    });

}

module.exports = TextArea;
