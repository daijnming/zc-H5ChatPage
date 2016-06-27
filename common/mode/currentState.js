var that = {};

var state;
var listener = require('../util/listener.js');
that.setCurrentState = function(s) {
    state = s;
    listener.trigger("core.statechange",state);
};

that.getCurrentState = function() {
    return state;
};

module.exports = that;
