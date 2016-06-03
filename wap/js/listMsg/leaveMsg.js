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
