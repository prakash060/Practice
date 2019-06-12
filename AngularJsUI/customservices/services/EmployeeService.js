/// <reference path="../../scripts/appmodule.js" />

app.service("employeeService", ["$http", function ($http) {
    var getEmployees = function () {
        return $http({
            url: 'http://practice.pk/api/employee/GetEmployees',
            method: 'GET',
            contentType: 'application/json'
        });
    };
    return {
        getEmployees: getEmployees
    };
}]);