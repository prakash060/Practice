/// <reference path="../../scripts/appmodule.js" />

app.controller("CourseController", function ($http) {
    var self = this;
    self.Msg = "Courses : ";
    //$http({
    //    method: 'GET',
    //    url: 'MainService.asmx/GetCourses'
    //}).then(function (response) {
    //    self.courses = response.data;
    //}, function (error) {
    //    alert(error);
    //});

    self.courses = [
        { 'CourseName': 'C#' },
        { 'CourseName': 'Angular' },
        { 'CourseName': '.net' }
    ];
});