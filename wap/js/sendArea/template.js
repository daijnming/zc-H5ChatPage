/**
 * @author daijm
 */
var template = {};
var sobotEvaluate_selfHtml = '<div class="evaluate js-evaluate">'+
								'<p class="h2">是否有以下情况</p>'+
								'<div class="situation">'+
									'<span class="tag1">答非所问</span>'+
									'<span class="tag2" style="margin-right:0">理解能力差</span>'+
									'<span class="tag3">一问三不知</span>'+
									'<span class="tag4" style="margin-right:0">不礼貌</span>'+
								'</div>'+
								'<textarea id="js-evaluateInner" class="js-evaluateInner" placeholder="欢迎给我们的服务提建议"></textarea>'+
								'<a class="submit js-submit" href="#">提交评价</a>'+
							 '</div>';
var humanOne_selfHtml = '<div class="evaluate js-evaluate">'+
							'<div id="star">'+
								'<ul>'+
									'<li><a href="javascript:;">1</a></li>'+
									'<li><a href="javascript:;">2</a></li>'+
									'<li><a href="javascript:;">3</a></li>'+
									'<li><a href="javascript:;">4</a></li>'+
									'<li><a href="javascript:;">5</a></li>'+
								'</ul>'+
							'</div>'+
						'</div>';
var humanTwo_selfHtml = '<div class="evaluate js-evaluate">'+
							'<div id="star">'+
								'<ul>'+
									'<li><a href="javascript:;">1</a></li>'+
									'<li><a href="javascript:;">2</a></li>'+
									'<li><a href="javascript:;">3</a></li>'+
									'<li><a href="javascript:;">4</a></li>'+
									'<li><a href="javascript:;">5</a></li>'+
								'</ul>'+
							'</div>'+
							'<p class="h2">是否有以下情况</p>'+
							'<div class="situation">'+
								'<span class="tag1">答非所问</span>'+
								'<span class="tag2" style="margin-right:0">理解能力差</span>'+
								'<span class="tag3">一问三不知</span>'+
								'<span class="tag4" style="margin-right:0">不礼貌</span>'+
							'</div>'+
							'<textarea id="js-evaluateInner" class="js-evaluateInner" placeholder="欢迎给我们的服务提建议"></textarea>'+
							'<a class="submit js-submit" href="#">提交评价</a>'+
						'</div>';
var leaveMessageBtn= '<a class="js-leaveMsgBtn" href="'+
					 '{{=it.hostUrl}}'+
					 '"><i class="leaveMessagebg"></i><p>留言</p></a>';
var leaveMessageEndBtn= '<span class="span3"><a class="js-leaveMsgBtn" href="'+
						'{{=it.hostUrl}}'+
						'"><i class="icon"></i><p>留言</p></a></span>';
var evamsgHtml='<div class="js-evamsg evamsg"><p>谢谢您的反馈</p></div>';
var evamsgHtml2='<div class="js-evamsg evamsg" style="color:#cb1f16"><p>提交失败,请重试</p></div>';
var layerOpacity0='<div class="layer-opacity0"></div>';
template.sobotEvaluate_selfHtml = sobotEvaluate_selfHtml;
template.humanOne_selfHtml = humanOne_selfHtml;
template.humanTwo_selfHtml = humanTwo_selfHtml;
template.leaveMessageBtn = leaveMessageBtn;
template.leaveMessageEndBtn = leaveMessageEndBtn;
template.evamsgHtml = evamsgHtml;
template.evamsgHtml2 = evamsgHtml2;
template.layerOpacity0 = layerOpacity0;
module.exports = template;
 