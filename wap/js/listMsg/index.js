
var ListMsg = function(node){
  //历史记录加载
  var historyListMsg = function(){

  };
  var onCoreLoad = function(data){
    console.log(data);
    alert();
  };
  var init = function(){
    $(document.body).on('core.onload',onCoreLoad);
  };
  init();
  //主题色加载

  //下拉刷新

  //。。。

};
module.exports = ListMsg;
