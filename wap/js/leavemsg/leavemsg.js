
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
      closeErrorBar,//关闭提示框
      textAreaWrap,//textarea父元素-div
      goBack,//留言成功按钮
      captchaMaskLayer,//极验蒙板
      submit;//提交按钮

  //FIXME  普通用户来源：0PC,1微信,2APP,3微博,4WAP,5融云,6呼叫中心

  var uSource=1,//source参数  默认为微信
      sysNum,//系统id
      uid,
      isMsg=0, //默认为0   0没有留过言  1 已经留过言
      back;//顶部返回栏

  var host = '';//本地&测试
  // var host = 'http://www.sobot.com';//正式环境

  //接口
  var api={
    config: host+'/chat/user/config.action',//初始化参数
    postMsg:host+'/chat/data/postMsg.action',//提交数据
    IIsMsg:host+'/chat/data/isMessage.action',//判断留言
    // IStartCaptcha:host+'/chat/data/startCaptcha.action',//极验初始  暂不使用
    IPostMsgAfterVerify:host+'/chat/data/postMsgAfterVerify.action'//极验提交数据
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
        dataType : "json",
        data : {
            uid:uid,
            companyId:sysNum,
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
  //极验方式保存数据
  var onSaveByCaptcha = function(){
    $(".js-mask, .js-popup-captcha-mobile").show();
  };
  //提交留言
  var onSubmit= function(){
    var emailRegex = /^([a-zA-Z0-9]+([-_\.][a-zA-Z0-9]+)*(?:@(?!-))(?:(?:[a-zA-Z0-9]*)(?:[a-zA-Z0-9](?!-))(?:\.(?!-)))+[a-zA-Z0-9]{2,})$/;
    if(!$email.val()){
      $(errorBar).addClass('show').find('.js-errorLine').text('请填写邮箱！');
    }else if(!emailRegex.test($email.val())){
      $(errorBar).addClass('show').find('.js-errorLine').text('邮箱格式错误！');
    }else if(!$emailMsg.val()){
      $(errorBar).addClass('show').find('.js-errorLine').text('请填写问题描述！');
    }else {
      $(errorBar).removeClass('show');
      $(submit).off('click');
      onSave($email.val(),$emailMsg.val());//提交后台保存处理
      // if(!isMsg){
      //   $(submit).off('click');
      //   onSave($email.val(),$emailMsg.val());//提交后台保存处理
      // }else
      //   onSaveByCaptcha();//极验方式保存数据
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
      $(errorBar).css('top','0');
    }
  };
  //关闭提示框
  var onCloseErrorBar = function(){
    $(errorBar).removeClass('show');
  };
  var onTouchmove = function(e){
    e.preventDefault();
    e.stopPropagation();
  };

  //判断是否留言过
var initMsgConfig = function(){
  $.ajax({
      type : "post",
      url : api.IIsMsg,
      dataType : "json",
      data : {
          uid : uid,
          msgFlag:1 //0 pc  1 h5
      },
      success:function(ret){
        isMsg = +ret.isMessage; //0 没留  1 已留
      if(isMsg){
        ret.resStr = JSON.parse(ret.resStr);
        initGeetest({
              gt: ret.resStr.gt,
              challenge: ret.resStr.challenge,
              offline: !ret.resStr.success // 表示用户后台检测极验服务器是否宕机，一般不需要关注
          }, handlerPopupMobile);
        }
      }
    });
  };
  //极验方法
  var handlerPopupMobile = function (captchaObj) {

        //拖动验证成功后两秒(可自行设置时间)自动发生跳转等行为
        captchaObj.onSuccess(function () {
            var validate = captchaObj.getValidate();
            $.ajax({
                url: api.IPostMsgAfterVerify, // 进行二次验证 即提交数据
                type: "post",
                dataType: "json",
                data: {
                    // 二次验证所需的三个值
                    username: $email.val(),
                    password: $emailMsg.val(),
                    msgFlag:1,//0 pc 1 h5
                    geetest_challenge: validate.geetest_challenge,
                    geetest_validate: validate.geetest_validate,
                    geetest_seccode: validate.geetest_seccode
                },
                success: function (data) {
                  if(data&&data.retCode=='000000'){
                    $(successLayer).addClass('show');
                  }
                }
            });
        });
        captchaObj.bindOn(".js-submit");
        // 将验证码加到id为captcha的元素里
        captchaObj.appendTo(".js-popup-captcha-mobile");
  };
  //极验蒙板
  var onMaskHide = function(){
    $('.js-mask, .js-popup-captcha-mobile').hide();
  };
  //初始化留言页面
  var initConfig = function(){
    //url参数
    var params = Comm.getQueryParam();
    sysNum = params.sysNum;
    uSource = params.source?params.source:uSource;
    back = params.back;
    uid=params.uid;
    color= params.color;
    $.ajax({
        type : "post",
        url : api.config,
        dataType : "json",
        data : {
            sysNum : sysNum,
            source : uSource
        },
        success : (function(data) {
          var reg = /^(([a-fA-F0-9]{3})|([a-fA-F0-9]{6}))$/;
          var _color = reg.test(color)?'#'+color:data.color;//默认从参数配置取
          document.title= data.robotName;//title 名称 使用客服昵称
          $(topTitle).text(data.robotName);
          $(topBack).css('background',_color);//顶部返回栏
          $(submit).css('background',_color);//提交按钮
          $(successLogo).css('background-color',_color);//留言成功图标
          $(goBack).css('background-color',_color);//留言成功按钮
          var msg = '<div>'+data.msgTxt+'</div>';
          $(emailHelper).find('.js-helper').html(msg);
          //内容提示
          var msgTmp='<div>'+data.msgTmp+'</div>';
          //该属性赋值显示不了
          // $($emailMsg).attr('placeholder',$(msgTmp).text());
          $(textAreaWrap).append('<textarea name="name" placeholder="'+$(msgTmp).text()+'" rows="8" cols="40"></textarea maxlength="100">');
          //重新再绑定一下
          $emailMsg = $('textarea');
        })
    });
  };
  var bindListener = function(){
    $(submit).on('click',onSubmit);
    $(closeErrorBar).on('click',onCloseErrorBar);
    $(successLayer).on('touchmove',onTouchmove);
    $(captchaMaskLayer).on('click',onMaskHide);
  };
  var parseDom=function(){
    topBack = $('.js-header-back');
    topTitle = $('.js-header-back .js-title');
    emailHelper = $('.js-wrap-helper');
    $email=$('input');//唯一
    $emailMsg = $('textarea');//唯一
    submit = $('footer .js-submit');//提交按钮
    errorBar = $('.js-showLayer');
    successLogo = $('.js-success');
    successLayer = $('.js-submitLayer');//留言成功弹出层
    closeErrorBar = $('.js-errorIcon');
    textAreaWrap = $('.js-content-msg');
    goBack = $('.js-submitLayer .js-gobak');
    captchaMaskLayer = $('.js-mask');
  };

  var initPlugsin = function(){
    initConfig();//留言参数初始化
    // initMsgConfig();//是否已经留言
    topBackHandler();

  };
  var init = function(){
    parseDom();
    initPlugsin();
    bindListener();
  };
  init();

})();
