/// <reference path="../../scripts/appmodule.js" />

app.controller('EmployeeController', ['authenticationService', 'employeeService', function (authService, empService) {
    var self = this;
    self.Msg = "Employees : ";
    self.oAuthToken = '';
    self.basicAuth = false;

    self.employees = [];
    self.employees = [
        { 'Id': '1', 'Name': 'Default', 'City': 'Naganur' },
        { 'Id': '2', 'Name': 'Default', 'City': 'Naganur' }
    ];    

    
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