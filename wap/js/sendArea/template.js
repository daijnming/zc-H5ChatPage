/**
 * @author daijm
 */
var template = {};
/*var sobot_selfHtml = '<div class="evaluate js-evaluate">'+
						'<div class="close"><span class="close_button">×</span></div>'+
						'<p class="h1">机器人是否解决了您的问题</p>'+
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
					'</div>'*/
	var sobot_selfHtml = '<p class="h2">是否有以下情况</p>'+
						'<div class="situation">'+
							'<span>答非所问</span>'+
							'<span style="margin-right:0">理解能力差</span>'+
							'<span>一问三不知</span>'+
							'<span style="margin-right:0">不礼貌</span>'+
						'</div>'+
						'<textarea placeholder="欢迎给我们的服务提建议"></textarea>'+
						'<a class="submit" href="#">提交评价</a>'
					
var humanOne_selfHtml = '<div class="evaluate js-evaluate">'+
							'<div class="close"><span class="close_button">×</span></div>'+
							'<p class="h1">客服评价</p>'+
							'<div id="star">'+
								'<ul>'+
									'<li><a href="javascript:;">1</a></li>'+
									'<li><a href="javascript:;">2</a></li>'+
									'<li><a href="javascript:;">3</a></li>'+
									'<li><a href="javascript:;">4</a></li>'+
									'<li><a href="javascript:;">5</a></li>'+
								'</ul>'+
							'</div>'+
						'</div>'
template.sobot_selfHtml = sobot_selfHtml;
template.humanOne_selfHtml = humanOne_selfHtml;
module.exports = template;
 