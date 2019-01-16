import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, ActivatedRoute } from '@angular/router';
import { RoleGuard } from './role.guard';
import { UserServiceService } from './user-service.service';

@Injectable()
export class AuthService {

  constructor(private myRoute: Router,
    private route: ActivatedRoute,
    private _userService: UserServiceService) { }

  sendToken(token: any) {
    localStorage.setItem("LoggedInUser", token.username);
    localStorage.setItem("LoggerRole", token.role);
    localStorage.setItem("LoggerEmailId", token.email);

  }
  getToken() {
    return localStorage.getItem("LoggedInUser")

  }
  isRole() {
    return localStorage.getItem("LoggerRole");
  }
  isLoggednIn() {
    return this.getToken() !== null;
  }
  isEmail() {
    return localStorage.getItem("LoggerEmailId");
  }
  logout() {
    localStorage.removeItem('LoggedInUser');
    localStorage.removeItem("LoggerRole");
    localStorage.removeItem("LoggerEmailId");

  }
  checkRole(data) {
    return localStorage.getItem('LoggerRole') == data;
  }

}
