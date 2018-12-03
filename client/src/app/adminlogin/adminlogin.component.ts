import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { UserServiceService } from '../user-service.service';
import { Subject } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';

import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-adminlogin',
  templateUrl: './adminlogin.component.html',
  styleUrls: ['./adminlogin.component.css']
})
export class AdminloginComponent implements OnInit {

  @ViewChild(DataTableDirective)

  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {}

  datas = [];
  dtTrigger = new Subject();
  modalRef: BsModalRef;
  tableToDeleted: any;

  constructor(
    private _userService: UserServiceService,
    private Toast: ToastModule,
    private _router: Router,
    private messageService: MessageService,
    private modalService: BsModalService
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
        this._router.navigate(['/login']);
      }
      console.log('Error while fetching datas', err);
    })
  }


  // openModal(template: TemplateRef<any>, rowid) {
  //   this.tableToDeleted = rowid;
  //   this.modalRef = this.modalService.show(template);
  // }


  confirm() {
    this.modalRef.hide();
    this._userService.delete(this.tableToDeleted).subscribe((response) => {

      for (let i = 0; i < this.datas.length; i++) {
        if (this.datas[i].id == this.tableToDeleted) {
          this.datas.splice(i, 1);
        }
      }
      this.dtElement.dtInstance
        .then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
          this.dtTrigger.next();
        });

      this.messageService.add(
        { severity: 'success', summary: 'Deleted Successfully' });

    }, (err) => {
      console.log('Error while deleting', err);
    })
  }
  decline() {
    this.modalRef.hide();
  }


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

  Create() {
    this._router.navigate(['/createTable']);
  }

  viewTableData(tableid) {
    this._router.navigate(['/viewTable/' + tableid]);
  }

  updatetable(tableid) {
    this._router.navigate(['/editTable/' + tableid]);
  }




  deleteTable(template, tableid) {
    this.tableToDeleted = tableid;
    this.openModal(template, tableid);

  }

  openModal(template: TemplateRef<any>, tableid) {
    this.tableToDeleted = tableid;
    this.modalRef = this.modalService.show(ModalComponent);
    this.modalRef.content.onClose
      .subscribe(result => {
        if (result == true) {
          this.confirm();
        } else {
          this.decline();
        }
      });
  }
}