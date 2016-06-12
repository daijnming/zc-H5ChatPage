/**
 *
 * @author daijm
 */
function TextArea(node,core,window) {
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
            $add.hide();
            $textarea.css("width","83%")
        } else {
            $sendBtn.hide();
            $add.show();
            $textarea.css("width","85%")
        }

        //var reg=/&nbsp;/g;
        //var _text=_text.replace(reg,"");
        //console.log(_text);

    };
     var onbtnSendHandler = function(evt) {
        var str =$textarea.html();
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
        var id=$(this).attr("data-id");
        $(".tab-active").hide();
        $(id).show();
    };
     //定位光标
    var gotoxyHandler=function(evt,data){
        console.log(data);
        var src=data.answer;
         //将新表情追加到待发送框里
        var oTxt1 = document.getElementById("js-textarea");
        var cursurPosition=-1;
        if(oTxt1.selectionStart||oTxt1.selectionStart==0){//非IE浏览器
            cursurPosition= oTxt1.selectionStart;
        }else{//IE
           var range = document.selection.createRange();
            range.moveStart("character",-oTxt1.value.length);
            cursurPosition=range.text.length;
        }
        var currentSaytextBefore=$textarea.html().substring(0,cursurPosition);
        var currentSaytextAfter=$textarea.html().substring(cursurPosition);
        var currentSaytext=currentSaytextBefore+src+currentSaytextAfter;
        $($sendMessage).val(currentSaytext);
        //定位光标
        var pos=(currentSaytextBefore+src).length;
        if(oTxt1.setSelectionRange)
            {
                oTxt1.setSelectionRange(pos,pos);
                oTxt1.focus();
            }
            else if (oTxt1.createTextRange) {
                var range = oTxt1.createTextRange();
                range.collapse(true);
                range.moveEnd('character', pos);
                range.moveStart('character', pos);
                range.select();
            }
    };
    var bindLitener = function() {
        //发送按钮
        $sendBtn.on("click",onbtnSendHandler);
        //qq表情
        $emotion.on("click",onEmotionClickHandler);
        $textarea.on("keyup",showSendBtnHandler);
        $textarea.on("focus",hideChatAreaHandler);
        $add.on("click",showChatAreaHandler);
        $emotion.on("click",showChatAreaHandler);
        $tab.on("click",tabChatAreaHandler)
        //定位光标
        listener.on("textarea.gotoxy",gotoxyHandler);
    };
    var initFace = function() {
       //ZC_Face(); 
    };
    var onEmotionClickHandler = function() {
       //ZC_Face.show();
       listener.trigger('sendArea.faceShow');
    };
    var initPlugsin = function() {//插件 
        initFace();
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
        currentUid=global.uid;
        currentCid=global.cid;
        init();
    });


}

module.exports = TextArea;
