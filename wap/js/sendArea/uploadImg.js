/**
 *
 * @author daijm
 */
function uploadImg() {
    var global;
    var listener = require("../../../common/util/listener.js");
    /*var global = core.getGlobal();
    //模板引擎
    var template = require('./template.js');*/
    //传给聊天的url
    var parseDOM = function() {
    };
  
    var onFormDataUpHandler=function(){
        var oData = new FormData();
        var input = $(".js-upload")[0];
        var files="";
        //获取文件扩展名
        var val = $(".js-upload").val();
        //创建请求头
        for(var i = 0;i < input.files.length;i++) {
            var file = input.files[i];
            files += file;
            oData.append("file",file);
        }
        oData.append("type","msg");
        
        oData.append("countTag",1);
        oData.append("source",0);

        //上传
        onAjaxUploadUpHandler(oData);
        
        //清空文本域
        $(".js-upload").val("");
    }
    var onAjaxUploadUpHandler=function(oData){
            $.ajax({
                url : "/wap/js/sendArea/fileupload.json",
                type : "post",
                data : oData,
                'dataType' : 'json',
                //告诉jQuery不要去处理发送的数据
                processData : false,
                contentType : false,
            success:function(response) {
                var url = response.url;
                console.log(url);
                listener.trigger('sendArea.uploadImgUrl',[{
                    'url' : url
                }]);
                //通过textarea.uploadImgUrl事件将图片地址传到聊天窗体
            },
            fail:function(ret) {
                console.log("上传失败");
            }
            });
    };
    
    var bindLitener = function() {
        $(".js-upload").bind("change",function(){
            onFormDataUpHandler();
        })
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
