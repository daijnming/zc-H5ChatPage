var Core = function() {
    var that = {};
    var promise = require('../../../common/initConfig.js')();
    promise.then(function(data) {
        $(document.body).trigger("core.onload",[{data:data}]);
    });
    return that;
};
module.exports = Core;
