/**
 * @author daijm
 */
//currentStatus为1则为机器人，为2则为人工
function evaluate(currentStatus) {
    var template = require('./template.js');
    var Alert=require('../util/alert.js');
    //var Dialog=require('../util/dialog.js');
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
    var sobotSetInnerStepOneHtml = function() {
        Alert = new Alert({
            'title' : '机器人是否解决了您的问题',
            'okText':'是',
            'cancelText' : '否',
            'OK' : function() {
                
            }
        });
        Alert.show();
    }
    //自定义html添加到弹窗中
    var sobotSetInnerStepTwoHtml = function() {
        Alert.show();
        var conf={};
        var _html = doT.template(template.sobotEvaluate_selfHtml)(conf);
        Alert.setInner(_html);
        $(".js-noques").addClass("active");
        $(".js-isques").on("click",hideDialog)
        $(".wether span").on("click",toggleActive);
        $(".situation span").on("click",toggleActiveRepeat);
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
            $aLi[i - 1].onclick = function (){
                iStar = this.index;
                switch(iStar) {
                    case 1://一星
                    case 2://二星
                    case 3://三星
                    case 4://四星
                        humanSetInnerStepTwoHtml(iStar)
                        break;
                    case 5://五星
                        Alert.hide();
                        alert("感谢您的反馈");
                        break;
                     
                }
            }
        }
    };
    var humanSetInnerStepTwoHtml=function(iStar){
        Alert.show();
        var conf={};
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
                    case 5://五星
                        Alert.hide();
                        alert("感谢您的反馈");
                        break;
                }
            }
        }
        $(".js-noques").addClass("active");
        $(".js-isques").on("click",hideDialog)
        $(".wether span").on("click",toggleActive);
        $(".situation span").on("click",toggleActiveRepeat);
    };
    var starEvaluateHandler=function(iStar){
       
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
    };
    var sobotbindListener = function() {
        //机器人评价
        $(".js-noques").on("click",sobotSetInnerStepTwoHtml);
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
            sobotSetInnerStepOneHtml();
            sobotbindListener();
        //人工评价
        }else{
            //humanInitPlugins();
            humanSetInnerStepOneHtml();
            humanbindListener();
        }
        
    };

    init();
    this.modeAlert = modeAlert;
}

module.exports = evaluate;
 