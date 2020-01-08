import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {EmployeeListComponent} from './employee/employee-list.component';
import {EmployeeCreateComponent} from './employee/employee-create.component';
import {ImagegalleryComponent} from './imagegallery/imagegallery.component';
import {HomeComponent} from './home/home.component';
import { EmployeeDetailComponent } from './employee/employee-detail.component';


const routes: Routes = [
  { path: 'list', component: EmployeeListComponent },
  { path: 'create', component: EmployeeCreateComponent },
  { path: 'details', component: EmployeeDetailComponent },
  { path: 'img', component: ImagegalleryComponent },
  { path: 'home', component: HomeComponent },
  { path: 'queue', component: HomeComponent },
  // { path:'', redirectTo:'/home', pathMatch :'full' }
  // { path:'**', redirectTo:'/home', pathMatch :'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
