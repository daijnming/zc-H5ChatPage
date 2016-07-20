/**
 *
 * @author daijm
 */

function ZC_Face() {
    var listener = require("../../../common/util/listener.js");
    var weixinJson = require('./face/weixin.json');
    var weixinSymbol = require('./face/weixinsymbol.json');
    var weixinSymbolRight = require('./face/weixinsymbolRight.json');
    var reg = require('./face/Reg.js');
    //模板引擎
    var template = require('./template.js');
    //show
    var tip = weixinJson,
    //analysis
    tip2 = weixinSymbol,
    tip2Right = weixinSymbolRight,
    qqfaceReg = reg.qqfaceReg,
    qqfaceReg2 = reg.qqfaceReg2;
    var that = {};
    var parseDOM = function() {
        $faceGroup = $(".js-faceGroup");
    };
    var show = function() {
        //集合如果不存在，则创建
        if($('#faceBox').length <= 0) {
            var flag=0;
            //ios下禁止复制粘贴
            // unselectable="on" style="-moz-user-select:none;-webkit-user-select:none;" onselectstart="return false;"
            var str='<div id="faceBox" class="face" unselectable="on" style="-moz-user-select:none;-webkit-user-select:none;" onselectstart="return false;">';
            for(var a in tip) { 
                flag+=1;
                if(flag==27){
                    var conf=$.extend({
                        'flag':flag,
                        'a':a
                    });
                    str += doT.template(template.faceIcoStr)(conf);
                    //str+='<span class="faceIco js-faceIco faceIco'+flag+'" data-src="'+a+'" /></span><span class="backDelete"></span>'
                }else{
                    var conf=$.extend({
                        'flag':flag,
                        'a':a
                    });
                    str += doT.template(template.faceIcoStr2)(conf);
                   // str+='<span class="faceIco js-faceIco faceIco'+flag+'" data-src="'+a+'" /></span>';
                }
            };
            str+='</div>'
            $faceGroup.append(str);
             //模拟退格键
            $(".backDelete").unbind();
            $(".backDelete").bind("click",function(){
                listener.trigger('sendArea.backDelete');
            });
        }
        sendTotextArea();
    };
    var sendTotextArea = function() {
        $(".js-faceIco").unbind();
        $(".js-faceIco").bind("click", function(e) {
            var elm = e.currentTarget;
            var src = $(elm).attr("data-src");
            var reg = /u([0-9A-Za-z]{5})/;
            listener.trigger('sendArea.gotoxy',[{
                'answer' : src
            }]
            );
            
        });
    };
    //工作台和历史记录发送的消息调用
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
                //console.log(ico[0]);
                var pathname = tip2[ico[0]];
                //重新匹配到第一个符合条件的表情字符
                str = str.replace(qqfaceReg2,'<img class="faceimg" src="/chat/wap/images/static/' + pathname + '.png" border="0" />');
                //str = str.replace(qqfaceReg2,'<span class="msgfaceIco faceIco faceIco'+pathname+'" /></span>');

            }
        }
        //console.log(str);
        //listener.trigger('sendArea.sendfaceStr',str)
        return str;
    };
    //聊天页发送的消息调用
    var analysisRight = function(str) {//将文本框内的表情字符转化为表情
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
                var pathname = tip2Right[ico[0]];
                //重新匹配到第一个符合条件的表情字符
                //str = str.replace(qqfaceReg2,'<img class="faceimg" src="' + path + pathname + '.gif" border="0" />');
                str = str.replace(qqfaceReg2,'<span class="msgfaceIco faceIco faceIco'+pathname+'" /></span>');

            }
        }
        //console.log(str);
        //listener.trigger('sendArea.sendfaceStr',str)
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
    };

    init();
    that.analysis = analysis;
    that.analysisRight = analysisRight;
    return that;
}

module.exports = ZC_Face;
