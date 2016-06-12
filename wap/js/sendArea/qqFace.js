/**
 *
 * @author daijm
 */

function ZC_Face(node,core,window) {
    var loadFile = require('../../../common/util/load.js')();
    var listener = require("../../../common/util/listener.js");
    var weixinJson = require('./face/weixin.json');
    var weixinSymbol = require('./face/weixinsymbol.json');
    var reg = require('./face/Reg.js');
    //show
    var tip = weixinJson,
    //analysis
    tip2 = weixinSymbol,
    qqfaceReg = reg.qqfaceReg,
    qqfaceReg2 = reg.qqfaceReg2;
    var path =  "/wap/images/qqarclist/";
    var initConfig = function() {//将表情集合预加载
        for(var a in tip) {
            var img = new Image();
            img.src = path + tip[a] + '.gif';
        }
       
    };
    var parseDOM = function() {
        $faceGroup = $(".js-faceGroup");
    };
    var show = function() {
        //集合如果不存在，则创建
        if($('#faceBox').length <= 0) {
            /*loadFile.load('/wap/views/sendArea/qqFace.html').then(function(value) {
                var qqface_html = doT.template(value)({
                    "tip" : tip,
                    "path" : path
                });
                alert(qqface_html);
                $faceGroup.append(qqface_html);
            });*/
            var str='<div id="faceBox" class="face"><ul>';
            for(var a in tip) {  
                str+='<li><img class="faceIco" src="'+path+tip[a]+'.gif" data-src="'+a+'" /></li>';
            };
            str+='</ul></div>'
            $faceGroup.append(str);
        }
        sendTotextArea();
    };
    var sendTotextArea = function() {
        $(document.body).undelegate();
        $(document.body).delegate(".faceIco",'click', function(e) {
            var elm = e.currentTarget;
            var src = $(elm).attr("data-src");
            var reg = /u([0-9A-Za-z]{5})/;
            console.log(src);
            listener.trigger('textarea.gotoxy',[{
                'answer' : src,
                'abc':"123"
            }]
            );
            
        });
    };
    var analysis = function(str) {//将文本框内的表情字符转化为表情
        //容错处理，防传null
        if(str) {
            var icoAry = str.match(qqfaceReg);
        } else {
            return false;
        }

        //将匹配到的结果放到icoAry这个数组里面，来获取长度
        if(icoAry) {
            for(var i = 0;i < icoAry.length;i++) {

                var ico = qqfaceReg2.exec(str);
                var pathname = tip2[ico[0]];
                //重新匹配到第一个符合条件的表情字符
                str = str.replace(qqfaceReg2,'<img style="width:24px;height:24px;" src="' + path + pathname + '.gif" border="0" />');
            }
        }
        return str;
    };
    var hasEmotion = function(str) {//将文本框内的表情字符转化为表情
        return this.qqfaceReg.test(str)
    };
    //传给聊天的url
    
    var bindLitener = function() {
         listener.on("sendArea.faceShow",show);
    };
     
    var initPlugsin = function() {//插件

    };
    var init = function() {
        parseDOM();
        bindLitener();
        initPlugsin();
        initConfig();
    };

    init();

}

module.exports = ZC_Face;
