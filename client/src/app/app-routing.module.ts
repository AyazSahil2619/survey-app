import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { RegistrationComponent } from './registration/registration.component';
import { LoginComponent } from './login/login.component';
import { AdminloginComponent } from './adminlogin/adminlogin.component'
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { LogoutComponent } from './logout/logout.component';
import { UserloginComponent } from './userlogin/userlogin.component';
import { AddTableComponent } from './add-table/add-table.component';
import { RoleGuard } from './role.guard';
import { ViewTableComponent } from './view-table/view-table.component';
import { AddDataComponent } from './add-data/add-data.component';
import { UpdateDataComponent } from './update-data/update-data.component';
import { FieldsDataComponent } from './fields-data/fields-data.component';
import { EditTableComponent } from './edit-table/edit-table.component';
import { AboutComponent } from './about/about.component';
import { PreventGuardGuard } from './prevent-guard.guard';
import { CommonDataComponent } from './common-data/common-data.component';
import { OverviewComponent } from './overview/overview.component';

const routes: Routes = [
  { path: 'home', redirectTo: 'adminlogin' },
  { path: 'registration', component: RegistrationComponent, canActivate: [PreventGuardGuard] },
  { path: 'login', component: LoginComponent, canActivate: [PreventGuardGuard] },
  { path: 'adminlogin', component: AdminloginComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'admin' } },
  { path: 'createTable', component: AddTableComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'admin' } },
  { path: 'logout', component: LogoutComponent },
  { path: 'userlogin', component: UserloginComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'user' } },
  { path: 'viewTable/:id', component: ViewTableComponent, canActivate: [AuthGuard] },
  { path: 'insertRow/:id', component: AddDataComponent, canActivate: [AuthGuard] },
  { path: 'updateData/:tableid/:rowid', component: UpdateDataComponent, canActivate: [AuthGuard] },
  { path: 'manage/:tableid', component: FieldsDataComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'admin' } },
  { path: 'editTable/:tableid', component: EditTableComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'admin' } },
  { path: 'about', component: AboutComponent, canActivate: [AuthGuard] },
  { path: 'insert/:tableid/:token', component: CommonDataComponent },
  { path: '**', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule],

})

export class AppRoutingModule { }
