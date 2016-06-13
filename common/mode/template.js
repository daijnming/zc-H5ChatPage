/**
 * @author Treagzhao
 */
var that = {};
var groupTemplate = '<div class="shadow-layer">'+
    '<div class="group-outer">'+
        '<div class="group-title">'+
            '选择咨询内容'+
        '</div>'+
        '<div class="group-main">'+
            '<ul class="clearfix">'+
                '{{  for(var i=0;i<it.list.length;i++){ }}'+
                    '{{ var item = it.list[i];}}'+
                    '<li class="js-item" data-id="{{=item.groupId}}">'+
                        '{{=item.recGroupName}}'+
                    '</li>'+
                '{{  } }}'+
            '</ul>'+
        '</div>'+
        '<div class="group-footer js-cancel-btn">'+
            '取消'+
        '</div>'+
    '</div>'+
'</div>'+
'';
that.groupTemplate =groupTemplate;
module.exports = that;
