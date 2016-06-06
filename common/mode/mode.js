/**
 * @author Treagzhao
 */
function ModeEntranceFactroy(global) {
    var ROBOT_FIRST = 3,
        HUMAN_FIRST = 4,
        ROBOT_ONLY = 1,
        HUMAN_ONLY = 2;
    var type;
    var robotFirst = require('./robotfirst.js');
    var manager = null;
    switch(global.apiConfig.type) {
        case 3:
            manager = robotFirst;
            break;
    }
    return manager;
};

module.exports = ModeEntranceFactroy;
