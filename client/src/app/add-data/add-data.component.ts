import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { UserServiceService } from '../user-service.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { RatingModule } from 'primeng/rating';

import { CalendarModule } from 'primeng/calendar';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { Subject } from 'rxjs';


@Component({
  selector: 'app-add-data',
  templateUrl: './add-data.component.html',
  styleUrls: ['./add-data.component.css']
})
export class AddDataComponent implements OnInit {

  public onClose: Subject<boolean>;
  modalRef: BsModalRef;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private _userService: UserServiceService,
    private Toast: ToastModule,
    private messageService: MessageService,
    private modalService: BsModalService) { }

  table_id = this.route.snapshot.params['id'];
  // table_id: Number;
  // table_id = tableid; 
  colinfo1: any = [];
  ddinfo1: Object[] = [];
  radioList: Object[] = [];
  checkboxList: any = [];
  data: any = {};
  // id;
  data1: Object = {};

  test;
  modifiedUser = {
    user: localStorage.getItem("LoggedInUser"),
    time: Date(),
  };

  ngOnInit() {
    this.fieldsData();
    this.ddinfo();
    this.radioInfo();
    this.checkboxInfo();
    // this.onClose = new Subject();

  }

  fieldsData() {
    console.log("ADDING ROW IN TABLE", this.table_id);

    this._userService.getById(this.table_id)
      .subscribe((response) => {
        let colinfo = response;
        console.log(colinfo, "LLLL")
        colinfo.forEach((item, index) => {
          if (item.fieldname != 'uid') {
            this.colinfo1.push({
              fieldname: item.fieldname,
              label: item.label,
              fieldtype: item.fieldtype,
              isRequired: item.required,
              length: item.text_length,
              rating: item.rating
            })
          }
        });

        console.log(this.colinfo1, "INFO");

      },
        function (errResponse) {

          console.error('Error while fetching field data ');
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
          console.error('Error while fetching dropdown data ');
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
          console.error('Error while fetching dropdown data ');
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
          });

          console.log(this.checkboxList, "checkboxList");
          // this.test = new Array(this.checkboxList.length);
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

    console.log("ASDSA");
    console.log(this.data, "data");
    // console.log(Object.keys(this.data).length, "LENGTH")

    if (Object.keys(this.data).length == 0) {
      this.colinfo1.forEach(element => {
        this.data[element.fieldname] = null;
      });
    }

    this._userService.insertData(this.table_id, this.data)
      .subscribe((response) => {
        this._userService.modified(this.table_id, this.modifiedUser)
          .subscribe((response) => {
            console.log("Row added successfully");
            this.router.navigate(['/viewTable/' + this.table_id]);
            this.messageService.add(
              { severity: 'success', detail: 'Success', summary: 'Data Added Successfully' });
            // this.onClose.next(true);
          }, (error) => {
            console.log("Error while modifying", error);
          })
      }, (errResponse) => {
        console.log(errResponse, "Error in adding row in table");
        if (errResponse.error.code == 22001) {
          this.messageService.add(
            { severity: 'error', detail: 'Error', summary: `Value too long for type character varying` });
        } else {
          this.messageService.add(
            { severity: 'error', detail: 'Error', summary: `${errResponse.error.detail}` });
        }// this.onClose.next(false);
      })
  }

}






























// taking another object for checkbox then binding it to data ..


    // let checkBoxArray: any = [];
    // for (let i = 0; i < this.checkboxList.length; i++) {
    //   if (this.data1[i] == true) {
    //     checkBoxArray.push({
    //       value: this.checkboxList[i].dspValue,
    //       colname: this.checkboxList[i].colname
    //     });
    //   }
    // }


    // let array: any = [];
    // if (checkBoxArray.length > 0) {
    //   let temp_colname = checkBoxArray[0].colname;
    //   let count = 0;
    //   let inputCounter = 0;
    //   let firstCounter = 0;
    //   checkBoxArray.forEach((item, index) => {
    //     if (item.colname == temp_colname) {
    //       if (firstCounter == 0) {
    //         array[count] = {};
    //         array[count][temp_colname] = [];
    //         firstCounter++;
    //       }
    //       array[count][temp_colname].push(item.value);
    //       inputCounter++;
    //     } else {
    //       count++;
    //       temp_colname = item.colname;
    //       inputCounter = 0;
    //       array[count] = {};
    //       array[count][temp_colname] = [];
    //       array[count][temp_colname].push(item.value);
    //       inputCounter++;
    //     }
    //   })
    //   console.log(array, "ARRAY");
    // }

    // array.forEach((item) => {
    //   for (var key in item) {
    //     this.data[key] = item[key];
    //   }
    // })

    // this.data.checkboxData = array;
