import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { UserServiceService } from '../user-service.service';
import { Subject } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DataTableDirective } from 'angular-datatables';

import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AddDataComponent } from '../add-data/add-data.component';
import { UpdateDataComponent } from '../update-data/update-data.component';

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
    private _modalService: BsModalService
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
        console.log("++ response:", response, "++")
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



  rerender() {
    this.dtElement.dtInstance
      .then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger.next();
      });
  }


  addRow() {
    this.router.navigate(['/insertRow/' + this.table_id]);
  }


  updatedata(row_id) {
    this.router.navigate(['/updateData/' + this.table_id + '/' + row_id])
  }



  deletedata(template: TemplateRef<any>, rowid) {
    this.rowToDelete = rowid;
    this.modalRef = this._modalService.show(template);
  }


  confirm() {
    this.modalRef.hide();
    this._userService.deleteRow(this.table_id, this.rowToDelete).subscribe((response) => {

      for (let i = 0; i < this.datas.length; i++) {
        if (this.datas[i].uid == this.rowToDelete) {
          this.datas.splice(i, 1);
        }
      }
      this.rerender();

      this.messageService.add(
        { severity: 'success', summary: 'Deleted Successfully' });

    }, (err) => {
      console.log('Error while deleting', err);
      this.messageService.add(
        { severity: 'error', summary: 'Ooppss ! Something went wrong' });

    })
  }

  decline() {
    this.modalRef.hide();
  }


}




























































// add row on modalpop up

// addRow() {
//   const initialState = {
//     table_id: this.table_id
//   }
//   this.modalRef = this._modalService.show(AddDataComponent, { initialState, class: 'gray modal-lg' });
//   this.modalRef.content.onClose.subscribe((result) => {
//     if (result == true) {
//       this.modalRef.hide();
//       this._userService.tableData(this.table_id)
//         .subscribe((response) => {
//           this.datas = response;
//           this.rerender();

//         }, (err) => {
//           console.log('Error while fetching datas', err);
//         })


//     } else {
//       // this.modalRef.hide();

//     }
//   })
// }




// UPDAT ROW MODAL POP UP

// updatedata(row_id) {
//   const initialState = {
//     table_id: this.table_id,
//     row_id: row_id
//   }
//   this.modalRef = this._modalService.show(UpdateDataComponent, { initialState, class: 'gray modal-lg' });
//   this.modalRef.content.onClose.subscribe((result) => {
//     if (result == true) {
//       this.modalRef.hide();
//       this._userService.tableData(this.table_id)
//         .subscribe((response) => {
//           this.datas = response;
//           this.rerender();

//         }, (err) => {
//           console.log('Error while fetching datas', err);
//         })


//     } else {
//       // this.modalRef.hide();

//     }
//   })

// }








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