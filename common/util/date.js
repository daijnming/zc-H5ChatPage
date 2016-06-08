/**
 * @author Treagzhao
 */
var dateUtil = {};

var formatNum = function(num) {
    return (num >= 10) ? num + "" : "0" + num;
};

var formatTime = function(date) {
    var f = formatNum;
    var hour = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var arr = [f(hour),f(minutes),f(seconds)];
    return arr.join(":");
};

var formatDate = function(date,showTime) {
    var f = formatNum;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var arr = [f(year),f(month),f(day)];
    var hour = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var arr2 = [f(hour),f(minutes),f(seconds)];
    return arr.join("-") + ( showTime ? "" : " " + formatTime(date));
};
dateUtil.formatTime = formatTime;
dateUtil.formatDate = formatDate;
module.exports = dateUtil;
