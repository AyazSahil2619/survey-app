import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth.service';

@Injectable()
export class RoleGuard implements CanActivate {

  constructor(
    private _auth: AuthService,
    private _myRoute: Router,
  ) { }

    data:String;

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      // console.log(next.data.role,"ppppppp");

      this.data = next.data.role;
      
    if (this._auth.checkRole(this.data)) {
      return true;
    } else {
      this._myRoute.navigate(['/logout']);
      return false;
    }

  }
}
