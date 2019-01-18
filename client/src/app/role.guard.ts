import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Injectable()
export class RoleGuard implements CanActivate {

  constructor(
    private _auth: AuthService,
    private _myRoute: Router,
    private Toast: ToastModule,
    private messageService: MessageService
  ) { }



  data: String;

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    // console.log(next.data.role,"ppppppp");

    this.data = next.data.role;

    if (this._auth.checkRole(this.data)) {
      return true;
    } else {

      this.messageService.add(
        { severity: 'error', detail: 'Access Forbidden', summary: 'Sorry ! You are not allowed to access the requested Page.' });

      this._myRoute.navigate([`/${this._auth.isRole()}login`]);

      return false;
    }

  }
}
