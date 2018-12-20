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
  table_id = this.route.snapshot.params['id'];
  colinfo1: Object[] = [];
  ddinfo1: Object[] = [];
  radioList: Object[] = [];
  checkboxList: any = [];
  data: any = {};
  data1: Object = {};
  selectedValues: string[] = [];

  test;
  modifiedUser = {
    user: localStorage.getItem("LoggedInUser"),
    time: Date(),
  };

  ngOnInit() {
    this.insert();
    this.ddinfo();
    this.radioInfo();
    this.checkboxInfo();
    // this.onClose = new Subject();

  }

  insert() {
    console.log("ADDING ROW IN TABLE", this.table_id);

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
        // for display table id in frontend
        // this.id = response[0].tableid;

      },
        function (errResponse) {

          console.error(errResponse,'Error while fetching field data ');
        }
      );
  }

  ddinfo() {
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
          console.error(errResponse,'Error while fetching dropdown data ');
        }
      );
  }

  radioInfo() {
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
          console.error(errResponse,'Error while fetching dropdown data ');
        }
      );
  }

  checkboxInfo() {
    this._userService.fetchcheckboxValue(this.table_id)
      .subscribe((response) => {
        if (response) {
          // console.log(response, "111111111111111111");
          let checkboxValue: any = response;
          checkboxValue.forEach((item, index) => {
            this.checkboxList.push({
              dbValue: item.databasevalue,
              dspValue: item.displayvalue,
              colname: item.colname
            })
            this.data[this.checkboxList[index].colname] = {};
            // this.data1.push(item.displayvalue);
          });

          console.log(this.data);
          console.log(this.checkboxList, "checkboxList");
          this.test = new Array(this.checkboxList.length);
        } else {
          console.log(response);
        }
      },
        function (errResponse) {
          console.error(errResponse, 'Error while fetching checkbox data ');
        }
      );
  }

  onCancel() {
    this.router.navigate(['/viewTable/' + this.table_id]);
  }


  submit() {
    console.log(this.data, "data");

    this._userService.insertData(this.table_id, this.data)
      .subscribe((response) => {
        console.log("Row added successfully");
        this.router.navigate(['/viewTable/' + this.table_id]);
        this.messageService.add(
          { severity: 'success', detail: 'Success', summary: 'Data Added Successfully' });
      }, (errResponse) => {
        console.log(errResponse, "Error in adding row in table");

        this.messageService.add(
          { severity: 'error', detail: 'Error', summary: `${errResponse.error.detail}` });
      })
  }

}
