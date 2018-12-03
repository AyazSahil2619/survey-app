import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserServiceService } from '../user-service.service';
import { ToastModule } from 'primeng/toast';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  constructor(private _userService: UserServiceService,
    private Toast:ToastModule,
    private messageService: MessageService) { }

  registrationDetails: FormGroup;
  
  ngOnInit() {
    this.formInitialization();
  }

  formInitialization() {
    this.registrationDetails = new FormGroup({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(5)]),
      role: new FormControl('', [Validators.required])
    })
  }


   
  onSubmit() {
    this._userService.registration(this.registrationDetails.value).subscribe((data) => {
      this.messageService.add(
        {severity:'success', summary:'Registered Successfully'}
      );
  
      // console.log("REGISTERED SUCCESSFULLY");
    }, (err) => {
      // console.log(err.error.detail,"Error while registering")
      
      this.messageService.add(
        {severity:'error', summary:`${err.error.detail}`}
      );
    })
  }



  get name() {
    return this.registrationDetails.get('name');
  }
  get email() {
    return this.registrationDetails.get('email');
  } 
  get password() {
    return this.registrationDetails.get('password');
  }
  get role() {
    return this.registrationDetails.get('role');
  }
}
