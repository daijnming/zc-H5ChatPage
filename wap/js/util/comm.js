/**
 * Created by gouding on 16/4/18.
 */

var Comm = {
  /**
   * 将url里面query字符串转换成对象
   */
   getQueryParam :function() {
      var href = location.href;
      var queryString = href.substring(href.lastIndexOf("?") + 1);
      if(queryString.lastIndexOf("#") >= 0) {
          queryString = queryString.substring(0,queryString.lastIndexOf("#"));
      }
      var list = queryString.split("&");
      var param = {};
      for(var i = 0;i < list.length;i++) {
          var item = list[i];
          var key = item.substring(0,item.indexOf("="));
          var value = item.substring(item.indexOf("=") + 1);
          if(/^-?(\d+)(\.\d+)?$/.test(value)) {
              param[key] = Number(value);
          } else if(value === 'true') {
              param[key] = true;
          } else if(value === 'false') {
              param[key] = false;
          } else {
              param[key] = value;
          }
      }
      return param;
    },
    //传入文本把url筛选出来
    getUrlRegex:function(strMsg){
        strMsg = strMsg.replace(/&amp;/g,'&');
        strMsg = strMsg.replace(/&amp/g,'&');
        var res='';
        var wordArrs = strMsg.split(/\s+/);
        for(var i=0;i<wordArrs.length;i++){
                var tmp = (function(str){
                    var regExp = /((https?|ftp|news):\/\/)?([a-zA-Z]([a-z0-9A-Z\-]*[\.])+([a-zA-Z]{2}|(aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel)(:[0-9]{1,4})?)|(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(:[0-9]{1,4})?)(\/[a-zA-Z0-9_%=#\-\.~]+)*(\/([a-zA-Z0-9%=#_\-\.]*)(\?[a-zA-Z0-9+_/\-\.#%=&]*)?)?(#[a-zA-Z][a-zA-Z0-9_]*)?$/;
                    //若未http开头 需要添加http
                    if(str.match(regExp)){
                        var regExp1 = /((https?):\/\/)?([a-zA-Z]([a-z0-9A-Z\-]*[\.])+([a-zA-Z]{2}|(aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel)(:[0-9]{1,4})?)|(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(:[0-9]{1,4})?)(\/[a-zA-Z0-9_%=#\-\.~]+)*(\/([a-zA-Z0-9%=#_\-\.]*)(\?[a-zA-Z0-9+_/\-\.#%=&]*)?)?(#[a-zA-Z][a-zA-Z0-9_]*)?$/;
                        if(!str.match(regExp1)){
                            str='<a href="http://'+str+'" target="_blank">'+str+'</a>';
                        }else
                            str='<a href="'+str+'" target="_blank">'+str+'</a>';
                    }
                    return str + ' ';

                })(wordArrs[i]);
            res+=tmp;
        }
        return res;
    },
    //跳转
    /*
    arg1:link 需要跳转的链接  test.sobot.com
    arg2:args 需要转递的参数  [{'a':'aa'},{'b':'bb'}]
     */
    linkAction:function(link,args){
        var res= '';
        if(args){
            for(var i=0;i<args.length;i++){
                for(var item in args[i]){
                    if(i===0)
                        res+='?'+item+'='+args[i][item];
                    else
                        res+='&'+item+'='+args[i][item];
                }
            }
        }
        link+=res;
        window.location.href= link;
        //return link;
    }
};

module.exports = Comm;
