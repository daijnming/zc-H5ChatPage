/**
 *
 * @author daijm
 */
//function TextArea(node,core,window) {
    /*var global = core.getGlobal();
    //var that = {};
    var loadFile = require('../util/load.js')();
    //表情
    var ZC_Face = require('../util/qqFace.js');
    //上传附件
    var uploadImg = require('./uploadImg.js');
    var inputCache = {};
    //模板引擎
    var template = require('./template.js');*/
   
    var global,
        uploadFun;
    var $node,
        $uploadBtn;
    var currentCid,
        currentUid,
        answer;
    //传给聊天的url
    var parseDOM = function() {
        //$node = $(node);
        //$uploadBtn = $node.find(".js-upload");
        //$textarea=$node.find(".js-textarea")
       
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
 
 
    /*var onbtnSendHandler = function(evt) {
        var str = $sendMessage.val();
        //ZC_Face.convertToEmoji($sendMessage.val());
        //判断输入框是否为空
        if(str.length == 0 || /^\s+$/g.test(str)) {
            $sendMessage.val("")
            return false;
        } else {
            //通过textarea.send事件将用户的数据传到显示台
            $(document.body).trigger('textarea.send',[{
                'answer' : str,
                'uid' : currentUid,
                'cid' : currentCid,
                'date' : +new Date()
            }]);
        }
        $sendMessage.val("");
        //清空待发送框
    };*/
  
   /* var onloadHandler = function(evt,data) {
        $node.find("img.js-my-logo").attr("src",data.face);
        $node.find(".js-customer-service").html(data.name);
        initFace();
    };
    var uploadFile = function() {
        uploadFun.onChangeHandler(currentUid,currentCid);
    };*/

    var showSendBtnHandler=function(evt){
        var _text=$(".js-textarea").html();
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
        if(_text){
            $(".js-sendBtn").show();
            $(".js-add").hide();
            $(".js-textarea").css("width","83%")
        }else{
            $(".js-sendBtn").hide();
            $(".js-add").show();
            $(".js-textarea").css("width","85%")
        }
        
        //var reg=/&nbsp;/g;
        //var _text=_text.replace(reg,"");
        //console.log(_text);
        
    };
    var showAddHandler=function(){
        if($(".js-chatAdd").hasClass("showChatAdd")){
            $(".js-chatAdd").removeClass("showChatAdd");
            $(".js-chatAdd").animate({height:"1px"},200);
        }else{
            $(".js-chatAdd").addClass("showChatAdd");
            $(".js-chatAdd").animate({height:"215px"},200)
        }
        
    };
    var hideChatAddHandler=function(){
        $(".js-chatAdd").removeClass("showChatAdd");
        $(".js-chatAdd").animate({height:"1px"},200);
    };
    var bindLitener = function() {
        //$(document.body).on("core.onload",onloadHandler);
        //发送按钮
        //$node.find(".js-sendBtn").on("click",onbtnSendHandler);
        //回车发送
        /*
         *
         qq表情
         */
        //$node.find(".js-emotion").on("click",onEmotionClickHandler);
        $(".js-textarea").on("keyup",showSendBtnHandler);
        $(".js-textarea").on("focus",hideChatAddHandler);
        $(".js-add").on("click",showAddHandler);
    };
    var initFace = function() {
        /*
         *saytext 待发送内容框
         *group 大表情集合
         *faceGroup表情集合
         *emojiGroup emoji表情集合
         *showId    聊天窗体
         *emotion 表情集合按钮
         *sub_btn 提交按钮
         *path 表情集合路径
         *emojiPath emoji表情集合路径
         */
        /*ZC_Face.initConfig({
            saytext : ".js-sendMessage",
            Group : "#faceGroupTarea",
            faceGroup : "#faceGroup",
            emojiGroup : "#emojiGroup",
            //showId : ".panel-body",
            emotion : ".js-emotion",
            //sub_btn : ".js-btnSend",
            path : global.scriptPath + "assets/images/qqarclist/",
            emojiPath : global.scriptPath + "assets/images/emoji/"
        }, function() {
            //cbk
        });*/
    };
    var onEmotionClickHandler = function() {
        //打开集合,默认qq表情为显示状态
        //ZC_Face.show(global);
        //ZC_Face.emojiShow(global);

    };
    var onEmotionIcoClickHandler = function() {
        //qq表情tab
        //$(this).addClass("active").siblings().removeClass("active");
        //$node.find('.groupChildren').hide();
       // var dataId = $(this).attr("data-tab");
        //$(dataId).show();
    };
    var initPlugsin = function() {//插件

        //uploadFun = uploadImg($uploadBtn,node,core,window);
        //上传图片

        //qq表情滚动插件
        //$node.find(".item").perfectScrollbar();

    };
    var init = function() {
        parseDOM();
        bindLitener();
        initPlugsin();

    };

    init();

//}

//module.exports = TextArea;
