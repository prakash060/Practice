import * as tslib_1 from "tslib";
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EmployeeListComponent } from './employee/employee-list.component';
import { EmployeeCreateComponent } from './employee/employee-create.component';
import { ImagegalleryComponent } from './imagegallery/imagegallery.component';
import { HomeComponent } from './home/home.component';
import { EmployeeDetailComponent } from './employee/employee-detail.component';
const routes = [
    { path: 'list', component: EmployeeListComponent },
    { path: 'create', component: EmployeeCreateComponent },
    { path: 'details', component: EmployeeDetailComponent },
    { path: 'img', component: ImagegalleryComponent },
    { path: 'home', component: HomeComponent },
    { path: 'queue', component: HomeComponent },
];
let AppRoutingModule = class AppRoutingModule {
};
AppRoutingModule = tslib_1.__decorate([
    NgModule({
        imports: [RouterModule.forRoot(routes)],
        exports: [RouterModule]
    })
], AppRoutingModule);
export { AppRoutingModule };
//# sourceMappingURL=app-routing.module.js.map