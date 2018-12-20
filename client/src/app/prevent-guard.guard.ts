import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth.service';

@Injectable()
export class PreventGuardGuard implements CanActivate {

  constructor(private _router: Router,
    private auth: AuthService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    console.log(this.auth.isLoggednIn(), "CHECK")

    if (!this.auth.isLoggednIn()) {
      return true;
    } else {
      let role: any = this.auth.isRole();
      console.log(role,"ROLE");
      if (role == 'admin') {
        this._router.navigate(['/adminlogin']);
        return true;
      } else {
        this._router.navigate(['/userlogin']);
        return true;
      }

    }
  }


}
