/*
 * @author daijm
 */
var template = {};

var layer = '<div class="layer js-layer"></div>';
var AlertTemplate = '<div class="modeDialog js-modeDialog">'+
						'<div class="close"><span class="close_button">×</span></div>'+
						'<p class="h1">{{=it.title || "提示"}}</p>'+
						'{{ if((it.footer !== false) ) { }}'+
						'<div class="wether">'+
							'<span class="js-isques">'+
							'{{=it.okText || "确定"}}'+
							'</span>'+
							'<span class="js-noques">'+
							'{{=it.cancelText || "取消"}}'+
							'</span>'+
						'</div>'+
						'{{ } }}'+
						'<div class="model-body">'+
            			'</div>'+
					 '</div>';
var faceIcoStr = '<span class="faceIco js-faceIco faceIco'+'{{=it.flag}}'+'" data-src="'+'{{=it.a}}'+'" /></span><span class="backDelete"></span>';
var faceIcoStr2 = '<span class="faceIco js-faceIco faceIco'+'{{=it.flag}}'+'" data-src="'+'{{=it.a}}'+'" /></span>';
template.layer=layer;
template.AlertTemplate= AlertTemplate;
template.faceIcoStr=faceIcoStr;
template.faceIcoStr2=faceIcoStr2;
module.exports = template;