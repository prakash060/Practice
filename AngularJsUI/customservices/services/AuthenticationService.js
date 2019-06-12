/// <reference path="../../scripts/appmodule.js" />

app.service("authenticationService", ["$http", function ($http) {
    var isAuthenticated = false;

    var basicAuthSuccessCallback = function (response) {  
        if (response.status === 202 && response.statusText === 'Accepted') {           
            isAuthenticated = true;
        }
        else {           
            isAuthenticated = false;
        }
    };

    var oAuthSuccessCallback = function (response) {
        if (response.status === 202 && response.statusText === 'Accepted') {
            isAuthenticated = true;
        }
        else {
            isAuthenticated = false;
        }
    };

    var basicAuthErrorCallback = function () {
        isAuthenticated = false;
    };

    var oAuthErrorCallback = function () {
        isAuthenticated = false;
    };


    var basicAuth = function (userName, password) {
        var basic_auth_token = window.btoa(userName + ":" + password);
        return $http({
            //url: 'http://localhost:56842/api/authentication/BasicAuthentication',
            url: 'http://practice.pk/api/authentication/BasicAuthentication',
            method: 'POST',
            contentType: 'application/json',
            headers: { 'Authorization': 'Basic ' + basic_auth_token }
        }).then(basicAuthSuccessCallback, basicAuthErrorCallback);
    };

    var oAuthGetToken = function (userName, password) {
        var token = 'username = ' + userName + ' & password=' + password + '& grant_type=password';
        $http({
            //url: 'http://localhost:56842/Token',
            url: 'http://practice.pk/Token',
            method: 'POST',
            contentType: 'application/json',
            data: token
        }).then(oAuthSuccessCallback, oAuthErrorCallback);
    };

    var oAuthValidateToken = function (token) {
        $http({
            //url: 'http://localhost:56842/Token',
            url: 'http://practice.pk/Token',
            method: 'POST',
            contentType: 'application/json',
            data: token
        });
    };

    var isUserAuthenticated = function () {
        return isAuthenticated;
    };

    return {
        oAuthGetToken: oAuthGetToken,
        basicAuth: basicAuth,
        oAuthValidateToken: oAuthValidateToken,
        isUserAuthenticated: isUserAuthenticated
    };

}]);