/*
* @author denzel
*/
var ScrollHandler = function(global,node){

  var That={};
  var pullDown,//下拉刷新
      wrapScroll;//滚动窗体

  var scroll;


  //api接口
  var api = {
      url_keepDetail : '/chat/user/getChatDetailByCid.action',
      url_detail : '/chat/user/chatdetail.action'
  };

  //初始化滚动插件
  var initScroll = function(){
    if(scroll){
      return;
    }else{
      scroll = new IScroll(wrapScroll[0], {
      // probeType：1对性能没有影响。在滚动事件被触发时，滚动轴是不是忙着做它的东西。
      // probeType：2总执行滚动，除了势头，反弹过程中的事件。这类似于原生的onscroll事件。
      // probeType：3发出的滚动事件与到的像素精度。注意，滚动被迫requestAnimationFrame（即：useTransition：假）。
      probeType : 3,
      tap : true,
      click : true,// 是否支持点击事件 FIXME 需要设置为TRUE 否则重新接入无法点击
      mouseWheel : true,// 是否支持鼠标滚轮
      useTransition : true,
      useTransform : true,
      snap : false,
      scrollbars : false,// 是否显示滚动条
      bounce : true,// 边界反弹
      momentum : true// 是否惯性滑动
      //  startY : -300
      });
    }
  };
  //开始下拉刷新
  var scrollStart = function(){
    var y = scroll.y,
        maxY = scroll.maxScrollY - y;
    if(global.flags.moreHistroy){
      if(y >= 40) {
          $(pullDown).text('加载中...');
          $(pullDown).addClass('loading');
          // $(pullDown).addClass('down');
          // $(pullDown).removeClass('up');
          return "";
      }
      // else if(y < 40 && y > 0) {
      //     $(pullDown).text('正在加载中...');
      //     // $(pullDown).addClass('up');
      //     // $(pullDown).removeClass('down');
      //     return "";
      // }
    }else{
      $(pullDown).text('没有更多消息');
      $(pullDown).removeClass('loading');
      // $('.js-loadingHistoryMask').removeClass('show');
      // $(pullDown).removeClass('up down');
    }
  };
  //下拉刷新
  That.pullDown = function(callback){
    var child = $('.js-chatPanelList').children().first().attr('date');
    var nexChild = $('.js-chatPanelList').children().eq(1).attr('date');
    var t = child?child:nexChild;
    //有更多历史记录
    if(scroll.y >= 40&&global.flags.moreHistroy) {
      global.flags.pageNow+=1;//下拉刷新
        $.ajax({
            type : "post",
            url : api.url_detail,
            dataType : "json",
            data : {
                uid : global.apiInit.uid,
                pageNow : global.flags.pageNow,
                pageSize : global.flags.pageSize,
                t:t
            },
            success:callback
        });
    }
  };
  //刷新页面
  That.myRefresh=function(){
    console.log('dd');
    setTimeout(function(){
      scroll.refresh();//刷新
      scroll.scrollTo(0,scroll.maxScrollY);
    },200);
  };
  var parseDom = function(){
    pullDown = $(node).find('.js-pullDownLabel');
    wrapScroll = $('.js-wrapper');
  };
  var bindListener = function(){
    scroll.on('scroll',scrollStart);
  };
  var init = function(){
    parseDom();
    initScroll();
    bindListener();
  };
  init();
  That.scroll = scroll;
  return That;
};
module.exports = ScrollHandler;
