import { Component, OnInit } from '@angular/core';
import { UserServiceService } from '../user-service.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor(private _userService: UserServiceService,
    private _authService: AuthService,
    private _route: Router,
    private Toast: ToastModule,
    private messageService: MessageService) { }

  ngOnInit() {
    this.logout();
  }

  logout() {
    this._userService.loggedout().subscribe((response) => {

      if (response.value) {
        this._authService.logout();
        console.log("LOGOUT SUCCESSFULLY");
        this._route.navigate(['/login']);

      } else {
        this.messageService.add(
          { severity: 'error', summary: `${response.msg}` });
      }
    }, (err) => {
      console.log(err, "in err");
    })
  }
}
