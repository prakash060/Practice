/// <reference path="../../scripts/appmodule.js" />

app.controller("CourseController", ['authenticationService', 'courseService', function (authService, courseService) {
    var self = this;
    self.Msg = "Courses : ";
    
    self.courses = [];

    self.getCourses = function () {
        authenticateUser();
        if (authService.isUserAuthenticated) {
            courseService.getCourses().then(getCoursesSuccessCallback, getCoursesErrorCallback);
        }
    };

    var getCoursesSuccessCallback = function (response) {
        self.courses = response.data;
    };

    var getCoursesErrorCallback = function () {
        alert("Errorr while getting courses");
    };

    var authenticateUser = function () {
        authService.basicAuth("username", "password");
    };
}]);