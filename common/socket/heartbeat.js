/**
 * @author Treagzhao
 */

function HearBeat(global) {
    var DURATION = 20 * 1000;
    var start = function() {
        $.ajax({
            'url' : '/chat/user/msgt.action',
            'type' : 'post',
            'data' : {
                'uid' : global.apiInit.uid,
                'pid' : global.apiInit.pid
            }
        });
    };
    setInterval(start,DURATION);

}

module.exports = HearBeat;
