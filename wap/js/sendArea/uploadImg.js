/**
 *
 * @author daijm
 */
function uploadImg() {
    var global;
    var listener = require("../../../common/util/listener.js");
    
    var currentUid="",
    sysNum="";
    /*
    //模板引擎
    var template = require('./template.js');*/
    //传给聊天的url
    var parseDOM = function() {
    };
    var onFormDataUpHandler=function(){
        //展示图片之前先隐藏加号  
        //listener.trigger('sendArea.closeAddarea');
        var oData = new FormData();
        var input = $(".js-upload")[0];
        //创建请求头
        var file = input.files[0];
        //判断上传文件是否为图片，file.type==""兼容魅族选择图库--wallpapers--任意图片--完成
        if(/^(image)/.test(file.type)||file.type==""){
            //创建本地图片数据流
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function(e){
                var tp=+new Date();
                var token= currentUid + tp;
                var fileRead = e.target.result;
                //展示本地图
                listener.trigger("sendArea.createUploadImg",[{
                    'result' : fileRead,
                    'date':tp,
                    'token':token
                }]);
                listener.trigger("sendArea.closeAddarea");
               //等待加号关闭，再定位
                setTimeout(function(){
                     listener.trigger('sendArea.autoSize',$(".js-chatArea"));
                     listener.trigger('sendArea.specialModels');
                 },700)
                setTimeout(function(){
                    oData.append("sysNum",sysNum);
                    //获取扩展名，如果是gif就不让他压缩
                    var etc = fileRead.substring(fileRead.indexOf("data:image/")+11, fileRead.indexOf(";base64"));
                    //console.log(etc);
                    if(etc=="gif"){
                        oData.append("base64",fileRead);
                        //上传 
                        onAjaxUploadUpHandler(oData,tp,token)
                    }else{
                        //this.result 本地图片的数据流
                        lrz(file, {
                            quality: 0.9//0.7 传4.82M剩于123k
                        }).then(function (results) {

                            // size单位为字节 5M = 5242880
                            if(results.base64Len >= 5242880) {
                                //图片过大
                                //alert("图片大于5M");
                                var imageLarge={type:'system',status:'imageLarge',data:{content:'图片大于5M,不能发送'}}
                                listener.trigger('sendArea.sendAreaSystemMsg',imageLarge);
                                return;
                            }
                            oData.append("base64",results.base64);
                            //alert(results.base64);
                            /*listener.trigger("sendArea.createUploadImg",[{
                                'result' : results.base64,
                                'date':tp,
                                'token':token
                            }])*/
                             //上传 
                            onAjaxUploadUpHandler(oData,tp,token)
                        }).catch(function (err) {
                            console.log('图片压缩失败')
                        }).always(function () {
                            //console.log('不管是成功失败，都会执行')
                        });
                    }
                },1500)
            }
           
        }else{
            //alert("请上传正确的图片格式");
            var imageError={type:'system',status:'imageError',data:{content:'请上传正确的图片格式'}}
            listener.trigger('sendArea.sendAreaSystemMsg',imageError);
        }
        //清空文本域
        $(".js-upload").val("");
          
    }
    var onAjaxUploadUpHandler=function(oData,tp,token){  
        //listener.trigger('sendArea.autoSize',$(".js-chatArea"));
        var oXHR = new XMLHttpRequest();
        oXHR.upload.addEventListener('progress', 
            function(e){
                if (e.lengthComputable) {
                    var iPercentComplete = Math.round(e.loaded * 100 / e.total);
                    var percentage=iPercentComplete.toString();
                    //console.log(percentage);
                    listener.trigger('sendArea.uploadImgProcess',{"percentage":percentage,"token":token}); //
                } else {
                    //document.getElementById('progress').innerHTML = '无法计算';
                } 
            }
            , false);
        oXHR.open('POST','/chat/webchat/fileuploadBase64.action');
        //console.log("我是base64上传");
        //中止上传
        listener.on('leftMsg.closeUploadImg',function(){
            oXHR.abort();
        })
        oXHR.send(oData);
        oXHR.onreadystatechange = function(req){
            if(req.target.readyState == 4){
                if(req.target.status == 200){
                   // console.log('base64上传成功');
                    var url = JSON.parse(req.target.response).url;
                    var img=url/*'<img class="webchat_img_upload uploadedFile" src="'+url+'">'*/;
                        listener.trigger('sendArea.uploadImgUrl',[{
                            'answer' : img,
                            'date':tp,
                            'token':token
                        }]);
                }else{
                    //alert("error");
                }
            }
        }
         
    };
    //重新发送
    var imgUploadAgain=function(data){
        var oData = new FormData();
        var oXHR = new XMLHttpRequest();
        var tp=+new Date();
        oXHR.upload.addEventListener('progress',  
            function(e){
                if (e.lengthComputable) {
                    var iPercentComplete = Math.round(e.loaded * 100 / e.total);
                    var percentage=iPercentComplete.toString();
                    console.log(percentage);
                    listener.trigger('sendArea.uploadImgProcess',{"percentage":percentage,"token":data.token}); //
                } else {
                    //document.getElementById('progress').innerHTML = '无法计算';
                } 
            }, false);
        oXHR.open('POST','/chat/webchat/fileuploadBase64.action');
        console.log("我是base64重新上传");
        //中止上传
        listener.on('leftMsg.closeUploadImg',function(){
            oXHR.abort();
        });
        oData.append("sysNum",sysNum);
        oData.append("base64",data.base64);
        oXHR.send(oData);
        oXHR.onreadystatechange = function(req){
            if(req.target.readyState == 4){
                if(req.target.status == 200){
                    var url = JSON.parse(req.target.response).url;
                    var img=url/*'<img class="webchat_img_upload uploadedFile" src="'+url+'">'*/;
                        listener.trigger('sendArea.uploadImgUrl',[{
                            'answer' : img,
                            'date':tp,
                            'token':data.token
                        }]);
                }else{
                    //alert("error");
                }
            }
        }
        
    }
    var bindLitener = function() {
        $(".js-upload").on("change",onFormDataUpHandler);
        listener.on('listMsg.imgUploadAgain',imgUploadAgain)
       
    };

    var initPlugsin = function() {//插件
    };
    var initConfig=function(data){
        currentUid=data.uid;
        sysNum=data.sysNum;
    };
    var init = function() {
        parseDOM();
        bindLitener();
        initPlugsin();
        listener.on('sendArea.sendInitConfig',initConfig)
        
    };
    init();

}

module.exports = uploadImg;
