import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { UserServiceService } from '../user-service.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'app-common-data',
  templateUrl: './common-data.component.html',
  styleUrls: ['./common-data.component.css']
})
export class CommonDataComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private router: Router,
    private _userService: UserServiceService,
    private Toast: ToastModule,
    private messageService: MessageService,
    private modalService: BsModalService) { }

  table_id: any = this.route.snapshot.params['tableid'];
  token: any = this.route.snapshot.params['token'];

  colinfo1: Object[] = [];
  ddinfo1: Object[] = [];
  radioList: Object[] = [];
  checkboxList: any = [];
  data: any = {};
  data1: Object = {};
  show: boolean = true;
  status: string;
  Submitshow: boolean = false;

  ngOnInit() {

    this.check();

  }

  check() {

    this._userService.checkToken(this.table_id, this.token)
      .subscribe((response) => {

        if (response) {
          this._userService.getById(this.table_id)
            .subscribe((response) => {
              let colinfo = response;
              colinfo.forEach((item, index) => {
                if (item.fieldname != 'uid') {
                  this.colinfo1.push({
                    fieldname: item.fieldname,
                    label: item.label,
                    fieldtype: item.fieldtype
                  })
                }
              });
            },
              function (errResponse) {

                console.error(errResponse, 'Error while fetching field data ');
              }
            );

          this._userService.fetchddValue(this.table_id)
            .subscribe((response) => {
              if (response) {

                let ddinfo: any = response;
                console.log(ddinfo, "11212")
                ddinfo.forEach((item, index) => {
                  this.ddinfo1.push({
                    dbValue: item.databasevalue,
                    dspValue: item.displayvalue,
                    colname: item.colname
                  })
                });
                // console.log(this.ddinfo1, "ddinfo1");
              } else {
                console.log(response);
              }
            },
              function (errResponse) {
                console.error(errResponse, 'Error while fetching dropdown data ');
              }
            );
          this._userService.fetchradioValue(this.table_id)
            .subscribe((response) => {
              if (response) {
                let radioValue: any = response;
                radioValue.forEach((item, index) => {
                  this.radioList.push({
                    dbValue: item.databasevalue,
                    dspValue: item.displayvalue,
                    colname: item.colname
                  })
                });
                console.log(this.radioList, "radioList");
              } else {
                console.log(response);
              }
            },
              function (errResponse) {
                console.error(errResponse, 'Error while fetching dropdown data ');
              }
            );

          this._userService.fetchcheckboxValue(this.table_id)
            .subscribe((response) => {
              if (response) {
                let checkboxValue: any = response;
                checkboxValue.forEach((item, index) => {
                  this.checkboxList.push({
                    dbValue: item.databasevalue,
                    dspValue: item.displayvalue,
                    colname: item.colname
                  })
                  this.data[this.checkboxList[index].colname] = {};
                });

              } else {
                console.log(response);
              }
            },
              function (errResponse) {
                console.error(errResponse, 'Error while fetching checkbox data ');
              }
            );
        } else {
          this.show = false;
          this.messageService.add(
            { severity: 'error', detail: 'Error', summary: 'Sorry ! You are not allowed to access this page....' });

        }
      }, (error) => {
        console.log(error, "Error while checking Token");
      })
  }


  submit() {
    console.log(this.data, "data");

    this._userService.insertData(this.table_id, this.data)
      .subscribe((response) => {
        console.log("Row added successfully");
        this.Submitshow = true;
        this.status = 'Your data has been saved successfully !!';

      }, (errResponse) => {

        console.log(errResponse, "Error in adding row in table");
        this.status = 'Something went wrong !!'
      })
  }

}
