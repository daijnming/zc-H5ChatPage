/**
 *
 * @author daijm
 */
function uploadImg() {
    var global;
    var listener = require("../../../common/util/listener.js");
    //上传图片假消息时间戳
    var token="",
    currentUid;
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
        //判断上传文件是否为图片
        if(/^(image)/.test(file.type)){
            //创建本地图片数据流
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function(e){
                token= currentUid + +new Date();
                //this.result 本地图片的数据流
                //alert(this.result);
                listener.trigger("sendArea.createUploadImg",[{
                    'result' : this.result,
                    'token':token
                }])
            }
            oData.append("file",file);
            oData.append("type","msg");
            oData.append("countTag",1);
            oData.append("source",0);
            //上传,延迟一毫秒，先让图片在页面加载
            setTimeout(function(){onAjaxUploadUpHandler(oData)},100)


        }else{
            alert("请上传正确的图片格式")
        }
        //清空文本域
        $(".js-upload").val("");
    }
    function uploadProgress(e) { //进度上传过程
        if (e.lengthComputable) {
            var iPercentComplete = Math.round(e.loaded * 100 / e.total);
            var percentage=iPercentComplete.toString() + '%';
            listener.trigger('sendArea.uploadImgProcess',percentage);
        } else {
            alert("请上传正确的图片格式");
            //document.getElementById('progress').innerHTML = '无法计算';
        }
    }
    var onAjaxUploadUpHandler=function(oData){
        /*var oXHR=$.ajax({
            url : "/wap/js/sendArea/fileupload.json",
            type : "post",
            data : oData,
            'dataType' : 'json',
            //告诉jQuery不要去处理发送的数据
            processData : false,
            contentType : false,
        success:function(response) {
            var url = response.url;
            listener.trigger('sendArea.uploadImgUrl',[{
                'url' : url
            }]);
            //通过textarea.uploadImgUrl事件将图片地址传到聊天窗体
        },
        fail:function(ret) {
            console.log("上传失败");
        }
        });*/
       // var vFD = new FormData();
        var oXHR = new XMLHttpRequest();
        oXHR.upload.addEventListener('progress', uploadProgress, false);
        oXHR.open('POST','/wap/js/sendArea/fileupload.json');
        oXHR.send(oData);
        oXHR.onreadystatechange = function(req){
            if(req.target.readyState == 4){
                if(req.target.status == 200){
                    var url = JSON.parse(req.target.response).url;
                        listener.trigger('sendArea.uploadImgUrl',[{
                            'url' : url,
                            'token':token
                        }]);
                }else{
                    //alert("error");
                }
            }
        }
    };
    var bindLitener = function() {
        $(".js-upload").on("change",onFormDataUpHandler)
    };

    var initPlugsin = function() {//插件
    };
    var initConfig=function(data){
        currentUid=data;
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
