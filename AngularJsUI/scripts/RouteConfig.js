/// <reference path="appmodule.js" />

app.config(function ($routeProvider, $locationProvider) {
    $routeProvider.caseInsensitiveMatch = true;
    $routeProvider
        .when("/home", {
            templateUrl: "/features/Home/Home.html",
            controller: "HomeController"
        }).when("/courses", {
            templateUrl: "/features/Education/Course.html",
            controller: "CourseController"
        }).when("/employees", {
            templateUrl: "/features/Employee/Employee.html",
            controller: "EmployeeController"
        }).otherwise({
            redirectTo:"/"
        });
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: true,
        rewriteLinks: true
    });
});