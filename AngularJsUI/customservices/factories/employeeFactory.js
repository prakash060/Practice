/// <reference path="../../scripts/appmodule.js" />

app.factory("employeeFactory", ["$http", function ($http) {
    var obj = {};
    obj.getEmployees = function () {
        return $http({
            url: 'http://localhost:50827/api/employee/GetEmployees',
            method: 'GET',
            contentType: 'application/json'
        });
    };
    return obj;
}]);