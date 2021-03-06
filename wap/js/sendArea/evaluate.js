/**
 * @author daijm
 */
//currentStatus为0则为机器人，为1则为人工
function evaluate(currentStatus,global) {
    var template = require('./template.js');
    var Alert=require('../util/alert.js');
    var listener = require("../../../common/util/listener.js");
    //var Dialog=require('../util/dialog.js');
    var currentStatus=currentStatus;
    var Alert,
        dialog;
    var score=0,
        tag="",
        remark="",
        type="";
    var parseDOM = function() {
        $evaluate=$(".js-evaluate");
    };
    //不可多选
    var toggleActive=function(){
        $(this).addClass("active").siblings().removeClass("active")
    };
    //可多选
    var toggleActiveRepeat=function(){
        $(this).toggleClass("active")
    };
    var textareaMaxlen = function (targetID, maxLen) {
        // 限制留言框最大字符数为200
        document.getElementById(targetID).addEventListener('input', function () {
            if (this.value.length > maxLen) {
                this.value = this.value.substr(0, maxLen);
            }
        }, false);
    };
    var sobotSetInnerStepOneHtml = function() {
        Alert = new Alert({
            'title' : '机器人是否解决了您的问题',
            'okText':'是',
            'cancelText' : '否',
            'OK' : function() {
                
            }
        });
        Alert.show();
    };
    //自定义html添加到弹窗中
    var sobotSetInnerStepTwoHtml = function() {
        //先将第一步弹窗移除
        $(".js-modeDialog").remove();
        Alert.show();
        //var conf={"inner1":"答非所问","inner2":"理解能力差","inner3":"一问三不知","inner4":"不礼貌"};
        var conf=global.apiConfig.robotCommentTitle.split(",");
        var _html = doT.template(template.sobotEvaluate_selfHtml)(conf);
        Alert.setInner(_html);
        $(".js-noques").addClass("active");
        $(".js-isques").on("click",beforeEvaluateAjaxHandler);
        //$(".js-isques").on("click",evaluateSuccess);
        $(".wether span").on("click",toggleActive);
        $(".situation span").on("click",toggleActiveRepeat);
        $(".submit").on("click",EvaluateAjaxHandler);
        textareaMaxlen("js-evaluateInner",200);
        
    };
    var humanSetInnerStepOneHtml=function(){
        Alert = new Alert({
            'title' : '客服评价',
            'footer':false
        });
        Alert.show();
        var conf={};
        var _html = doT.template(template.humanOne_selfHtml)(conf);
        Alert.setInner(_html);
        $aLi =$("#star li");
        var iStar = 0;
        for (i = 1; i <= $aLi.length; i++){ 
             
            $aLi[i - 1].index = i;
            //鼠标移过显示分数
            $aLi[i - 1].onmouseover = function (){
                fnPoint(this.index);
            };
            //鼠标离开后恢复上次评分
            $aLi[i - 1].onmouseout = function (){
                fnPoint(this.index);
            };
            //点击后进行评分处理
            $($aLi[i - 1]).bind("click",function (){
                iStar = this.index;
                switch(iStar) {
                    case 1://一星
                        score=1;
                        humanSetInnerStepTwoHtml(iStar);
                        break;
                    case 2://二星
                        score=2;
                        humanSetInnerStepTwoHtml(iStar);
                        break;
                    case 3://三星
                        score=3;
                        humanSetInnerStepTwoHtml(iStar);
                        break;
                    case 4://四星
                        score=4;
                        humanSetInnerStepTwoHtml(iStar);
                        break;
                    case 5://五星
                        score=5;
                        Alert.hide();
                        //alert("感谢您的反馈");
                        EvaluateAjaxHandler();
                        break;
                     
                }
            })
        }
    };
    var humanSetInnerStepTwoHtml=function(iStar){
        //Alert.show();
        //var conf={"inner1":"服务态度差","inner2":"回答不及时","inner3":"没解决问题","inner4":"不礼貌"};
        var conf=global.apiConfig.manualCommentTitle.split(",");
        var _html = doT.template(template.humanTwo_selfHtml)(conf);

        Alert.setInner(_html);
        $aLi =$("#star li");
        //var iStar = 0;
        for (i = 1; i <= $aLi.length; i++){
            //继承星星
            fnPoint(iStar);
            $aLi[i - 1].index = i;
            //鼠标移过显示分数
            $aLi[i - 1].onmouseover = function (){
                fnPoint(this.index);
            };
            //鼠标离开后恢复上次评分
            $aLi[i - 1].onmouseout = function (){
                fnPoint(this.index);
            };
            //点击后进行评分处理
            $aLi[i - 1].onclick = function (){
                iStar = this.index;
                switch(iStar) {
                    case 1://一星
                        score=1;
                        break;
                    case 2://二星
                        score=2;
                        break;
                    case 3://三星
                        score=3;
                        break;
                    case 4://四星
                        score=4;
                        break;
                    case 5://五星
                        score=5;
                        Alert.hide();
                        //alert("感谢您的反馈");
                        EvaluateAjaxHandler();
                        break;
                     
                }
            }
        }
        $(".js-noques").addClass("active");
        $(".js-isques").on("click",EvaluateAjaxHandler);
        //$(".js-isques").on("click",evaluateSuccess);
        $(".wether span").on("click",toggleActive);
        $(".situation span").on("click",toggleActiveRepeat);
        $(".js-submit").on("click",EvaluateAjaxHandler);
        textareaMaxlen("js-evaluateInner",200);
    };
    var beforeEvaluateAjaxHandler=function(){
        //机器人评价，score为1，则为是，为0则为否
        score=5;
        EvaluateAjaxHandler();
    };
    var EvaluateAjaxHandler=function(){
            remark=$(".js-evaluateInner").val()||'';
            var tag=[];
            for(var i=1;i<5;i++){
                if($(".tag"+i).hasClass("active")){
                    tag.push(i)
                }
            };
            tag=tag.join(",");
            $.ajax({
                type : "post",
                url : "/chat/user/comment.action",
                dataType : "json",
                data : {
                    cid : global.apiInit.cid,
                    visitorId:global.apiInit.uid,
                    score:score,
                    tag:tag,
                    remark:remark,
                    type:currentStatus 
                },
                success:function(req){
                    //alert("感谢您的反馈");
                    Alert.hide();
                    var conf={};
                    var evamsgHtml = doT.template(template.evamsgHtml)(conf);
                    $('body').append(evamsgHtml);
                    //居中弹窗位置
                    position(); 
                    setTimeout(function(){
                        $('.js-evamsg').remove();
                    },3000)
                },
                //请检查网络链接
                error:function(){
                    Alert.hide();
                    var conf={};
                    var evamsgHtml2 = doT.template(template.evamsgHtml2)(conf);
                    $('body').append(evamsgHtml2);
                    //居中弹窗位置
                    position();
                    setTimeout(function(){
                        $('.js-evamsg').remove();
                    },3000)
                }
            });
            $(".js-endSession span").css("width","45%");
     
       
    };
    var starEvaluateHandler=function(iStar){
       
    };
    var position =function(){
        //居中
        var left,top;
        left=($(window).width()-200)/2+"px";
        top=($(window).height()-$(".js-evamsg").height())/2+"px";
        $(".js-evamsg").css({"left":left,"top":top});
    }; 
    var fnPoint=function(iArg){//alert(iArg); 
        //分数赋值
        for (var i = 0; i < $aLi.length; i++){
          $aLi[i].className = i < iArg ? "on" : "";
        }
    };

    var modeAlert=function(){
        Alert.show();
    };
    var hideDialog=function(){
        Alert.hide();
        //evaluateSuccess();
        //$(".js-satisfaction").remove();
    };
    var evaluateSuccess=function(){
       /* if (navigator.onLine) { 
            //谢谢您的反馈
            var conf={};
            var evamsgHtml = doT.template(template.evamsgHtml)(conf);
            $('body').append(evamsgHtml);
            setTimeout(function(){
                $('.js-evamsg').remove();
            },3000)
        }
        //执行离线状态时的任务
        else {
            //提交失败,请重试
            var conf={};
            var evamsgHtml2 = doT.template(template.evamsgHtml2)(conf);
            $('body').append(evamsgHtml2);
            setTimeout(function(){
                $('.js-evamsg').remove();
            },3000)
        } 
        
        position(); */
    };
    var sobotbindListener = function() {
        //机器人评价
        $(".js-noques").on("click",sobotSetInnerStepTwoHtml);
        $(".js-isques").on("click",beforeEvaluateAjaxHandler);
       
    };
    var humanbindListener = function() {
        //人工评价
        //$(".js-noques").on("click",humanSetInnerStepTwoHtml);
        $(".js-isques").on("click",EvaluateAjaxHandler)
    };
    var init = function() {
        //防止用户快速多次点击弹层
        $('.layer-opacity0').remove();
        parseDOM();
        //机器人评价
        if(currentStatus==0){
            sobotSetInnerStepOneHtml();
            sobotbindListener();
        //人工评价
        }else{
            //humanInitPlugins();
            humanSetInnerStepOneHtml();
            //humanbindListener();
        }
       
    };
    init();
    this.modeAlert = modeAlert;

}

module.exports = evaluate;
 