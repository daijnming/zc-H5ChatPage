/**
 *
 * @author daijm
 */
function uploadImg() {
    var global;
    var listener = require("../../../common/util/listener.js");
    var iBytesUploaded = 0;
    var iBytesTotal = 0;
    var iPreviousBytesLoaded = 0;
    var oTimer = 0;
    /*var global = core.getGlobal();
    //模板引擎
    var template = require('./template.js');*/
    //传给聊天的url
    var parseDOM = function() {
    };
  
    var onFormDataUpHandler=function(e){
        var oData = new FormData();
        var input = $(".js-upload")[0];
        //创建请求头
        var file = input.files[0];
        //创建本地图片数据流
        var reader = new FileReader();
        reader.readAsDataURL(file); 
        reader.onload = function(e){
            //this.result 本地图片的数据流
            //alert(this.result);
            listener.trigger("sendArea.createUploadImg",this.result)
        }
        oData.append("file",file);
        oData.append("type","msg");
        oData.append("countTag",1);
        oData.append("source",0);
        //上传
        onAjaxUploadUpHandler(oData);
        //清空文本域
        $(".js-upload").val("");
    }
    function uploadProgress(e) { //进度上传过程
        if (e.lengthComputable) {
            var iPercentComplete = Math.round(e.loaded * 100 / e.total);
            document.getElementById('progress_percent').innerHTML = iPercentComplete.toString() + '%';
            document.getElementById('progress').style.width = (iPercentComplete * 4).toString() + 'px';
        } else {
            document.getElementById('progress').innerHTML = '无法计算';
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
                     console.log(req.target.response);
                        //alert(url);
                        listener.trigger('sendArea.uploadImgUrl',[{
                            'url' : url
                        }]);  
                }else{
                    alert("error");  
                }  
            }   
        } 
        var oProgress = document.getElementById('progress');
        oProgress.style.display = 'block';
        oProgress.style.width = '0px';
    };
    var bindLitener = function() {
        $(".js-upload").on("change",onFormDataUpHandler)
    };
     
    var initPlugsin = function() {//插件
    };
    var init = function() {
        parseDOM();
        bindLitener();
        initPlugsin();

    };

    init();

}

module.exports = uploadImg;
