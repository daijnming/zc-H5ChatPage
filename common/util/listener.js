/**
 * @author Treagzhao
 */
var that = {};
var cache = {};
var trigger = function(channel,data) {
    if(cache[channel]) {
        for(var i = 0,
            len = cache[channel].length;i < len;i++) {
            var listener = cache[channel][i];
            listener(data);
        }
    }
};

var on = function(channel,fn) {
    if(!cache[channel]) {
        cache[channel] = [];
    }
    var exists = false;
    var list = cache[channel];
    for(var i = 0,
        len = list.length;i < len;i++) {
        if(list[i] == fn) {
            exists = true;
            break;
        }
    }
    if(!exists) {
        cache[channel].push(fn);
    }
};

var off = function(channel,fn) {
    if(fn && typeof fn === 'function') {
        var list = cache[channel];
        if(list && list.length) {
            for(var len = list.length,
                i = len - 1;i >= 0;i--) {
                var listener = list[i];
                if(listener == fn) {
                    list.splice(i,1);
                    break;
                }
            }
        }
    } else {
        delete cache[channel];
    }
};

that.on = on;
that.off = off;
that.trigger = trigger;

module.exports = that;
