/// <reference path="../../scripts/appmodule.js" />

app.controller("EmployeeController", function ($http) {
    var self = this;
    self.Msg = "Employees : ";
    //$http({
    //    method: 'GET',
    //    url: 'MainService.asmx/GetEmployees'
    //}).then(function (response) {
    //    self.employees = response.data;
    //});
    self.employees = [
        { 'Id': '1', 'Name': 'Prakash', 'City': 'Naganur' },
        { 'Id': '2', 'Name': 'Shweta', 'City': 'Naganur' }
    ];
});