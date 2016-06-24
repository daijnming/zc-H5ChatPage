/**
 * @author daijm
 */

function Alert(spec) {
    var Dialog = require('./dialog');
    var _self = this;
    var conf = $.extend({
        'text' : 'TEXT',
        'info' : '',
        "OK" : function(dialog) {
        }
    },spec);
    Dialog.call(this,conf);
    var initAlert = function() {
        var template = require('./template.js');
        var _html = doT.template(template.AlertTemplate)(conf);
        _self.setInner(_html);
    };

    initAlert();
};

module.exports = Alert;
