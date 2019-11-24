import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {EmployeeListComponent} from './employee/employee-list.component';
import {EmployeeCreateComponent} from './employee/employee-create.component'
import {ImagegalleryComponent} from './imagegallery/imagegallery.component'


const routes: Routes = [
  { path:'list', component:EmployeeListComponent },
  { path:'create', component:EmployeeCreateComponent },
  { path:'img', component:ImagegalleryComponent },
  { path:'', redirectTo:'/list', pathMatch :'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }