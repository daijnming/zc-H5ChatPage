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
    //var ZC_Face = require('./qqFace.js');
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
        $sendBtn = $(".js-sendBtn");
        $textarea = $(".js-textarea");
        $add = $(".js-add");
        $chatAdd = $(".js-chatAdd");
        $emotion = $(".js-emotion");
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
            $sendMessage.val("")
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
        $sendMessage.val("");
        //清空待发送框
    };
    var showAddHandler=function(){
        if($chatAdd.hasClass("showChatAdd")){
            $chatAdd.removeClass("showChatAdd");
            $chatAdd.animate({
                height : "1px"
            },200);
        } else {
            $chatAdd.addClass("showChatAdd");
            $chatAdd.animate({
                height : "215px"
            },200)
        }

    };
    var hideChatAddHandler = function() {
        $chatAdd.removeClass("showChatAdd");
        $chatAdd.animate({
            height : "1px"
        },200);
    };
    var bindLitener = function() {
        //发送按钮
        $sendBtn.on("click",onbtnSendHandler);
        /*
         *
         qq表情
         */
        $emotion.on("click",onEmotionClickHandler);
        $textarea.on("keyup",showSendBtnHandler);
        $textarea.on("focus",hideChatAddHandler);
        $add.on("click",showAddHandler);
    };
    var initFace = function() {
       // ZC_Face(); 
    };
    var onEmotionClickHandler = function() {
      //  ZC_Face.show();
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
        currentUid=global.uid;
        currentCid=global.cid;
        console.log(data);
        init();
    });


}

module.exports = TextArea;
