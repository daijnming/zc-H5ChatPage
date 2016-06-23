/**
 * @author daijm
 */
function evaluate() {
    var template = require('./template.js');  
    //合并参数
    /*var conf = $.extend({
        "okText" : "确定",
        "title" : "提示",
    },option);*/
    var parseDOM = function() {
        $layer=$(".js-layer");
        $evaluate=$(".js-evaluate");
        
    };
    var defaultInner=function(){
        //$inner_html='<div class="layerInner js-layerInner"><p>是否解决了您的问题</p><div class="defaultwether"><span>是</span><span>否</span></div></div>'
    };
    //html_self自定义html添加到弹窗中
    var hide = function() {
        $(".js-layer").hide();
        $(".js-evaluate").hide();
    };
    var toggleActive=function(){console.log(this);
        $(this).addClass("active").siblings().removeClass("active")
    };
    var bindListener = function() {
        $(".js-layer").on("click",hide)
        $(".wether span").on("click",toggleActive)
    };
    var position =function(){
        //居中
        var left,top;
        left=($(window).width()-($(window).width()*0.9))/2+"px";
        top=($(window).height()-$(".js-evaluate").height())/2+"px";
        $(".js-evaluate").css("left",left);
        $(".js-evaluate").css("top",top);

    };
    var setInner = function() {
        if($('.js-evaluate').length <= 0){
            $layer_html='<div class="layer js-layer"></div>';
            $inner_html='<div class="evaluate js-evaluate"><p class="h1">是否解决了您的问题</p><div class="wether"><span class="js-isques">是</span><span class="js-noques">否</span></div><p class="h2">是否有以下情况</p><div class="situation"><span>答非所问</span><span style="margin-right:0">理解能力差</span><span>一问三不知</span><span style="margin-right:0">不礼貌</span></div><textarea placeholder="欢迎给我们的服务提建议"></textarea><a class="submit" href="#">提交评价</a></div>';
            $(document.body).append($layer_html);
            $(document.body).append($inner_html);
        }else{
            $(".js-layer").show();
            $(".js-evaluate").show();
        }
        position();
    };

    var init = function() {
        parseDOM();
        setInner();
        bindListener();
    };

    init();
}

module.exports = evaluate;
 