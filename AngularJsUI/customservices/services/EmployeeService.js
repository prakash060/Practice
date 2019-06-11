/// <reference path="../../scripts/appmodule.js" />

app.service("employeeService", ["$http", function ($http) {
    var getEmployees = function () {
        return $http({
            url: 'http://localhost:50827/api/employee/GetEmployees',
            method: 'GET',
            contentType: 'application/json'
        });
    };
    return {
        getEmployees: getEmployees
    };
}]);