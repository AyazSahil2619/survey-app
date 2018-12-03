import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { UserServiceService } from '../user-service.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-add-data',
  templateUrl: './add-data.component.html',
  styleUrls: ['./add-data.component.css']
})
export class AddDataComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private router: Router,
    private _userService: UserServiceService,
    private Toast: ToastModule,
    private messageService: MessageService
  ) { }

  table_id = this.route.snapshot.params['id'];

  colinfo1: Object[] = [];
  ddinfo1: Object[] = [];
  data: Object = {};
  id;

  ngOnInit() {
    this.insert();
    this.ddinfo();
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
        this.id = response[0].tableid;

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

  submit() {
    console.log(this.data, "data");

    this._userService.insertData(this.id, this.data)
      .subscribe((response) => {
        this._userService.modified(this.id, this.modifiedUser)
          .subscribe((response) => {
            console.log("Row added successfully");
            this.router.navigate(['/viewTable/' + this.id]);
            this.messageService.add(
              { severity: 'success', detail: 'Success', summary: 'Row Added Successfully' });

          }, (error) => {
            console.log("Error while modifying", error);
          })
      }, (errResponse) => {
        console.log(errResponse, "Error in adding row in table");
        // if (errResponse.error.code == 42601) {
        //   this.messageService.add(
        //     { severity: 'error', detail: 'Error', summary: 'Quoted Names are not allowed.. Sorry !!' });
        // } else {
        this.messageService.add(
          { severity: 'error', detail: 'Error', summary: `${errResponse.error.detail}` });
        // }
      })
  }

}
