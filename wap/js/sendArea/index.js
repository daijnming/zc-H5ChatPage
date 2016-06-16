/**
 *
 * @author daijm
 */
function TextArea(window) {
    //var that = {};
    var global;
    var listener = require("../../../common/util/listener.js");
    //表情
    var ZC_Face = require('./qqFace.js')();
    //上传附件
    var uploadImg = require('./uploadImg.js')(); 
    /* var inputCache = {};
     //模板引擎
     var template = require('./template.js');*/

    var global;
    var $node;
    var currentCid,
        currentUid,
        answer;
    //传给聊天的url
    var parseDOM = function() {
        $chatArea=$(".js-chatArea");
        $sendBtn = $(".js-sendBtn");
        $textarea = $(".js-textarea");
        $sendarea=$(".sendarea");
        $add = $(".js-add");
        $chatAdd = $(".js-chatAdd");
        $emotion = $(".js-emotion");
        $chatEmotion = $(".js-chatEmotion");
        $tab=$(".js-tab");
        oTxt = document.getElementById("js-textarea");
    };
    var onImageUpload = function(data) {
        //onFileTypeHandler(data); 
        //通过textarea.send事件将用户的数据传到显示台
        var date= currentUid + +new Date();
        listener.trigger('sendArea.send',[{
         'answer' : data[0].url,
         'uid' : currentUid,
         'cid' : currentCid,
         //时间戳
         'date' : date,
         'token':data[0].token
         }]);
    };
    var showSendBtnHandler = function(evt) {
        var _text = $textarea.text();
        if(_text) {
            $sendBtn.show();
            //表情按钮
            $emotion.show();
            $add.hide();
            hideChatAreaHandler();
            $textarea.css("width","65%");
        } else {
            $sendBtn.hide();
            $emotion.hide();
            hideChatAreaHandler();
            $add.show();
            $textarea.css("width","85%");
        }

    };
    var onbtnSendHandler = function(evt) {
        var str = $textarea.text();
        //判断输入框是否为空
        if(str.length == 0 || /^\s+$/g.test(str)) {
            $textarea.html("")
            return false;
        } else {
            //通过textarea.send事件将用户的数据传到显示台
            var date= currentUid + +new Date();
            listener.trigger('sendArea.send',[{
                'answer' : str,
                'uid' : currentUid,
                'cid' : currentCid,
                'date' : date
            }]);
            
        }
        //清空待发送框
        $textarea.html("");
        $textarea.focus();
        autoSizePhone();    
    };
    var showChatAddHandler=function(){
        //与键盘优化
        setTimeout(function(){
            if($chatArea.hasClass("showChatAdd")){
                //隐藏
               hideChatAreaHandler();

            } else {
                //显示
                $chatArea.addClass("showChatAdd");
                $chatArea.animate({
                    bottom : "0"
                },200);
                autoSizePhone();
            }
        },200)
        
    };
    var hideChatAreaHandler = function() {
        setTimeout(function(){
            $chatArea.removeClass("showChatAdd");
            $chatArea.css({
                "bottom" : "-215px"
            });
            autoSizePhone();
         },200);
        //ico换成表情
        $(".qqFaceTip").css("background-position","-2px -3px");
        
        $textarea.focus();
    };
    //表情、加号切换
    var tabChatAreaHandler=function(){
        //当点表情按钮的时候再给加号添加切换卡类名，否则动画效果会被覆盖
        $chatAdd.addClass("tab-active");
        var id=$(this).attr("data-id");
        $(".tab-active").hide();
        $(id).show();
        //ico换成键盘
        if(id=="#chatEmotion"){
            $(".qqFaceTip").css("background-position","-145px -3px")
        }
    };
     //定位光标
    var gotoxyHandler=function(data){
        //表情img标签
        var src=data[0].answer;
         //将新表情追加到待发送框里
        var _html=$textarea.html()+src;
        $textarea.html(_html);
        autoSizePhone();
    };
    //模拟退格
    var backDeleteHandler=function(){
        var _html=$textarea.text();
        if(_html.length==1){
            _html="";
        }else{
            _html=_html.substring(0,_html.length-1);
        }
        $textarea.html("");
        $textarea.html(_html);
        autoSizePhone();
    };
    //宽高自适应手机
    var autoSizePhone=function(){
        //var _height=$(".chatArea").offset().top;
        //console.log(_height);
        listener.trigger('sendArea.autoSize',$chatArea);

    };
   
    var bindLitener = function() {
        //发送按钮
        $sendBtn.on("click",onbtnSendHandler);
        //qq表情
        $emotion.on("click",onEmotionClickHandler);
        $textarea.on("keyup",showSendBtnHandler);
        $textarea.on("focus",hideChatAreaHandler);
        $add.on("click",showChatAddHandler);
        $emotion.on("click",showChatAddHandler);
        //表情、加号切换
        $tab.on("click",tabChatAreaHandler)
        //定位光标
        listener.on("sendArea.gotoxy",gotoxyHandler);
        //模拟退格
        listener.on("sendArea.backDelete",backDeleteHandler);
        //发送图片
        listener.on("sendArea.uploadImgUrl",onImageUpload);
        $(window).on("resize",autoSizePhone);
    };
    var onEmotionClickHandler = function() {
       listener.trigger('sendArea.faceShow');
    };
    var initPlugsin = function() {//插件
        //uploadFun = uploadImg($uploadBtn,node,core,window);
        //上传图片
        autoSizePhone();
    };
    var init = function() {
        parseDOM();
        initPlugsin();
        bindLitener();
    };
    listener.on("core.onload", function(data) {
        global = data;
        currentUid=global[0].apiInit.uid;
        currentCid=global[0].apiInit.cid;
        //将uid传入上传图片模块
        listener.trigger('sendArea.sendInitConfig',currentUid)
        init();
    });

}

module.exports = TextArea;
