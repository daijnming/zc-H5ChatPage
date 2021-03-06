/*
* @author denzel
*/
var template ={};

var leftMsg =
              '<div class="msgwrap leftMsg {{=it.imgStatus}}" date="{{=it.date}}">'+
                  '<div class="header">'+
                      '<img src="{{=it.customLogo}}" alt="" />'+
                  '</div>'+
                  '<p class="r-name">'+
                      '{{=it.customName}}'+
                  '</p>'+
                  '<div class="msgOuter js-msgOuter">'+
                      '<p>'+
                          '{{=it.customMsg}}'+
                      '</p>'+
                  '</div>'+
                  // '<span class="msgStatus statusLeft"></span>'+
              '</div>';

var listSugguestionsMsg =
              '<div class="msgwrap leftMsg" date="{{=it.date}}">'+
                  '<div class="header">'+
                      '<img src="{{=it.customLogo}}" alt="" />'+
                  '</div>'+
                  '<p class="r-name">'+
                      '{{=it.customName}}'+
                  '</p>'+
                  '<div class="msgOuter js-msgOuter">'+
                      '<div style="margin-bottom:10px;">'+
                          '{{=it.answer}}'+
                      '</div>'+
                      '<p>'+
                          '{{=it.stripe}}'+
                      '</p>'+
                      '<ul class="sugguestions">'+
                      '{{for(var i=0;i<it.list.length;i++){ }}'+
                      '{{if(it.isHistory){ }}'+
                          '<li>'+
                            '<a href="#0" class="js-answerBtn" style="color:#596273">{{=i+1}}. {{=it.list[i]}}</a>'+
                          '</li>'+
                        '{{}else{}}'+
                            '<li>'+
                              '<a href="#0" class="js-answerBtn" style="color:#596273" data-docid="{{=it.list[i]["docId"]}}">{{=i+1}}. {{=it.list[i]["question"]}}</a>'+
                            '</li>'+
                          '{{}}}'+
                        '{{ } }}'+
                      '</ul>'+
                  '</div>'+
                  // '<span class="msgStatus statusLeft"></span>'+
              '</div>';

var rightMsg =
                  '<div class="msgwrap rightMsg {{=it.imgStatus}}" date="{{=it.date}}">'+
                      '<div class="header">'+
                          '<img src="{{=it.userLogo}}" alt="" />'+
                      '</div>'+
                      '<div class="msgOuter js-userMsgOuter js-msgOuter">'+
                          '<p>'+
                            '{{=it.userMsg}}'+
                          '</p>'+
                      '</div>'+
                      '<span id="userMsg{{=it.msgId}}" class="msg js-msgStatus msgStatus statusRight {{=it.msgLoading}}"></span>'+
                  '</div>'+
              '</div>';

  var rightImg =
                    '<div class="msgwrap rightMsg rightImg" date="{{=it.date}}">'+
                        '<div class="header">'+
                            '<img src="{{=it.userLogo}}" alt="" />'+
                        '</div>'+
                        '<div id="img{{=it.token}}" class="msgOuter js-userMsgOuter js-msgOuter">'+
                            '<p>'+
                              '<img src="{{=it.uploadImg}}"'+
                            '</p>'+
                            '<div class="shadowLayer js-shadowLayer">'+
                            '</div>'+
                            '<div class="progressLayer js-progressLayer">'+
                              '<span id="progress{{=it.token}}" class="progress js-progress">{{=it.progress}}</span>'+
                            '</div>'+
                        '</div>'+
                        '<span id="userMsg{{=it.token}}" class="img close js-msgStatus msgStatus statusRight {{=it.msgLoading}}"></span>'+
                    '</div>'+
                '</div>';

var systemMsg =
                  '<p class="js-sysMsg sysMsg {{=it.msgType}} {{=it.msgTmp}}" id={{=it.sysMsgSign}} date="{{=it.date}}">'+
                  '<span class="sysMsgText"> '+
                      '{{=it.sysMsg}}'+
                  '</span>'+
                  '</p>';


var systemData =
                  '<p class="sysData" date="{{=it.date}}">'+
                      '{{=it.sysData}}'+
                  '</p>';

var showMsgLayer =
                  '<div class="js-showMsgLayer showMsgLayer">'+
                    '<div class="js-msgLayer msgLayer">'+
                      '<img src="{{=it.msg}}" />'+
                    '</div>'+
                  '</div>';

var zoomImgLayer =
                  '<section class="imgzoom_pack">'+
                		'<div class="imgzoom_x">X</div>'+
                		'<div class="imgzoom_img"><img src="" /></div>'+
                	'</section>';

template.leftMsg = leftMsg;
template.rightMsg = rightMsg;
template.rightImg = rightImg;
template.sysMsg = systemMsg;
template.sysData = systemData;
template.showMsgLayer = showMsgLayer;
template.zoomImgLayer = zoomImgLayer;
template.listSugguestionsMsg = listSugguestionsMsg;

module.exports = template;
