/**
 * @author daijm
 */
function evaluate() {
    var template = require('./template.js');
    var Alert=require('../util/alert.js');
    var Dialog=require('../util/dialog.js');
    var Alert,
        dialog
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
        console.log(top);
        $(".js-evaluate").css({"left":left,"top":top});
    };
    //自定义html添加到弹窗中
    var setInnerHtml = function() {
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
    var modeAlert=function(){
        Alert.show();
    };
    var hideDialog=function(){
        Alert.hide();
        dialog.hide();
    };
    var initPlugins = function() {
        Alert = new Alert({
            'title' : 'dfg',
            'text' : '机器人是否解决了您的问题',
            'OK' : function() {
                
            }
        });
        dialog = new Dialog({
            'title' : 'zzzzzzzzz',
            'footer' : false
        });
        modeAlert();
    }
    var bindListener = function() {
        $(".js-noques").on("click",setInnerHtml);
        $(".js-isques").on("click",hideDialog)
    };
    var init = function() {
        parseDOM();
        initPlugins();
        bindListener();
    };

    init();
    this.modeAlert = modeAlert;
}

module.exports = evaluate;
 