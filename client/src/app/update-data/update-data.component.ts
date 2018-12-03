import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UserServiceService } from '../user-service.service';

@Component({
  selector: 'app-update-data',
  templateUrl: './update-data.component.html',
  styleUrls: ['./update-data.component.css']
})
export class UpdateDataComponent implements OnInit {

  constructor(private _route: ActivatedRoute,
    private _router: Router,
    private Toast: ToastModule,
    private messageService: MessageService,
    private _userService: UserServiceService) { }

  ngOnInit() {
    this.ColumnData();
    this.DataInfo();
    this.ddinfo();
  }

  ddinfo1:any = [];
  colinfo1: Object[] = [];
  data = {};

  tableid = this._route.snapshot.params['tableid'];
  rowid = this._route.snapshot.params['rowid'];

  ColumnData() {
    console.log(this.tableid, "111")
    console.log(this.rowid, "000")

    this._userService.getById(this.tableid)
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
        console.log(this.colinfo1, "colinfo1");
      }, (errResponse) => {
        console.error(errResponse, 'Error while fetching field data ');
      }
      );
  }
  DataInfo() {
    this._userService.dataToEdit(this.tableid, this.rowid)
      .subscribe((response) => {
        this.data = response[0];
        console.log(this.data, "data");
      }, ((errResponse) => {
        console.log(errResponse, "Error while fetching data ");
      }))
  }

  ddinfo() {
    this._userService.fetchddValue(this.tableid)
      .subscribe((response) => {
        if (response) {
          console.log(response,"111111111111111111");
          let ddinfo:any = response;
          console.log(ddinfo,"11212")
          ddinfo.forEach((item, index) => {
            this.ddinfo1.push({
              ddValue: item.options,
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

  modifiedUser = {
    user: localStorage.getItem("LoggedInUser"),
    time: Date(),
  };


  updateData() {
    console.log(this.data, "11");
    this._userService.tableRowEdit(this.tableid, this.data)
      .subscribe((response) => {
        this._userService.modified(this.tableid, this.modifiedUser)
          .subscribe((response) => {
            this.messageService.add(
              { severity: 'success', detail: 'Success', summary: 'Row Updated Successfully !!' });

            this._router.navigate(['/viewTable/' + this.tableid]);
          }, (errResponse) => {
            console.log(errResponse, 'Error while modifying')
          })
      }, (errResponse) => {
        console.log(errResponse)
        this.messageService.add(
          { severity: 'error', detail: 'Success', summary: `${errResponse.error.detail}` });
        console.error(errResponse, 'Error while updating data.');
      });
  }

}
