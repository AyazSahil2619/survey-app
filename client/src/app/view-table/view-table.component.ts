import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { UserServiceService } from '../user-service.service';
import { Subject } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DataTableDirective } from 'angular-datatables';

import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';

// import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-view-table',
  templateUrl: './view-table.component.html',
  styleUrls: ['./view-table.component.css']
})
export class ViewTableComponent implements OnInit {

  @ViewChild(DataTableDirective)

  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger = new Subject();
  modalRef: BsModalRef;
  rowToDelete: any;

  datas = [];
  colinfo1: Object[] = [];


  constructor(private route: ActivatedRoute,
    private router: Router,
    private _userService: UserServiceService,
    private messageService: MessageService,
    private modalService: BsModalService
  ) { }

  table_id = this.route.snapshot.params['id'];

  ngOnInit() {
    this.datatableIntialization();

  }

  datatableIntialization() {

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10
    };

    this._userService.getById(this.table_id)
      .subscribe((response) => {
        var colinfo = response;
        colinfo.forEach((item, index) => {
          if (item.fieldname != 'uid') {
            this.colinfo1.push({
              fieldname: item.fieldname,
              fieldtype: item.fieldtype
            })
          }
        })
        console.log(this.colinfo1, "aaaa")
      }, (error) => {
        console.log(error, "error while fetching fields data")
      })


    this._userService.tableData(this.table_id)
      .subscribe((response) => {
        console.log(response, "ppppp");
        this.datas = response;
        this.dtTrigger.next();
      }, (err) => {
        console.log('Error while fetching datas', err);
      })
  }

  addRow() {
    this.router.navigate(['/insertRow/' + this.table_id]);
  }

  updatedata(row_id) {
    this.router.navigate(['/updateData/' + this.table_id + '/' + row_id])
    // this.modalRef = this.modalService.show(template);


  }



  deletedata(template: TemplateRef<any>, rowid) {
    this.rowToDelete = rowid;
    this.modalRef = this.modalService.show(template);
  }


  confirm() {
    this.modalRef.hide();
    this._userService.deleteRow(this.table_id, this.rowToDelete).subscribe((response) => {
      // this.datatableIntialization();
      this.messageService.add(
        { severity: 'success', summary: 'Deleted Successfully' });
      for (let i = 0; i < this.datas.length; i++) {
        if (this.datas[i].uid == this.rowToDelete) {
          this.datas.splice(i, 1);
        }
      }
      this.dtElement.dtInstance
        .then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
          this.dtTrigger.next();
        });


    }, (err) => {
      console.log('Error while deleting', err);
    })
  }
  decline() {
    this.modalRef.hide();
  }
}































  // deleteData(row_id) {

  //   this._userService.deleteRow(this.table_id, row_id).subscribe((response) => {
  //     // this.datatableIntialization();
  //     this.messageService.add(
  //       { severity: 'success', summary: 'Deleted Successfully' });
  //     for (let i = 0; i < this.datas.length; i++) {
  //       if (this.datas[i].uid == row_id) {
  //         this.datas.splice(i, 1);
  //       }
  //     }
  //     this.dtElement.dtInstance
  //       .then((dtInstance: DataTables.Api) => {
  //         dtInstance.destroy();
  //         this.dtTrigger.next();
  //       });


  //   }, (err) => {
  //     console.log('Error while deleting', err);
  //   })
  // }