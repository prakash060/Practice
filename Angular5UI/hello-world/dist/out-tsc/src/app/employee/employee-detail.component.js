import * as tslib_1 from "tslib";
import { Component } from '@angular/core';
let EmployeeDetailComponent = class EmployeeDetailComponent {
    constructor(empService) {
        this.empService = empService;
        this.empList = [];
    }
    ngOnInit() {
        this.empService.getEmployees().subscribe(data => this.empList = data);
    }
};
EmployeeDetailComponent = tslib_1.__decorate([
    Component({
        selector: 'app-employee-detail',
        templateUrl: './employee-detail.component.html',
        styleUrls: ['./employee-detail.component.sass']
    })
], EmployeeDetailComponent);
export { EmployeeDetailComponent };
//# sourceMappingURL=employee-detail.component.js.map