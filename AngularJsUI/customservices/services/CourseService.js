/// <reference path="../../scripts/appmodule.js" />

app.service("courseService", ['$http', 'constants', function ($http, constants) {
    var getCourses = function () {
        return $http({
            url: constants.courseServiceUrl + '/GetCourses',
            method: 'GET',
            contentType: 'application/json'
        });
    };
    return {
        getCourses: getCourses
    };
}]);