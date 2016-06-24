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
        var _html = doT.template(template._selfHtml)(conf);
        dialog.setInner(_html);
        dialog.show();
        position();
        $(".js-noques").addClass("active");
        $(".js-isques").on("click",hideDialog)
        $(".wether span").on("click",toggleActive);
        $(".situation span").on("click",toggleActiveRepeat);
    };
    var humanSetInnerHtml=function(){
        alert("Not developed");
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
        Alert = new Alert({
            'title' : '人工客服评价',
            'footer':false,
            'OK' : function() {
                
            }
        });
        dialog = new Dialog();
        modeAlert();
    }
    var sobotbindListener = function() {
        //机器人评价
        $(".js-noques").on("click",sobotSetInnerHtml);
        $(".js-isques").on("click",hideDialog);
       
    };
    var humanbindListener = function() {
        //人工评价
        $(".js-noques").on("click",humanSetInnerHtml);
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
            humanbindListener();
        }
        
    };

    init();
    this.modeAlert = modeAlert;
}

module.exports = evaluate;
 