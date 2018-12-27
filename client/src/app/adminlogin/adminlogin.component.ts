import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { UserServiceService } from '../user-service.service';
import { Subject } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';

import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AddTableComponent } from '../add-table/add-table.component';

import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { CommonModalComponent } from '../common-modal/common-modal.component';


@Component({
  selector: 'app-adminlogin',
  templateUrl: './adminlogin.component.html',
  styleUrls: ['./adminlogin.component.css']
})
export class AdminloginComponent implements OnInit {

  @ViewChild(DataTableDirective)

  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {}

  // dtOptions: Promise<DataTables.Settings>;

  datas: any = [];
  dtTrigger = new Subject();
  modalRef: BsModalRef;
  tableToDelete: any;
  // visibleSidebar2: any = false;

  // opensidebar() {
  //   this.visibleSidebar2 = true;
  // }

  constructor(
    private _authService: AuthService,
    private _userService: UserServiceService,
    private Toast: ToastModule,
    private _router: Router,
    private messageService: MessageService,
    private modalService: BsModalService,
    private _http: HttpClient
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
      if (err.error.msg == 'INVALID') {
        this._authService.logout();
        this._router.navigate(['/login']);
      }

      console.log('Error while fetching datas', err);
    })
  }

  rerender() {
    this.dtElement.dtInstance
      .then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger.next();
      });
  }

  deleteModal(rowid) {
    this.tableToDelete = rowid;
    const initialState = {
      title: 'Do you want to delete this record ?'
    };
    this.modalRef = this.modalService.show(CommonModalComponent, { initialState });
    this.modalRef.content.onClose.subscribe(result => {
      if (result == true) {
        this.confirm();
      } else {
        this.decline();
      }
    })
  }


  confirm() {
    this.modalRef.hide();
    this._userService.delete(this.tableToDelete).subscribe((response) => {

      for (let i = 0; i < this.datas.length; i++) {
        if (this.datas[i].id == this.tableToDelete) {
          this.datas.splice(i, 1);
        }
      }

      this.rerender();

      this.messageService.add(
        { severity: 'success', summary: 'Deleted Successfully' });

    }, (err) => {
      console.log('Error while deleting', err);
    })
  }


  decline() {
    this.modalRef.hide();
  }


  viewTableData(tableid) {
    this._router.navigate(['/viewTable/' + tableid]);
  }

  manage(tableid) {
    this._router.navigate(['/manage/' + tableid]);
  }


  edit(tableid) {
    this._router.navigate(['/editTable/' + tableid]);
  }


  create() {
    this._router.navigate(['/createTable']);
  }


}











// updatetable(tableid) {
//   this._router.navigate(['/editTable/' + tableid]);
// }

















// createModal() {

//   this.modalRef = this.modalService.show(AddTableComponent,
//     Object.assign({}, { class: 'gray modal-lg' }));

//   this.modalRef.content.onClose.subscribe((result) => {
//     if (result == true) {
//       this.modalRef.hide();
//       this._userService.fetchMastertableData().subscribe((response) => {
//         this.datas = response;
//         this.rerender();
//       }, (error) => {
//         console.log(error, "ERROR WHILE FETCHING IN CREATE MODAL")
//       })

//     } else {

//     }

//   })
// }


  // datatableIntialization() {
    // this._http.get('http://192.1.200.134:8080/getdata', { withCredentials: true })
    //   .toPromise()
    //   .then((response) => {
    //     console.log(response, "111");
    //     this.buildDtOptions(response)
    //     // this.datas = JSON.stringify(response);
    //     // console.log(this.datas,"11")

    //   })
    //   .catch(this.handleError);




    //   this._http.get('http://192.1.200.134:8080/getdata', { withCredentials: true })
  //     .subscribe((response) => {
  //       console.log(response, "111");
  //       this.buildDtOptions(response)
  //       this.dtTrigger.next();
  //     },(err)=>{
  //       console.log(err,"ERROR");
  //     })
  // }


  // private handleError(error: any): Promise<any> {
  //   console.error('An error occurred', error); // for demo purposes only
  //   return Promise.reject(error.message || error);
  // }


  // private buildDtOptions(data: any): void {
  //   this.dtOptions = {

  //     columns: [
  //       {title: 'ID',data: 'data'},
  //       {
  //       title: 'Table Name',
  //       data: 'data'
  //     }, {
  //       title: 'Description',
  //       data: 'data'
  //     }, {
  //       title: 'Modified At',
  //       data: 'data'
  //     }, {
  //       title: 'Modified By',
  //       data: 'data'
  //     }, {
  //       title: 'Created By',
  //       data: 'data'
  //     }]

  //   };
  // }

































  // deleteTable(tableid) {
  //   this._userService.delete(tableid).subscribe((response) => {

  //     for (let i = 0; i < this.datas.length; i++) {
  //       if (this.datas[i].id == tableid) {
  //         this.datas.splice(i, 1);
  //       }
  //     }
  //     this.dtElement.dtInstance
  //       .then((dtInstance: DataTables.Api) => {
  //         dtInstance.destroy();
  //         this.dtTrigger.next();
  //       });

  //     this.messageService.add(
  //       { severity: 'success', summary: 'Deleted Successfully' });

  //   }, (err) => {
  //     console.log('Error while deleting', err);
  //   })
  // }