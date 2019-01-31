import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { UserServiceService } from '../user-service.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { RatingModule } from 'primeng/rating';
import { EditorModule } from 'primeng/editor';
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
  colinfo1: any = [];
  ddinfo1: Object[] = [];
  radioList: Object[] = [];
  checkboxList: any = [];
  data: any = {};
  data1: Object = {};
  selectedFile: File = null;
  // test;

  modifiedUser = {
    user: localStorage.getItem("LoggedInUser"),
    time: Date(),
  };

  ngOnInit() {
    this.fieldsData();
    this.ddinfo();
    this.radioInfo();
    this.checkboxInfo();
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
              m_editor: item.m_editor,
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

  myFiles: any = [];
  current: any;

  selectedfilename: any;
  onFileSelect(event, fieldname) {
    console.log(event.target.files[0].name);
    this.current = fieldname;
    this.data[this.current] = event.target.files[0].name;
    // this.selectedFile = <File>event.target.files[0];
    for (var i = 0; i < event.target.files.length; i++) {
      this.selectedFile = <File>event.target.files[i];
      this.myFiles.push(this.selectedFile);

      // this.myFiles.push(event.target.files[i]);
    }
    console.log(fieldname, this.data, "ON SELRCT CHECKING DATA");
    console.log(this.myFiles, typeof this.myFiles, "THE SELECTED FILEssssss");

  }

  submit() {
    console.log(this.data, "data=============");

    if (Object.keys(this.data).length == 0) {
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


    this._userService.insertData(this.table_id, this.data)
      .subscribe((response) => {
        this._userService.modified(this.table_id, this.modifiedUser)
          .subscribe((response) => {
            console.log("Row added successfully");
            this.router.navigate(['/viewTable/' + this.table_id]);
            this.messageService.add(
              { severity: 'success', detail: 'Success', summary: 'Data Added Successfully' });
          }, (error) => {
            console.log("Error while modifying", error);
          })
      }, (errResponse) => {
        console.log(errResponse, "Error in adding row in table");
        if (errResponse.error.code == 22001) {
          this.messageService.add(
            { severity: 'error', detail: 'Error', summary: `Value too long for type character varying` });
        } else if (errResponse.error.code == 22003) {
          this.messageService.add(
            { severity: 'error', detail: 'Error', summary: `Numeric value out of range` });
        } else {
          this.messageService.add(
            { severity: 'error', detail: 'Error', summary: `${errResponse.error.detail}` });
        }
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
