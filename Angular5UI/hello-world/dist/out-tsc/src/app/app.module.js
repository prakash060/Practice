import * as tslib_1 from "tslib";
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { OAuthModule } from 'angular-oauth2-oidc';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { EmployeeListComponent } from './employee/employee-list.component';
import { EmployeeCreateComponent } from './employee/employee-create.component';
import { ImagegalleryComponent } from './imagegallery/imagegallery.component';
import { HomeComponent } from './home/home.component';
import { EmployeeService } from './services/employee.service';
import { EmployeeDetailComponent } from './employee/employee-detail.component';
import { QueueComponent } from './queue/queue/queue.component';
let AppModule = class AppModule {
};
AppModule = tslib_1.__decorate([
    NgModule({
        declarations: [
            AppComponent,
            EmployeeListComponent,
            EmployeeCreateComponent,
            ImagegalleryComponent,
            HomeComponent,
            EmployeeDetailComponent,
            QueueComponent,
        ],
        imports: [
            BrowserModule,
            AppRoutingModule,
            ReactiveFormsModule,
            AngularFontAwesomeModule,
            HttpClientModule,
            OAuthModule.forRoot()
        ],
        providers: [EmployeeService],
        bootstrap: [AppComponent]
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map