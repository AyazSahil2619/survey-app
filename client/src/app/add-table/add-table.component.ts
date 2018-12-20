import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { UserServiceService } from '../user-service.service';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-add-table',
  templateUrl: './add-table.component.html',
  styleUrls: ['./add-table.component.css']
})
export class AddTableComponent implements OnInit {

  public onClose: Subject<boolean>;


  constructor(private Toast: ToastModule,
    private messageService: MessageService,
    private _router: Router,
    private _auth: AuthService,
    private _userService: UserServiceService,
    private modalService: BsModalService) { }

  TableInfo: any = {};
  ColInfo: any = [];
  columns: any = [];
  count: any = 0;

  modalRef: BsModalRef;

  dropdownlist = [];
  dropdownValue = [];

  ngOnInit() {
    // this.onClose = new Subject();
  }

  onCancel() {

    this._router.navigate(['/adminlogin']);

  }


  create() {
    let data = {
      tablename: this.TableInfo.tablename
    }

    this.TableInfo.currentUser = this._auth.getToken();

    this._userService.checkTablename(data).subscribe((response) => {
      if (response) {
        console.log(this.TableInfo, "TABLE INFO");
        this._userService.createTable(this.TableInfo).subscribe((response) => {
          console.log(response, "AFTER TABLE CREATION");
          let id = response.id;
          this._router.navigate(['/manage/', +id]);

          this.messageService
            .add({ severity: 'success', detail: 'Succes', summary: 'Table create successfully' });

        }, (error) => {
          console.log(error, "ERROR");
          this.messageService
            .add({ severity: 'error', detail: 'Error', summary: 'Whoops !! Table with this name Exists' });
        })
      }
      else {
        this.messageService
          .add({ severity: 'error', detail: 'Error', summary: 'Whoops !! Table with this name Exists' });
      }
    }, ((errResponse) => {

      if (errResponse.status == 401) {

        this._router.navigate(['/login']);
      }
      console.log(errResponse, "Error while checking tablename");
    }))
  }

  // this.modalRef = this.modalService.show(AddTableComponent);

  // showtable = true;
  // showColoumns = function () {
  //   let data = {
  //     tablename: this.TableInfo.tablename
  //   }
  //   this._userService.checkTablename(data)
  //     .subscribe((response) => {
  //       if (response) {
  //         this.showtable = false;
  //       }
  //       else {
  //         this.onClose.next(false);
  //         this.messageService
  //           .add({ severity: 'error', detail: 'Error', summary: 'Whoops !! Table with this name Exists' });

  //         this.showtable = true;
  //       }
  //     }, ((errResponse) => {
  //       console.log(errResponse, "Error while checking tablename");
  //     }))
  // }

  // addNewColumn() {
  //   var newItemNo = this.columns.length + 1;
  //   this.count = 0;
  //   this.columns.push({
  //     'colId': 'col' + newItemNo
  //   });
  // }

  // removeColumn() {
  //   var newItemNo = this.columns.length - 1;
  //   this.columns.splice(newItemNo, 1);
  // }

  // dropdown(index) {

  //   this.count = this.count + 1;

  //   console.log(this.count, "COUNT");

  //   if (this.dropdownlist[index]) {
  //     this.dropdownlist[index].push({
  //       id: 'dd' + this.count
  //     })
  //   } else {
  //     this.dropdownlist[index] = [{
  //       id: 'dd' + this.count
  //     }]
  //   }
  //   // console.log(this.dropdownlist, "11")
  // }

  // onSubmit() {

  //   console.log(this.columns, "COLUMNS");

  //   for (let i = 0; i < this.columns.length; i++) {
  //     if (this.columns[i].constraints) {
  //       let data = {
  //         name: this.columns[i].colname,
  //         label: this.columns[i].label,
  //         type: this.columns[i].type,
  //         constraint: this.columns[i].constraints
  //       }
  //       this.ColInfo.push(data);
  //     } else {
  //       let data = {
  //         name: this.columns[i].colname,
  //         label: this.columns[i].label,
  //         type: this.columns[i].type
  //       }
  //       this.ColInfo.push(data);
  //     }
  //   }

  //   this.columns.forEach((item) => {

  //     let data = {};

  //     for (var key in item) {
  //       if (key != 'label' && key != 'type' && key != 'constraints' && key != 'colId') {

  //         data[key] = item[key];
  //       }
  //     }
  //     if (Object.keys(data).length > 1)
  //       this.dropdownValue.push(data);

  //   });

  //   console.log(this.dropdownValue, "11");

  //   this.TableInfo.ddlist = this.dropdownValue
  //   this.TableInfo.currentUser = this._auth.getToken();
  //   this.TableInfo.ColInfo = this.ColInfo;

  //   console.log(this.TableInfo, "TABLE INFO");

