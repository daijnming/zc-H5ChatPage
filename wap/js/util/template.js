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
					 '</div>';
template.AlertTemplate= AlertTemplate;
template.layer=layer;
module.exports = template;