/**
 * @author daijm
 */
function Dialog(spec) {
    var template = require('./template.js');
    var $layer="",
        $AlertTemplate_html="";
    var _self = this;
    var conf = $.extend({
        "okText" : "确定",
        "title" : "提示",
        'inner' : false,
        "OK" : function() {

        }
    },spec);
    var initDOM = function() {
        $layer = $(template.layer);
        $AlertTemplate_html = doT.template(template.AlertTemplate)(conf);
    };
    var setInner = function(elm) {
        $(".model-body").html(elm);
        position();
    };
    var hide = function(e) {
        //灰层要和内容分开，否则输入框弹起，内容不跟随弹起，导致文本被键盘遮住
        $layer.animate({
            'opacity' : 0
        },300, function() {
            setTimeout(function() {
                $layer.remove();
            },100);
        });
        $(".js-modeDialog").animate({
            'opacity' : 0
        },300, function() {
            setTimeout(function() { 
                $(".js-modeDialog").remove();
            },100);
        });
        
    };
    //不可多选
    var toggleActive=function(){
        $(this).addClass("active").siblings().removeClass("active")
    };
    var bindListener = function() {
        //$layer.on("click",hide);
        /*$layer.on("click",function(e) { 
            e.stopPropagation();
        });*/
        $(".js-modeDialog").delegate(".close_button",'click',hide);
        $(".wether span").on("click",toggleActive);
    };
    var position =function(){
        //居中
        var left,top;
        left=($(window).width()-($(window).width()*0.84))/2+"px";
        top=($(window).height()-$(".js-modeDialog").height())/2+"px";
        $(".js-modeDialog").css({"left":left,"top":top});
        //$(".js-modeDialog").css("top",top);
    };
    var show = function() {
        //灰层要和内容分开，否则输入框弹起，内容不跟随弹起，导致文本被键盘遮住
        $(document.body).append($layer);
        $(document.body).append($AlertTemplate_html);
        bindListener();
        position();
    };
    var init = function() {
        initDOM();
    };
    init();

    //this.getOuter = getOuter;
    this.setInner = setInner;
    this.show = show;
    this.hide = hide;
}

module.exports = Dialog;
