/**
 * @author Treagzhao
 */
var manager = null;
function ModeEntranceFactroy(global) {
    var ROBOT_FIRST = 3,
        HUMAN_FIRST = 4,
        ROBOT_ONLY = 1,
        HUMAN_ONLY = 2;
    var type;
    var humanFirst = require('./humanfirst.js');
    var robotFirst = require('./robotfirst.js');
    if(!!manager) {
        return manager;
    }
    console.log(global.apiConfig.type)
    switch(global.apiConfig.type) {
        case ROBOT_FIRST:
            manager = new robotFirst(global);
            break;
        case HUMAN_FIRST:
            manager = new humanFirst(global);
            break;
    }
    return manager;
};

module.exports = ModeEntranceFactroy;
