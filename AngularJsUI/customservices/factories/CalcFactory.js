/// <reference path="../../scripts/appmodule.js" />


app.factory("calcFactory", [function () {   
    var obj = {};
    //Syncronous way

    //obj.getSum = function (a, b) {
    //    return parseInt(a) + parseInt(b);
    //};

    //ASyncronous way
    obj.getSum = function (a, b, callback) {
        var sum = parseInt(a) + parseInt(b);
        callback(sum);
    };
    return obj;   
}]);