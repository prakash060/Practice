/// <reference path="../../scripts/appmodule.js" />

app.controller("CalculatorController", ["calcFactory", function (calcFactory) {
    var self = this;

    self.Msg = 'Basic calculator';

    self.calculateSum = function () {
        //Syncronous way
        //self.total = parseInt(self.num1) + parseInt(self.num2);

        //ASyncronous way
        calcFactory.getSum(self.num1, self.num2, getSumCallback);
    };

    var getSumCallback = function (sum) {
        self.total = sum;
    };
}]);