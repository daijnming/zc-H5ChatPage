/**
 * @author daijm
 */
function Dialog(spec) {
    var template = require('./template.js');
    var $layer,
        $outer;
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
        var _html = doT.template(template.AlertTemplate)(conf);
        $outer = $(_html);
    };
    var setInner = function(elm) {
        $layer.html($(elm));
    };
    var hide = function(e) {
        $layer.animate({
            'opacity' : 0
        },300, function() {
            setTimeout(function() {
                $layer.remove();
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
        $layer.delegate(".close_button",'click',hide);
        $(".wether span").on("click",toggleActive);
    };
    var position =function(){
        //居中
        var left,top;
        left=($(window).width()-($(window).width()*0.9))/2+"px";
        top=($(window).height()-$(".js-modeDialog").height())/2+"px";
        console.log($(".js-modeDialog").height());
        $(".js-modeDialog").css({"left":left,"top":top});
        //$(".js-modeDialog").css("top",top);
    };
    var show = function() {
        
        $(document.body).append($layer);
        $(".js-modeDialog").animate({
            'opacity' : 1
        },300);
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
