import * as tslib_1 from "tslib";
import { Component } from '@angular/core';
let EmployeeListComponent = class EmployeeListComponent {
    constructor(empService) {
        this.empService = empService;
        this.empList = [];
    }
    ngOnInit() {
        this.empService.getEmployees().subscribe(data => this.empList = data);
    }
};
EmployeeListComponent = tslib_1.__decorate([
    Component({
        selector: 'app-employee-list',
        templateUrl: './employee-list.component.html',
        styleUrls: ['./employee-list.component.sass']
    })
], EmployeeListComponent);
export { EmployeeListComponent };
//# sourceMappingURL=employee-list.component.js.map