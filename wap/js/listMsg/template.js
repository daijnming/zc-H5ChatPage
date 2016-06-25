/*
* @author denzel
*/
var template ={};

var leftMsg =
              '<div class="msgwrap leftMsg" date="{{=it.date}}">'+
                  '<div class="header">'+
                      '<img src="{{=it.customLogo}}" alt="" />'+
                  '</div>'+
                  '<p class="r-name">'+
                      '{{=it.customName}}'+
                  '</p>'+
                  '<div class="msgOuter">'+
                      '<p>'+
                          '{{=it.customMsg}}'+
                      '</p>'+
                  '</div>'+
                  // '<span class="msgStatus statusLeft"></span>'+
              '</div>';

var listSugguestionsMsg =
              '<div class="msgwrap leftMsg" date="{{=it.date}}">'+
                  '<div class="header">'+
                      '<img src="http://sobot-test.oss-cn-beijing.aliyuncs.com/console/3542411be2184c8cb6b48d66ca1b2730/userandgroup/29dcc1573d524a16b5dfac756e04ba22.JPG" alt="" />'+
                  '</div>'+
                  '<p class="r-name">'+
                      '小丁智能机器人'+
                  '</p>'+
                  '<div class="msgOuter">'+
                      '<p>'+
                          '{{=it.stripe}}'+
                      '</p>'+
                      '<ul class="sugguestions">'+
                      '{{for(var i=0;i<it.list.length;i++){ }}'+
                        '<li>'+
                          '<a href="#0" class="js-answerBtn" style="color:#596273" data-docid="{{=it.list[i]["docId"]}}">{{=i+1}}: {{=it.list[i]["question"]}}</a>'+
                        '</li>'+
                      '{{ } }}'+
                      '</ul>'+
                  '</div>'+
                  // '<span class="msgStatus statusLeft"></span>'+
              '</div>';

var rightMsg =
                  '<div class="msgwrap rightMsg" date="{{=it.date}}">'+
                      '<div class="header">'+
                          '<img src="{{=it.userLogo}}" alt="" />'+
                      '</div>'+
                      '<div class="msgOuter js-userMsgOuter">'+
                          '<p>'+
                            '{{=it.userMsg}}'+
                          '</p>'+
                      '</div>'+
                      '<span id="userMsg{{=it.dateuid}}" class="js-msgStatus msgStatus statusRight {{=it.msgLoading}}"></span>'+
                  '</div>'+
              '</div>';

  var rightImg =
                    '<div class="msgwrap rightMsg" id="{{=it.token}}" date="{{=it.date}}">'+
                        '<div class="header">'+
                            '<img src="{{=it.userLogo}}" alt="" />'+
                        '</div>'+
                        '<div class="msgOuter js-userMsgOuter">'+
                            '<p>'+
                              '<img src="{{=it.uploadImg}}"'+
                            '</p>'+
                            '<div class="shadowLayer js-shadowLayer">'+
                            '</div>'+
                            '<div class="progressLayer">'+
                              '<span id="userMsg{{=it.token}}" class="progress js-progress">{{=it.progress}}</span>'+
                            '</div>'+
                        '</div>'+
                        '<span class="msgStatus statusRight"></span>'+
                    '</div>'+
                '</div>';

var systemMsg =
                  '<p class="sysMsg" id={{=it.sysMsgSign}} date="{{=it.date}}">'+
                  '<span class="sysMsgText"> '+
                      '{{=it.sysMsg}}'+
                  '</span>'+
                  '</p>';


var systemData =
                  '<p class="sysData" date="{{=it.date}}">'+
                      '{{=it.sysData}}'+
                  '</p>';

template.leftMsg = leftMsg;
template.rightMsg = rightMsg;
template.rightImg = rightImg;
template.sysMsg = systemMsg;
template.sysData = systemData;
template.listSugguestionsMsg = listSugguestionsMsg;

module.exports = template;
