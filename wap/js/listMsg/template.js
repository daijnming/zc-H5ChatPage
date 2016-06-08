
var template ={};

var leftMsg =
              '<div class="msgwrap leftMsg">'+
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
              '</div>';


var rightMsg =
                  '<div class="msgwrap rightMsg">'+
                      '<div class="header">'+
                          '<img src="{{=it.userLogo}}" alt="" />'+
                      '</div>'+
                      '<div class="msgOuter js-userMsgOuter">'+
                          '<p>'+
                              '{{=it.userMsg}}'+
                          '</p>'+
                      '</div>'+
                  '</div>'+
              '</div>';

var systemMsg =
                  '<p class="sysMsg">'+
                      '{{=it.sysMsg}}'+
                  '</p>';


var systemData =
                  '<p class="sysData">'+
                      '{{=it.sysData}}'+
                  '</p>';

template.leftMsg = leftMsg;
template.rightMsg = rightMsg;
template.sysMsg = systemMsg;
template.sysData = systemData;

module.exports = template;
