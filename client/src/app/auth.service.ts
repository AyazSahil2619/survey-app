import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, ActivatedRoute } from '@angular/router';
import { RoleGuard } from './role.guard';

@Injectable()
export class AuthService {

  constructor(private myRoute: Router,
    private route: ActivatedRoute) { }
  sendToken(token: any) {
    localStorage.setItem("LoggedInUser", token.username);
    localStorage.setItem("LoggerRole", token.role);
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
  logout() {
    localStorage.removeItem('LoggedInUser');
    localStorage.removeItem("LoggerRole");
  }
  checkRole(data) {
    return localStorage.getItem('LoggerRole') == data;
  }

}
