import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';


@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private myRoute: Router,
    private auth: AuthService) {}
 
    canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.auth.isLoggednIn()) { 
      console.log("LOGIN"); 
      return true;
    } else {
      console.log(" NOT LOGIN"); 

      this.myRoute.navigate(['/login']);
      return false;
    }
  }
}
