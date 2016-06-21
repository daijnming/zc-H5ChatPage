/**
 *
 * @author daijm
 */
function placeholder(ele,str) {//ele为要操作的元素
    var that = {};
   	var $ele=ele,
   		str=str;
    var parseDOM = function() {
        
    };
    var placeholderHanlder=function(){
    	$(".placeholder").text(str)
    };
    var placeholderStatus=function(){
    	var txt=$ele.text();
    	if(txt==""){
    		$(".placeholder").show();
    	}else{
    		$(".placeholder").hide();
    	}
		
    };
    var hideplaceholder=function(){
    	$(".placeholder").hide();
    };
    var bindLitener = function() { 
        $ele.on("focus",hideplaceholder);
        $ele.on("blur",placeholderStatus);
    };
	var initPlugsin = function() {//插件
		placeholderStatus();
    };
    var init = function() {
        parseDOM();
        bindLitener();
        placeholderHanlder();
        
    };
    init();
    initPlugsin();
}

module.exports = placeholder;



/*$.fn.placeholder = function(option, callback) {
    var settings = $.extend({
        word: '',
        color: '#999',
        evtType: 'focus',
        zIndex: 20,
        diffPaddingLeft: 3
    }, option)
 
    function bootstrap($that) {
        // some alias
        var word    = '',
        color   = '#999',
        evtType = 'focus',
        zIndex  = 20,
        diffPaddingLeft = 3
 
        // default css
        var width       = "100%";
        var height      = "100%";
        var fontSize    = $that.css('font-size')
        var fontFamily  = $that.css('font-family')
        var paddingLeft = $that.css('padding-left')
 
        // process
        paddingLeft = parseInt(paddingLeft, 10) + diffPaddingLeft
 
        // redner
        var $placeholder = $('<span class="placeholder">')
        $placeholder.css({
            position: 'absolute',
            zIndex: '20',
            color: color,
            width: (width - paddingLeft) + 'px',
            height: height + 'px',
            fontSize: fontSize,
            paddingLeft: paddingLeft + 'px',
            fontFamily: fontFamily
        }).text(word).hide()
 
        // 位置调整
        move()

        $placeholder.appendTo(document.body)
 
        // 内容为空时才显示，比如刷新页面输入域已经填入了内容时
        var val = $that.val()
        if ( val == '' && $that.is(':visible') ) {
            $placeholder.show()
        }
 
        function hideAndFocus() {
            $placeholder.hide()
            $that[0].focus()
        }
        function move() {
            var top    = "15px"
            var left   = "0"
            $placeholder.css({
                top: top,
                left: left
            })
        }
        function asFocus() {
            $placeholder.click(function() {
                hideAndFocus()
                // 盖住后无法触发input的click事件，需要模拟点击下
                setTimeout(function(){
                    $that.click()
                }, 100)
            })
            // IE有些bug，原本不用加此句
            $that.click(hideAndFocus)
            $that.blur(function() {
                var txt = $that.val()
                if (txt == '') {
                    $placeholder.show()
                }
            })
        }
        function asKeydown() {
            $placeholder.click(function() {
                $that[0].focus()
            })
        }
 
        if (evtType == 'focus') {
            asFocus()
        } else if (evtType == 'keydown') {
            asKeydown()
        }
 
        $that.keyup(function() {
            var txt = $that.val()
            if (txt == '') {
                $placeholder.show()
            } else {
                $placeholder.hide()
            }
        })
   
        // cache
        $that.data('el', $placeholder)
        $that.data('move', move)
 
    }
 
    return this.each(function() {
        var $elem = $(this)
        bootstrap($elem)
        if ($.isFunction(callback)) callback($elem)
    })
}  */