/**
 * @author daijm
 */
var template = {};
var _selfHtml = '<div class="evaluate js-evaluate">'+
						'<div class="close"><span class="close_button">×</span></div>'+
						'<p class="h1">是否解决了您的问题</p>'+
						'<div class="wether">'+
							'<span class="js-isques">是</span>'+
							'<span class="js-noques">否</span>'+
						'</div>'+
						'<p class="h2">是否有以下情况</p>'+
						'<div class="situation">'+
							'<span>答非所问</span>'+
							'<span style="margin-right:0">理解能力差</span>'+
							'<span>一问三不知</span>'+
							'<span style="margin-right:0">不礼貌</span>'+
						'</div>'+
						'<textarea placeholder="欢迎给我们的服务提建议"></textarea>'+
						'<a class="submit" href="#">提交评价</a>'+
					'</div>'
template._selfHtml = _selfHtml;
module.exports = template;
 