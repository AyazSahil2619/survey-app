import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserServiceService } from '../user-service.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private _userService: UserServiceService,
    private Toast: ToastModule,
    private messageService: MessageService,
    private _router: Router,
    private _authService: AuthService) { }

  loginDetails: FormGroup;

  ngOnInit() {
    this.formInitialization();
  }

  formInitialization() {
    this.loginDetails = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    })
  }

  get username() {
    return this.loginDetails.get('username');
  }
  get password() {
    return this.loginDetails.get('password');
  }

  onSubmit() {
    if (this.loginDetails.value.username == '' && this.loginDetails.value.password == '') {
      this.messageService.add(
        { severity: 'error',detail:'Required Fields', summary: 'USERNAME AND PASSWORD IS REQUIRED' });
    } else {
      this._userService.login(this.loginDetails.value).subscribe((data) => {
        console.log(data, "in login submit")
        if (data.msg === "INVALID") {
          this.messageService.add(
            { severity: 'error', summary: 'INVALID USERNAME OR PASSWORD' });
        } else {
          this._authService.sendToken(data.msg)

          console.log(data.msg, "SUCCESS");
          if (data.msg.role == 'admin') {
            this._router.navigate(['/adminlogin']);
          } else if (data.msg.role == 'user') {
            this._router.navigate(['/userlogin']);
          }
        }
      }, (err) => {
        console.log(err, "login err");
      })
    }

  }

}
