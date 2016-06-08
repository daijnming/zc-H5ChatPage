/**
 *
 * @author daijm
 */
//function TextArea(node,core,window) {
    /*var global = core.getGlobal();
    //var that = {};
    var loadFile = require('../util/load.js')();
    //表情
    var ZC_Face = require('../util/qqFace.js');
    //上传附件
    var uploadImg = require('./uploadImg.js');
    var inputCache = {};
    //模板引擎
    var template = require('./template.js');*/
    //传给聊天的url
    var parseDOM = function() {
        //$node = $(node);
        //$uploadBtn = $node.find(".js-upload");
        //$textarea=$node.find(".js-textarea")
       
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
                console.log(response);
                //var url = response.url;
                //通过textarea.uploadImgUrl事件将图片地址传到聊天窗体
            },
            fail:function(ret) {
                console.log("上传失败");
            }
            });
    };
    $(".js-upload").bind("change",function(){
            onFormDataUpHandler();
        })
    var bindLitener = function() {
        
      
       /* $(document.body).on('core.onload',function(data){
            console.log(data);
        })*/
        //$(document.body).on("core.onload",onloadHandler);
        //发送按钮
        //$node.find(".js-sendBtn").on("click",onbtnSendHandler);
        //回车发送
        /*
         *
         qq表情
         */
        //$node.find(".js-emotion").on("click",onEmotionClickHandler);
         
         
    };
     
    var initPlugsin = function() {//插件

     

    };
    var init = function() {
        parseDOM();
        bindLitener();
        initPlugsin();

    };

    init();

//}

//module.exports = TextArea;
