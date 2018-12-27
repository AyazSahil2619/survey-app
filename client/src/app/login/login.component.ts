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
    console.log("ON SUBMIT");
    if (this.loginDetails.value.username == '' && this.loginDetails.value.password == '') {
      this.messageService.add(
        { severity: 'error', detail: 'Required Fields', summary: 'USERNAME AND PASSWORD IS REQUIRED' });
    } else {
      this._userService.login(this.loginDetails.value).subscribe((data) => {

        console.log(data, " 1  in login submit");

        if (data.msg == "INVALID") {
          this.messageService.add(
            { severity: 'error', summary: 'INVALID USERNAME OR PASSWORD' });

        } else {
          console.log("LOGING SUCCESS");
          // this._authService.sendToken(data.msg);
          this._authService.sendToken(data)
          console.log(data, "SUCCESS");
          if (data.role == 'admin') {
            this._router.navigate(['/adminlogin']);
          } else if (data.role == 'user') {
            this._router.navigate(['/userlogin']);
          }
        }
      }, (err) => {
          this.messageService.add(
            { severity: 'error', summary: 'Oops ! try again ..' });
        console.log(err, "login err");
      })
    }

  }

}
