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