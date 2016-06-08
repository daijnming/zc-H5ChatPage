/**
 *
 * @author daijm
 */
var loadFile = require('./load.js')();
var weixinJson = require('./face/weixin.json');
var weixinSymbol = require('./face/weixinsymbol.json');
function ZC_Face(node,core,window) {
   var initConfig = function() {//将表情集合预加载
        var reg = require('./face/Reg.js');
        //show
        _this.tip = weixinJson;
        //analysis
        _this.tip2 = weixinSymbol;
        _this.qqfaceReg = reg.qqfaceReg;
        _this.qqfaceReg2 = reg.qqfaceReg2;
        for(var a in _this.tip) {
            var img = new Image();
            img.src = _this.path + _this.tip[a] + '.gif';
        }
       
    };
    var parseDOM = function() {
        $Group = $(".Group");
        $faceGroup = $(".faceGroup");
        $saytext = $(".saytext");
        $path =  
       
    };
    var show = function() {
        var _this = this;
        var faceGroup = _this.faceGroup;
        //集合如果不存在，则创建
        if($('#faceBox').length <= 0) {
            loadFile.load('/wap/views/sendArea/qqFace.html').then(function(value) {
                var qqface_html = doT.template(value)({
                    "tip" : _this.tip,
                    "path" : _this.path
                });
                $(faceGroup).append(qqface_html);
            });
        }
        _this.sendTotextArea(_this.saytext);

    };
    var Hidden = function() {
        var _this = this;
        if($(_this.Group).css("display") == "block") {
            $(_this.Group).css("display","none")
        } else {
            $(_this.Group).css("display","block")
        }
        //当文本框获取焦点的时候隐藏表情集合
        $(_this.saytext).focus(function() {
            $(_this.Group).hide();
        });

    };
    var sendTotextArea = function() {
        var _this = this;
        $(document.body).undelegate();
        $(document.body).delegate(".faceIco",'click', function(e) {
            var elm = e.currentTarget;
            var src = $(elm).attr("data-src");
            var reg = /u([0-9A-Za-z]{5})/;
           
            $(document.body).trigger('textarea.gotoxy',[{
                'answer' : src
            }]);
            $(_this.Group).hide();
            //隐藏表情集合
        });

    };
    var analysis = function(str) {//将文本框内的表情字符转化为表情
        var _this = this;
        //容错处理，防传null
        if(str) {
            var icoAry = str.match(_this.qqfaceReg);
        } else {
            return false;
        }

        //将匹配到的结果放到icoAry这个数组里面，来获取长度
        if(icoAry) {
            for(var i = 0;i < icoAry.length;i++) {

                var ico = _this.qqfaceReg2.exec(str);
                var path = _this.tip2[ico[0]];
                //重新匹配到第一个符合条件的表情字符
                str = str.replace(_this.qqfaceReg2,'<img style="width:24px;height:24px;" src="' + _this.path + path + '.gif" border="0" />');
            }
        }

        
        return str;
    };
    var hasEmotion = function(str) {//将文本框内的表情字符转化为表情
        return this.qqfaceReg.test(str)
    };
    //传给聊天的url
    
    var bindLitener = function() {
         
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

module.exports = ZC_Face;
