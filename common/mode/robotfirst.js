/**
 * @author Treagzhao
 */
var RobotFirst = function(global) {
    var listener = require("../util/listener.js");

    var parseDOM = function() {
    };

    var bindListener = function() {
    };

    var initPlugins = function() {
        //首先发送机器人欢迎语
        console.log(global);
        listener.trigger("welcomeword", {
            'word' : ''
        });
    };

    var init = function() {
        parseDOM();
        bindListener();
        initPlugins();
    };

    init();
};

module.exports = RobotFirst;
