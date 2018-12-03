import { Component, OnInit } from '@angular/core';
import { UserServiceService } from '../user-service.service';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';


@Component({
  selector: 'app-userlogin',
  templateUrl: './userlogin.component.html',
  styleUrls: ['./userlogin.component.css']
})
export class UserloginComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
  datas = [];
  dtTrigger = new Subject();


  constructor(
    private _userService: UserServiceService,
    private _router: Router
  ) { }


  ngOnInit() {
    this.datatableIntialization();
  }

  datatableIntialization() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10
    };
    this._userService.fetchMastertableData().subscribe((response) => {
      console.log(response);
      this.datas = response;
      this.dtTrigger.next();
    }, (err) => {
      console.log('Error while fetching datas', err);
    })
  }

  viewTableData(tableid) {
    this._router.navigate(['/viewTable/' + tableid]);
  }

  addRow(tableid) {
    this._router.navigate(['/insertRow/' + tableid]);
  }

}
