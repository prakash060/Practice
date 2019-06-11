/// <reference path="../scripts/appmodule.js" />

app.provider("constants", function () {
    this.setConstants = function () {
        var OAuthenticationBaseUrl = 'http://localhost:56842/Token';
        var BasicAuthenticationBaseUrl = 'http://localhost:56842/api/authentication';
        var EmployeeServiceBaseUrl = 'http://localhost:50827/api/employee';
        var CourseServiceBaseUrl = 'http://localhost:50827/api/course';
    };
});

app.config(["constantsProvider", function (constProvider) {
    constProvider.setConstants();
}]);