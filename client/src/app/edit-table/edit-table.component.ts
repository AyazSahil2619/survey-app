import { Component, OnInit } from '@angular/core';
import { UserServiceService } from '../user-service.service';
import { ActivatedRoute, Router } from '@angular/router';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-edit-table',
  templateUrl: './edit-table.component.html',
  styleUrls: ['./edit-table.component.css']
})
export class EditTableComponent implements OnInit {

  constructor(
    private _userService: UserServiceService,
    private _route: ActivatedRoute,
    private _router: Router,
    private Toast: ToastModule,
    private messageService: MessageService

  ) {
  }

  ngOnInit() {
    this.datainfo();
  }

  tableid = this._route.snapshot.params['tableid'];
  oldtablename;
  TableInfo: Object = {};

  datainfo() {
    this._userService.tableInfo(this.tableid)
      .subscribe((response) => {
        let data = response;

        this.oldtablename = data[0].tablename;
        this.TableInfo = {
          tablename: data[0].tablename,
          description: data[0].Description
        }

        console.log(data, "TABLEINFO")
        console.log(this.oldtablename, "OLDTABLENAME")

      }, ((errResponse) => {
        console.log(errResponse, "Error while Table Info data ");
      }))
  }

  onCancel() {

    this._router.navigate(['/adminlogin']);

  }


  onSubmit() {
    console.log(this.TableInfo, "NEW DATA ");

    let modifiedUser = {
      user: localStorage.getItem("LoggedInUser"),
      time: Date(),
    };

    this._userService.checkTablename(this.TableInfo, this.tableid).subscribe((response) => {
      // this._userService.checkTablenameforUpdate(this.tableid, this.TableInfo).subscribe((response) => {
      if (response) {
        this._userService.editTableInfo(this.tableid, this.TableInfo)
          .subscribe((response) => {
            this._userService.modified(this.tableid, modifiedUser)
              .subscribe((response) => {
                console.log(response, "RESPONSE");
                this._router.navigate(['/adminlogin']);
                console.log("TABLE UPDATED SUCCESSFULLY");
                this.messageService
                  .add({ severity: 'success', detail: 'Succes', summary: 'Table updated successfully' });

              }, (error) => {
                console.log("Error while modifying", error);
              })

          }, (error) => {
            console.log(error, "Error while editing Table Info");
          })
      } else {
        console.log("error");
        this.messageService
          .add({ severity: 'error', detail: 'Error', summary: 'Whoops !! Survey with this name already Exists' });
      }
    })


  }

}
