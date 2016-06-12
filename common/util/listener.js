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
    cache[channel].push(fn);
};

var off = function(channel,fn) {
    if(fn && typeof fn === 'function') {
        var list = cache[channel];
        if(list && list.length) {
            for(var len = list.length,
                i = len - 1;i >= 0;i--) {
                var listener = list[i];
                if(listener == fn) {

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