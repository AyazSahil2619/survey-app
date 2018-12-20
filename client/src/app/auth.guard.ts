import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';


@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private _router: Router,
    private auth: AuthService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    // console.log(this._router.url,"OOOOO");

    if (this.auth.isLoggednIn()) {
      console.log("LOGIN");
      return true;
    } else {
      console.log(" NOT LOGIN");

      this._router.navigate(['/login']);
      return false;
    }
  }
}
