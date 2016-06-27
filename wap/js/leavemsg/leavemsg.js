
/*
* @author denzel
*/

(function(){

  var topBack,//顶部返回栏
      topTitle,//顶部客服昵称
      $email,//邮箱
      $emailMsg,//邮箱提示
      emailHelper,//邮箱帮助
      errorBar,//错误提示
      successLogo,//提交成功
      successLayer,//留言成功弹出层
      submit;//提交按钮

  //FIXME  普通用户来源：0PC,1微信,2APP,3微博,4WAP,5融云,6呼叫中心
  var uSource=4,//source参数  默认为wap
      sysNum,//系统id
      uid,
      companyId,
      back;//顶部返回栏

  var host = 'http://test.sobot.com';//本地&测试
  // var host = 'http://www.sobot.com';//正式环境

  //接口
  var api={
    config: host+'/chat/user/config.action',
    postMsg:host+'/chat/data/postMsg.action'
  };

  var Comm = {
    getQueryParam : function() {
        var href = location.href;
        var queryString = href.substring(href.lastIndexOf("?") + 1);
        if(queryString.lastIndexOf("#") >= 0) {
            queryString = queryString.substring(0,queryString.lastIndexOf("#"));
        }
        var list = queryString.split("&");
        var param = {};
        for(var i = 0;i < list.length;i++) {
            var item = list[i];
            var key = item.substring(0,item.indexOf("="));
            var value = item.substring(item.indexOf("=") + 1);
            if(/^-?(\d+)(\.\d+)?$/.test(value)) {
                param[key] = Number(value);
            } else if(value === 'true') {
                param[key] = true;
            } else if(value === 'false') {
                param[key] = false;
            } else {
                param[key] = value;
            }
        }
        return param;
    }
  };
  //保存数据
  var onSave = function(email,content){
    $.ajax({
        type : "post",
        url : api.postMsg,
        dataType : "jsonp",
        data : {
            uid:uid,
            companyId:companyId,
            ticketContent:content,
            customerEmail:email,
            source:uSource,
            ticketFrom:uSource,
            customerSource:uSource
        },
        success : (function(data) {
          if(data&&data.retCode=='000000'){
            $(successLayer).addClass('show');
          }
        })
    });
  };
  //提交留言
  var onSubmit= function(){
    var emailRegex = /^([a-zA-Z0-9]+([-_\.][a-zA-Z0-9]+)*(?:@(?!-))(?:(?:[a-zA-Z0-9]*)(?:[a-zA-Z0-9](?!-))(?:\.(?!-)))+[a-zA-Z0-9]{2,})$/;
    if(!$email.val()){
      $(errorBar).addClass('show').text('请填写邮箱！');
    }else if(!$emailMsg.val()){
      $(errorBar).addClass('show').text('请填写问题描述！');
    }else {
      if(emailRegex.test($email.val())){
        $(submit).off('click');
        $(errorBar).removeClass('show');
        onSave($email.val(),$emailMsg.val());//提交后台保存处理
      }else{
        $(errorBar).addClass('show').text('邮箱格式错误！');
      }
    }
  };
  //判断顶部返回栏
  var topBackHandler = function(){
    if(back&&back==1){
      $(topBack).addClass('show');
      $(emailHelper).css('margin-top','70px');
      $(errorBar).css('top','50px');
    }else{
      $(topBack).removeClass('show');
      $(emailHelper).css('margin-top','20px');
      $(errorBar).css('top','20px');
    }
  };
  var parseDom=function(){
    topBack = $('.js-header-back');
    topTitle = $('.js-header-back .js-title');
    emailHelper = $('.js-wrap-helper');
    $email=$('input');//唯一
    $emailMsg = $('textarea');//唯一
    submit = $('footer');
    errorBar = $('.js-showLayer');
    successLogo = $('.js-success');
    successLayer = $('.js-submitLayer');//留言成功弹出层
  };
  var initPlugsin = function(){
    topBackHandler();
  };
  var bindListener = function(){
    $(submit).on('click',onSubmit);
  };
  //初始化留言页面
  var initConfig = function(){
    //url参数
    var params = Comm.getQueryParam();
    sysNum = params.sysNum;
    uSource = params.source?params.source:uSource;
    back = params.back;
    uid=params.uid;
    companyId = params.companyId;

    $.ajax({
        type : "post",
        url : api.config,
        dataType : "jsonp",
        data : {
            sysNum : sysNum,
            source : uSource
        },
        success : (function(data) {
          document.title= data.robotName;//title 名称 使用客服昵称
          $(topTitle).text(data.robotName);
          $(topBack).css('background',data.color);//顶部返回栏
          $(submit).css('background',data.color);//提交按钮
          $(successLogo).css('background-color',data.color);//留言成功
          //var msg = '<div>'+data.msgTxt+'</div>';
          //$(emailHelper).find('span').html(msg);
        })
    });
  };
  var init = function(){
    initConfig();
    parseDom();
    initPlugsin();
    bindListener();
  };
  init();

})();
