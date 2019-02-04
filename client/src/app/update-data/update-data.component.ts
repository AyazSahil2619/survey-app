import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UserServiceService } from '../user-service.service';

import { CalendarModule } from 'primeng/calendar';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { Subject } from 'rxjs';
import * as moment from 'moment';


@Component({
  selector: 'app-update-data',
  templateUrl: './update-data.component.html',
  styleUrls: ['./update-data.component.css']
})
export class UpdateDataComponent implements OnInit {

  public onClose: Subject<boolean>;
  modalRef: BsModalRef;

  constructor(private _route: ActivatedRoute,
    private _router: Router,
    private Toast: ToastModule,
    private messageService: MessageService,
    private _userService: UserServiceService,
    private modalService: BsModalService
  ) {

  }

  ngOnInit() {
    this.ColumnData();
    this.DataInfo();
    this.ddinfo();
    this.radioInfo();
    this.checkboxInfo();

  }

  isLoaded: boolean = false;
  ddinfo1: any = [];
  colinfo1: any = [];
  radioList: Object[] = [];
  data: any;
  data1: Object = {};

  checkboxList: any = [];

  table_id = this._route.snapshot.params['tableid'];
  row_id = this._route.snapshot.params['rowid'];

  // table_id: Number;
  // row_id: Number;

  ColumnData() {
    console.log(this.table_id, "111")
    console.log(this.row_id, "000")

    this._userService.getById(this.table_id)
      .subscribe((response) => {
        let colinfo = response;
        colinfo.forEach((item, index) => {
          if (item.fieldname != 'uid') {
            this.colinfo1.push({
              fieldname: item.fieldname,
              label: item.label,
              fieldtype: item.fieldtype,
              isRequired: item.required,
              length: item.text_length,
              rating: item.rating,
              m_editor: item.m_editor
            })
          }
        });
        console.log(this.colinfo1, "colinfo1");
      }, (errResponse) => {
        console.error(errResponse, 'Error while fetching field data ');
      }
      );
  }
  DataInfo() {
    this._userService.dataToEdit(this.table_id, this.row_id)
      .subscribe((response) => {
        console.log(response, "data in response")
        this.data = response[0];

        this.colinfo1.forEach(item => {
          if (item.fieldtype == 'date') {
            let value = this.data[item.fieldname]
            console.log(value, "VALUE");
            if (value != undefined) {
              this.data[item.fieldname] = new Date(value);
            }
          }
        })
        this.isLoaded = true;
        console.log(this.data, "data");

      }, ((errResponse) => {
        console.log(errResponse, "Error while fetching data ");
      }))
  }

  ddinfo() {
    this._userService.fetchddValue(this.table_id)
      .subscribe((response) => {
        if (response) {
          let ddinfo: any = response;
          // console.log(ddinfo, "11212")
          ddinfo.forEach((item, index) => {
            this.ddinfo1.push({
              dbValue: item.databasevalue,
              dspValue: item.displayvalue,
              colname: item.colname
            })
          });
          console.log(this.ddinfo1, "ddinfo1");
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
          let checkboxValue: any = response;
          checkboxValue.forEach((item, index) => {
            this.checkboxList.push({
              dbValue: item.databasevalue,
              dspValue: item.displayvalue,
              colname: item.colname
            })
            // this.data[this.checkboxList[index].colname] = {};
          });
          console.log(this.checkboxList, "checkboxList");
        } else {
          console.log(response);
        }
      },
        function (errResponse) {
          console.error(errResponse, 'Error while fetching checkbox data ');
        }
      );
  }

  modifiedUser = {
    user: localStorage.getItem("LoggedInUser"),
    time: Date(),
  };

  onCancel() {
    this._router.navigate(['/viewTable/' + this.table_id]);
  }



  myFiles: any = [];
  current: any;
  selectedFile: any;

  onFileSelect(event, fieldname) {
    this.current = fieldname;
    for (var i = 0; i < event.target.files.length; i++) {
      if (i == 0) {
        this.data[this.current] = event.target.files[i].name + ',';
      } else {
        this.data[this.current] += event.target.files[i].name + ',';
      }
      this.selectedFile = <File>event.target.files[i];
      this.myFiles.push(this.selectedFile);
    }
    this.data[this.current] = this.data[this.current].replace(/(^[,\s]+)|([,\s]+$)/g, '');


  }

  fileDelete(fileToDelete, fieldname) {
    this.data[fieldname] = '';
    this.myFiles.forEach((element, index) => {

      if (element.name == fileToDelete) {
        this.myFiles.splice(index, 1);
      } else {
        this.data[fieldname] = element.name + ',';
      }
    });
    this.data[fieldname] = this.data[fieldname].replace(/(^[,\s]+)|([,\s]+$)/g, '');

  }


  updateData() {
    console.log(this.data, "11");
    console.log(this.data1, "2211");

    if (Object.keys(this.data).length == 1) {
      this.colinfo1.forEach(element => {
        this.data[element.fieldname] = null;
      });
    }

    if (Object.keys(this.myFiles).length != 0) {
      this._userService.upload(this.myFiles).subscribe((response) => {
        console.log("response after uploads", response);
      }, (err) => {
        console.log(err, "Error while uploading file");
      })
    }

    console.log(this.data, "1122222222");


    // this._userService.upload(this.myFiles).subscribe((response) => {
    //   console.log("response after uploads", response);
    this._userService.tableRowEdit(this.table_id, this.data)
      .subscribe((response) => {
        this._userService.modified(this.table_id, this.modifiedUser)
          .subscribe((response) => {
            this.messageService.add(
              { severity: 'success', detail: 'Success', summary: 'Row Updated Successfully !!' });
            this._router.navigate(['/viewTable/' + this.table_id]);
            // this.onClose.next(true);

          }, (errResponse) => {
            console.log(errResponse, 'Error while modifying')
          })
      }, (errResponse) => {
        console.log(errResponse);

        // this.onClose.next(false);
        if (errResponse.error.code == 22001) {
          this.messageService.add(
            { severity: 'error', detail: 'Error', summary: `Value too long for type character varying` });
        } else if (errResponse.error.code == 22003) {
          this.messageService.add(
            { severity: 'error', detail: 'Error', summary: `Numeric value out of range` });
        } else {
          this.messageService.add(
            { severity: 'error', detail: 'ERROR', summary: `${errResponse.error.detail}` });
          console.error(errResponse, 'Error while updating data.');
        }
      });
    // }, (err) => {
    //   console.log(err, "Error while uploading file");
    // })
  }

}
