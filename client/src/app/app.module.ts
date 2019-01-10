import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DataTablesModule } from 'angular-datatables';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SidebarModule } from 'primeng/sidebar';

import { AppComponent } from './app.component';
import { RegistrationComponent } from './registration/registration.component';
import { AppRoutingModule } from './/app-routing.module';
import { UserServiceService } from './user-service.service';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './login/login.component';
import { AdminloginComponent } from './adminlogin/adminlogin.component';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { LogoutComponent } from './logout/logout.component';
import { UserloginComponent } from './userlogin/userlogin.component';
import { AddTableComponent } from './add-table/add-table.component';
import { MessageService } from 'primeng/api';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CalendarModule } from 'primeng/calendar';
import { RoleGuard } from './role.guard';
import { ViewTableComponent } from './view-table/view-table.component';
import { AddDataComponent } from './add-data/add-data.component';
import { UpdateDataComponent } from './update-data/update-data.component';
import { TableEditComponent } from './table-edit/table-edit.component';
import { FieldsDataComponent } from './fields-data/fields-data.component';
import { EditTableComponent } from './edit-table/edit-table.component';
import { AboutComponent } from './about/about.component';
import { NavbarComponent } from './navbar/navbar.component';
import { PreventGuardGuard } from './prevent-guard.guard';
import { CommonDataComponent } from './common-data/common-data.component';
import { CommonModalComponent } from './common-modal/common-modal.component';
import { OverviewComponent } from './overview/overview.component';
import { CarouselModule } from 'primeng/carousel';


@NgModule({
  declarations: [
    AppComponent,
    RegistrationComponent,
    LoginComponent,
    AdminloginComponent,
    LogoutComponent,
    UserloginComponent,
    AddTableComponent,
    ViewTableComponent,
    AddDataComponent,
    UpdateDataComponent,
    TableEditComponent,
    FieldsDataComponent,
    EditTableComponent,
    AboutComponent,
    NavbarComponent,
    CommonDataComponent,
    CommonModalComponent,
    OverviewComponent,
  ],
  imports: [
    BrowserModule,
    ModalModule.forRoot(),
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ToastModule,
    BrowserAnimationsModule,
    DataTablesModule,
    CalendarModule,
    CheckboxModule,
    RadioButtonModule,
    SidebarModule,
    SelectButtonModule,
    CarouselModule

  ],
  providers: [
    UserServiceService,
    AuthService,
    AuthGuard,
    RoleGuard,
    PreventGuardGuard,
    MessageService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    CommonModalComponent,
    OverviewComponent
  ]

})
export class AppModule { }
