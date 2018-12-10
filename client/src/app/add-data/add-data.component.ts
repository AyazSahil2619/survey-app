import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { UserServiceService } from '../user-service.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';

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
  colinfo1: Object[] = [];
  ddinfo1: Object[] = [];
  radioList: Object[] = [];
  checkboxList: any = [];
  data: any = {};
  // id;
  data1: Object = {};
  selectedValues: string[] = [];


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
          // console.log(response, "111111111111111111");
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
            // this.data1.push(item.displayvalue);
          });
          console.log(this.checkboxList, "checkboxList");
        } else {
          console.log(response);
        }

        // let array: string[][] = [];
        // if (this.checkboxList.length > 0) {
        //   let temp_colname = this.checkboxList[0].colname;
        //   console.log(temp_colname)
        //   let count = 0;
        //   let inputCounter = 0;
        //   let firstCounter = 0;
        //   this.checkboxList.forEach((item, index) => {
        //     console.log('here');
        //     if (item.colname == temp_colname) {
        //       if (firstCounter == 0) {
        //         array[count] = [];
        //         firstCounter++;
        //       }
        //       array[count][inputCounter] = item.dbValue;
        //       console.log(item.dbValue);
        //       // count++;
        //       inputCounter++;
        //     } else {
        //       count++;
        //       inputCounter = 0;
        //       array[count] = [];
        //       temp_colname = item.colname;
        //       array[count][inputCounter] = item.dbValue;
        //       inputCounter++;
        //     }
        //   })
        //   console.log(array, "ARRAY");
        // }


      },
        function (errResponse) {
          console.error(errResponse, 'Error while fetching checkbox data ');
        }
      );
  }

  submit() {
    console.log(this.data1)


    let checkBoxArray: any = [];
    for (let i = 0; i < this.checkboxList.length; i++) {
      if (this.data1[i] == true) {
        checkBoxArray.push({
          value: this.checkboxList[i].dspValue,
          colname: this.checkboxList[i].colname
        });
      }
    }


    let array: any = [];
    if (checkBoxArray.length > 0) {
      let temp_colname = checkBoxArray[0].colname;
      let count = 0;
      let inputCounter = 0;
      let firstCounter = 0;
      checkBoxArray.forEach((item, index) => {
        if (item.colname == temp_colname) {
          if (firstCounter == 0) {
            array[count] = {};
            array[count][temp_colname] = [];
            firstCounter++;
          }
          array[count][temp_colname].push(item.value);
          inputCounter++;
        } else {
          count++;
          temp_colname = item.colname;
          inputCounter = 0;
          array[count] = {};
          array[count][temp_colname] = [];
          array[count][temp_colname].push(item.value);
          inputCounter++;
        }
      })
      console.log(array, "ARRAY");
    }

    array.forEach((item) => {
      for (var key in item) {
        this.data[key] = item[key];
      }
    })

    console.log(this.data, "FINAL DATA ");

    // console.log(checkBoxArray, "sasa")

    // console.log(this.data, "data");
    // console.log(this.data1, "DATA 1");

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

        this.messageService.add(
          { severity: 'error', detail: 'Error', summary: `${errResponse.error.detail}` });
        this.onClose.next(false);
      })
  }

}
