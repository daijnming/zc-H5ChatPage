
var History = function(data){
  console.log(data);
  var api={
    url_detail:'/chat/user/chatdetail.action'
  };
  var _template = require('./template.js');
  for(var i = 0 ; i < data.left.length ;i++)
  {
  	var comf = $.extend({
  		'num':(i+1),
  		'question':(i+1)+'.'+data.left[i].question
  	});
  	var _html = doT.template(_template.sugguestionsItem)(comf);
  	$(sugguestions).find('ul').append(_html);
  }

};
module.exports = History;
