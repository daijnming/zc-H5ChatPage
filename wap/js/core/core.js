var Core = function() {
    var that = {};
    var promise = require('../../../common/initConfig.js')();
    promise.then(function(data) {
        console.log(data);
        $body.trigger("core.onload",[data]);
    });
    that.initConfig = initConfig;
    return that;
};
module.exports = Core;
