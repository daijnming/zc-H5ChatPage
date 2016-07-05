/**
 *
 * @author daijm
 */
function uploadImg() {
    var global;
    var listener = require("../../../common/util/listener.js");
    //上传图片假消息时间戳
    var token="",
    tp="",
    currentUid="",
    sysNum="";
    /*
    //模板引擎
    var template = require('./template.js');*/
    //传给聊天的url
    var parseDOM = function() {
    };

    var onFormDataUpHandler=function(){
        var oData = new FormData();
        var input = $(".js-upload")[0];
        //创建请求头
        var file = input.files[0];
        // size单位为字节 5M = 5242880
        if(file.size >= 5242880) {
            //console.log("当前上传图片的大小：");
            //console.log(file);
            //图片过大
            //alert("图片大于5M");
            var imageLarge={type:'system',status:'imageLarge',data:{content:'图片大于5M,不能发送'}}
            listener.trigger('sendArea.sendAreaSystemMsg',imageLarge);
            return;
        }
        //console.log(file);
        //判断上传文件是否为图片
        if(/^(image)/.test(file.type)){
            //创建本地图片数据流
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function(e){
                tp=+new Date();
                token= currentUid + tp;
                //this.result 本地图片的数据流
                //console.log("当前上传图片的大小：");
                //console.log(file);
                lrz(file, {quality: 0.7},function (results) {
                    //console.log("压缩后的图片大小：");
                    //console.log(results);
                   listener.trigger("sendArea.createUploadImg",[{
                    'result' : results.base64,
                    'date':tp,
                    'token':token
                    }])
                });
            }
            oData.append("file",file);
            oData.append("type","msg");
            oData.append("countTag",1);
            oData.append("source",0);
            //上传,延迟一毫秒，先让图片在页面加载
            //onAjaxUploadUpHandler(oData)
            setTimeout(function(){onAjaxUploadUpHandler(oData)},100)
        }else{
            //alert("请上传正确的图片格式");
            var imageError={type:'system',status:'imageError',data:{content:'请上传正确的图片格式'}}
            listener.trigger('sendArea.sendAreaSystemMsg',imageError);
        }
        //清空文本域
        $(".js-upload").val("");
    }
    var  uploadProgress=function(e) { //进度上传过程
        if (e.lengthComputable) {
            var iPercentComplete = Math.round(e.loaded * 100 / e.total);
            var percentage=iPercentComplete.toString();
            console.log(percentage);
            listener.trigger('sendArea.uploadImgProcess',percentage); 
        } else {
            //document.getElementById('progress').innerHTML = '无法计算';
        }
    }
   
    var onAjaxUploadUpHandler=function(oData){
        console.log(oData)
        var oXHR = new XMLHttpRequest();
        oXHR.upload.addEventListener('progress', uploadProgress, false);
        oXHR.open('POST','/chat/webchat/fileupload.action');
        //中止上传
        listener.on('leftMsg.closeUploadImg',function(){
            oXHR.abort();
        })
        oXHR.send(oData);
        oXHR.onreadystatechange = function(req){
            if(req.target.readyState == 4){
                if(req.target.status == 200){
                    var url = JSON.parse(req.target.response).url;
                    var img='<img class="webchat_img_upload uploadedFile" src="'+url+'">';
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
        //console.log(data);
        var oData;
        var oXHR = new XMLHttpRequest();
        oXHR.upload.addEventListener('progress', uploadProgress, false);
        oXHR.open('POST','/chat/webchat/fileuploadBase64');
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
                    var img='<img class="webchat_img_upload uploadedFile" src="'+url+'">';
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
