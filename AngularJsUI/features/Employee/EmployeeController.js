/// <reference path="../../scripts/appmodule.js" />

app.controller('EmployeeController', ['authenticationService', 'employeeService', function (authService, empService) {
    var self = this;
    self.Msg = "Employees : ";

    self.employees = [];
    
    self.getEmployees = function () {
        authenticateUser();        
        if (authService.isUserAuthenticated) {
            empService.getEmployees().then(getEmployeeSuccessCallback, getEmployeeErrorCallback);
        }
    };

    var getEmployeeSuccessCallback = function (response) {
        self.employees = response.data;
    };

    var getEmployeeErrorCallback = function () {
        alert("Errorr while getting employees");
    };

    var authenticateUser = function () {
        authService.basicAuth("username", "password");
    };
}]);