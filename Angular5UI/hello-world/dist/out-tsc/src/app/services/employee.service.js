import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
let EmployeeService = class EmployeeService {
    constructor(http) {
        this.http = http;
        this.url = '/assets/data/employees.json';
    }
    getEmployees() {
        return this.http.get(this.url);
    }
};
EmployeeService = tslib_1.__decorate([
    Injectable()
], EmployeeService);
export { EmployeeService };
//# sourceMappingURL=employee.service.js.map