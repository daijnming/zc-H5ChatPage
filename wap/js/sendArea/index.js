/**
 *
 * @author daijm
 */
function TextArea(window) {
    //var that = {};
    var global;
    var listener = require("../../../common/util/listener.js");
    var loadFile = require('../../../common/util/load.js')();
    //表情
    var ZC_Face = require('./qqFace.js')();

    //上传附件
    /*var uploadImg = require('./uploadImg.js');
     var inputCache = {};
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
        $add = $(".js-add");
        $chatAdd = $(".js-chatAdd");
        $emotion = $(".js-emotion");
        $tab=$(".js-tab");
        oTxt = document.getElementById("js-textarea");
    };
    var onImageUpload = function(evt,data) {
        //onFileTypeHandler(data);
        //通过textarea.send事件将用户的数据传到显示台
        /*$(document.body).trigger('textarea.send',[{
         'answer' : answer,
         'uid' : data.uid,
         'cid' : data.cid,
         //时间戳
         'date' : +new Date()
         }]);*/
    };
    var showSendBtnHandler = function(evt) {
        var _text = $textarea.html();
        //console.log(_text);
        //var reg=/^(\<div\>\<br\>\<\/div\>)$/g;
        /*if(reg.test(_text)){
         $(".js-sendBtn").hide();
         $(".js-add").show();
         $(".js-textarea").css("width","80%")
         }*/
        /*if(evt.keyCode == 13) {return false;

         }*/
        /*$(".js-hideTextarea").val(_text);
         console.log(_text);
         _text=$(".js-hideTextarea").val();*/
        if(_text) {
            $sendBtn.show();
            //表情按钮
            $emotion.show();
            $add.hide();
            hideChatAreaHandler();
            $textarea.css("width","65%");
            listener.trigger('sendArea.autoSize',[{
                'height' : "263px"
            }]);
        } else {
            $sendBtn.hide();
            $emotion.hide();
            hideChatAreaHandler();
            $add.show();
            $textarea.css("width","85%");
            listener.trigger('sendArea.autoSize',[{
                'height' : "48px"
            }]);
        }


        //var reg=/&nbsp;/g;
        //var _text=_text.replace(reg,"");
        //console.log(_text);

    };
    var onbtnSendHandler = function(evt) {
        var str = $textarea.text();
        console.log(str);
        //判断输入框是否为空
        if(str.length == 0 || /^\s+$/g.test(str)) {
            $textarea.html("")
            return false;
        } else {
            //通过textarea.send事件将用户的数据传到显示台
            listener.trigger('sendArea.send',[{
                'answer' : str,
                'uid' : currentUid,
                'cid' : currentCid,
                'date' : +new Date()
            }]);
        }
        $textarea.html("");
        //清空待发送框
    };
    var showChatAreaHandler=function(){
        if($chatArea.hasClass("showChatArea")){
            $chatArea.removeClass("showChatArea");
            $chatArea.animate({
                bottom : "-215px"
            },200);
        } else {
            $chatArea.addClass("showChatArea");
            $chatArea.animate({
                bottom : "0px"
            },200)
        }
    };
    var hideChatAreaHandler = function() {
        $chatArea.removeClass("showChatArea");
        $chatArea.animate({
            bottom : "-215px"
        },200);
    };
    //表情、加号切换
    var tabChatAreaHandler=function(){
        //当点表情按钮的时候再给加号添加切换卡类名，否则动画效果会被覆盖
        $chatAdd.addClass("tab-active")
        var id=$(this).attr("data-id");
        $(".tab-active").hide();
        $(id).show();
    };
     //定位光标
    var gotoxyHandler=function(data){
        //表情img标签
        var src=data[0].answer;
         //将新表情追加到待发送框里
        oTxt.focus();
        var selection= window.getSelection ? window.getSelection() : document.selection;
        var range= selection.createRange ? selection.createRange() : selection.getRangeAt(0);
        if (!window.getSelection){//兼容处理
            oTxt.focus();
            var selection= window.getSelection ? window.getSelection() : document.selection;
            var range= selection.createRange ? selection.createRange() : selection.getRangeAt(0);
            //range.pasteHTML(src);
            range.collapse(false);
            range.select();
        }else{
            oTxt.focus();
            range.collapse(false);
            var hasR = range.createContextualFragment(src);
            var hasR_lastChild = hasR.lastChild;
            while (hasR_lastChild && hasR_lastChild.nodeName.toLowerCase() == "br" && hasR_lastChild.previousSibling && hasR_lastChild.previousSibling.nodeName.toLowerCase() == "br") {
            var e = hasR_lastChild;
            hasR_lastChild = hasR_lastChild.previousSibling;
            hasR.removeChild(e)
            }
            range.insertNode(hasR);
            if (hasR_lastChild) {
            range.setEndAfter(hasR_lastChild);
            range.setStartAfter(hasR_lastChild)
            }
            //console.log(range)
            //console.log(range.commonAncestorContainer.innerHTML.length);
            selection.removeAllRanges();
            selection.addRange(range)
        }
    };
    //模拟退格
    var backDeleteHandler=function(){
        var _text=$textarea.html();
        _text=_text.substring(0,_text.length-1);
        $textarea.focus();
        $textarea.html("");
        $textarea.html(_text)
    }
    var bindLitener = function() {
        //发送按钮
        $sendBtn.on("click",onbtnSendHandler);
        //qq表情
        $emotion.on("click",onEmotionClickHandler);
        $textarea.on("keyup",showSendBtnHandler);
        //$textarea.on("focus",hideChatAreaHandler);
        $add.on("click",showChatAreaHandler);
        $emotion.on("click",showChatAreaHandler);
        //表情、加号切换
        $tab.on("click",tabChatAreaHandler)
        //定位光标
        listener.on("sendArea.gotoxy",gotoxyHandler);
        //模拟退格
        listener.on("sendArea.backDelete",backDeleteHandler);

    };
    var onEmotionClickHandler = function() {
       listener.trigger('sendArea.faceShow');
    };
    var initPlugsin = function() {//插件
        //uploadFun = uploadImg($uploadBtn,node,core,window);
        //上传图片

        //qq表情滚动插件
        //$node.find(".item").perfectScrollbar();

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
        init();
    });

}

module.exports = TextArea;