  //   this._userService.createTable(this.TableInfo)
  //     .subscribe((response) => {

  //       // this._router.navigate(['/adminlogin']);

  //       this.messageService.add(
  //         { severity: 'success', summary: 'Table Created Successfully' });

  //       this.onClose.next(true);

  //     }, (error) => {

  //       if (error.error == '42701') {

  //         // this._router.navigate(['/adminlogin']);
  //         this.ColInfo = [];
  //         this.dropdownValue = [];
  //         this.messageService.add({ key: 'table', severity: 'error', detail: 'Error', summary: 'Each Field Name must be unique' });

  //         this.onClose.next(false);

  //         console.log('Sorry ! Table not created .. Each COLUMN NAME must be unique');

  //       } else {

  //         this.onClose.next(false);

  //         // this._router.navigate(['/adminlogin']);
  //         this.messageService.add({ severity: 'error', summary: 'Sorry ! Something went wrong' });

  //         console.log(error, "ERROR WHILE CREATING TABLE");

  //       }
  //     })

  // }





}



































// TableInfo: any = {};
// ColInfo: any = [];
// columns: any = [];
// count: any = 0;

// modalRef: BsModalRef;

// dropdownlist = [];
// dropdownValue = [];

// ngOnInit() {
//   this.onClose = new Subject();
// }

// // this.modalRef = this.modalService.show(AddTableComponent);

// showtable = true;
// showColoumns = function () {
//   let data = {
//     tablename: this.TableInfo.tablename
//   }
//   this._userService.checkTablename(data)
//     .subscribe((response) => {
//       if (response) {
//         this.showtable = false;
//       }
//       else {
//         this.onClose.next(false);
//         this.messageService
//           .add({ severity: 'error', detail: 'Error', summary: 'Whoops !! Table with this name Exists' });

//         this.showtable = true;
//       }
//     }, ((errResponse) => {
//       console.log(errResponse, "Error while checking tablename");
//     }))
// }

// addNewColumn() {
//   var newItemNo = this.columns.length + 1;
//   this.count = 0;
//   this.columns.push({
//     'colId': 'col' + newItemNo
//   });
// }

// removeColumn() {
//   var newItemNo = this.columns.length - 1;
//   this.columns.splice(newItemNo, 1);
// }

// dropdown(index) {

//   this.count = this.count + 1;

//   console.log(this.count, "COUNT");

//   if (this.dropdownlist[index]) {
//     this.dropdownlist[index].push({
//       id: 'dd' + this.count
//     })
//   } else {
//     this.dropdownlist[index] = [{
//       id: 'dd' + this.count
//     }]
//   }
//   // console.log(this.dropdownlist, "11")
// }

// onSubmit() {

//   console.log(this.columns, "COLUMNS");

//   for (let i = 0; i < this.columns.length; i++) {
//     if (this.columns[i].constraints) {
//       let data = {
//         name: this.columns[i].colname,
//         label: this.columns[i].label,
//         type: this.columns[i].type,
//         constraint: this.columns[i].constraints
//       }
//       this.ColInfo.push(data);
//     } else {
//       let data = {
//         name: this.columns[i].colname,
//         label: this.columns[i].label,
//         type: this.columns[i].type
//       }
//       this.ColInfo.push(data);
//     }
//   }

//   this.columns.forEach((item) => {

//     let data = {};

//     for (var key in item) {
//       if (key != 'label' && key != 'type' && key != 'constraints' && key != 'colId') {

//         data[key] = item[key];
//       }
//     }
//     if (Object.keys(data).length > 1)
//       this.dropdownValue.push(data);

//   });

//   console.log(this.dropdownValue, "11");

//   this.TableInfo.ddlist = this.dropdownValue
//   this.TableInfo.currentUser = this._auth.getToken();
//   this.TableInfo.ColInfo = this.ColInfo;

//   console.log(this.TableInfo, "TABLE INFO");

//   this._userService.createTable(this.TableInfo)
//     .subscribe((response) => {

//       // this._router.navigate(['/adminlogin']);

//       this.messageService.add(
//         { severity: 'success', summary: 'Table Created Successfully' });

//       this.onClose.next(true);

//     }, (error) => {

//       if (error.error == '42701') {

//         // this._router.navigate(['/adminlogin']);
//         this.ColInfo = [];
//         this.dropdownValue = [];
//         this.messageService.add({ key: 'table', severity: 'error', detail: 'Error', summary: 'Each Field Name must be unique' });

//         this.onClose.next(false);

//         console.log('Sorry ! Table not created .. Each COLUMN NAME must be unique');

//       } else {

//         this.onClose.next(false);

//         // this._router.navigate(['/adminlogin']);
//         this.messageService.add({ severity: 'error', summary: 'Sorry ! Something went wrong' });

//         console.log(error, "ERROR WHILE CREATING TABLE");

//       }
//     })

// }