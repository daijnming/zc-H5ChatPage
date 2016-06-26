var that = {};

var state;

that.setCurrentState = function(s) {
    state = s;
};

that.getCurrentState = function() {
    return state;
};

module.exports = that;
