/**
 * @author daijm
 */
//currentStatus为1则为机器人，为2则为人工
function evaluate(currentStatus) {
    var template = require('./template.js');
    var Alert=require('../util/alert.js');
    var Dialog=require('../util/dialog.js');
    var currentStatus=currentStatus;
    var Alert,
        dialog;
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
    var position =function(){
        //居中
        var left,top;
        left=($(window).width()-($(window).width()*0.9))/2+"px";
        top=($(window).height()-$(".js-evaluate").height())/2+"px";
        $(".js-evaluate").css({"left":left,"top":top});
    };
    //自定义html添加到弹窗中
    var sobotSetInnerHtml = function() {
        Alert.hide();
        var conf={};
        var _html = doT.template(template.sobot_selfHtml)(conf);
        dialog.setInner(_html);
        dialog.show();
        position();
        $(".js-noques").addClass("active");
        $(".js-isques").on("click",hideDialog)
        $(".wether span").on("click",toggleActive);
        $(".situation span").on("click",toggleActiveRepeat);
    };
    var humanSetInnerStepOneHtml=function(){
        var conf={};
        var _html = doT.template(template.humanOne_selfHtml)(conf);
        dialog.setInner(_html);
        dialog.show();
        $aLi =$("#star li");
        var i = iScore = iStar = 0;
        for (i = 1; i <= $aLi.length; i++){
            $aLi[i - 1].index = i;
            //鼠标移过显示分数
            $aLi[i - 1].onmouseover = function (){
                fnPoint(this.index);
            };
            //鼠标离开后恢复上次评分
            $aLi[i - 1].onmouseout = function (){
                fnPoint();
            };
            //点击后进行评分处理
            $aLi[i - 1].onclick = function (){
                iStar = this.index;
            }
        }
    };
    var fnPoint=function(iArg){ 
        //分数赋值
        iScore = iArg || iStar;
        for (i = 0; i < $aLi.length; i++) $aLi[i].className = i < iScore ? "on" : "";
    };
    var humanSetInnerStepTwoHtml=function(){

    };
    var modeAlert=function(){
        Alert.show();
    };
    var hideDialog=function(){
        Alert.hide();
        dialog.hide();
    };
    var sobotInitPlugins = function() {
        Alert = new Alert({
            'title' : '机器人是否解决了您的问题',
            'okText':'是',
            'cancelText' : '否',
            'OK' : function() {
                
            }
        });
        dialog = new Dialog();
        modeAlert();
    }
    var humanInitPlugins = function() {
        dialog = new Dialog();
    }
    var sobotbindListener = function() {
        //机器人评价
        $(".js-noques").on("click",sobotSetInnerHtml);
        $(".js-isques").on("click",hideDialog);
       
    };
    var humanbindListener = function() {
        //人工评价
        $(".js-noques").on("click",humanSetInnerStepTwoHtml);
        $(".js-isques").on("click",hideDialog)
    };
    var init = function() {
        parseDOM();
        //机器人评价
        if(currentStatus==1){
            sobotInitPlugins();
            sobotbindListener();
        //人工评价
        }else{
            humanInitPlugins();
            humanSetInnerStepOneHtml();
            humanbindListener();
        }
        
    };

    init();
    this.modeAlert = modeAlert;
}

module.exports = evaluate;
 