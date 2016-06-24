/*
 * @author daijm
 */
var template = {};

var layer = '<div class="layer js-layer"></div>';
var AlertTemplate = '<div class="modeDialog js-modeDialog">'+
						'<div class="close"><span class="close_button">×</span></div>'+
						'<p class="h1">是否解决了您的问题</p>'+
						'<div class="wether">'+
							'<span class="js-isques">是</span>'+
							'<span class="js-noques">否</span>'+
						'</div>'+
					 '</div>';
template.AlertTemplate= AlertTemplate;
template.layer=layer;
module.exports = template;