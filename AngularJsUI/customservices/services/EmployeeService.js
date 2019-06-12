/// <reference path="../../scripts/appmodule.js" />

app.service("employeeService", ['$http', 'constants', function ($http, constants) {
    var getEmployees = function () {
        return $http({
            url: constants.empServiceUrl + '/GetEmployees',
            method: 'GET',
            contentType: 'application/json'
        });
    };
    return {
        getEmployees: getEmployees
    };
}]);