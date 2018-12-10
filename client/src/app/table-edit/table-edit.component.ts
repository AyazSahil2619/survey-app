import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserServiceService } from '../user-service.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-table-edit',
  templateUrl: './table-edit.component.html',
  styleUrls: ['./table-edit.component.css']
})
export class TableEditComponent implements OnInit {

  constructor(private _router: Router,
    private _route: ActivatedRoute,
    private _userService: UserServiceService,
    private Toast: ToastModule,
    private _messageService: MessageService) { }

  ngOnInit() {
    this.datainfo();
    this.ColumnData();
  }

  tableid = this._route.snapshot.params['tableid'];

  columns: any = [];
  newColumns: any = [];
  colinfo1 = [];
  tableinfo = [];
  deleteColumnArray: any = [];

  oldtablename: String = '';


  data: any = {};

  count: any = 0;
  ddlist: any = [];

  dropdownlist = [];
  dropdownValue = [];


  ColumnData() {
    this._userService.getById(this.tableid)
      .subscribe((response) => {
        let colinfo = response;
        colinfo.forEach((item, index) => {
          if (item.fieldname != 'uid') {
            this.colinfo1.push({
              fieldname: item.fieldname,
              label: item.label,
              fieldtype: item.fieldtype,
              konstraint: item.konstraint
            })
          }
        });
        console.log(this.colinfo1, "colinfo1");
      }, (errResponse) => {
        console.error(errResponse, 'Error while fetching field data ');
      }
      );
  }

  datainfo() {
    this._userService.tableInfo(this.tableid)
      .subscribe((response) => {
        let data = response;

        this.oldtablename = data[0].tablename;

        data.forEach((item, index) => {
          this.tableinfo.push({
            tablename: item.tablename,
            Description: item.Description
          })
        })
        console.log(this.tableinfo, "TABLEINFO")
        console.log(this.oldtablename, "OLDTABLENAME")

      }, ((errResponse) => {
        console.log(errResponse, "Error while Table Info data ");
      }))
  }

  addNewColumn() {
    var newItemNo = this.columns.length + 1;
    this.columns.push({
      'colId': 'col' + newItemNo
    });
  }

  dropdown(index) {

    this.count = this.count + 1;

    console.log(this.count, "COUNT");

    if (this.dropdownlist[index]) {
      this.dropdownlist[index].push({
        id: 'dd' + this.count
      })
    } else {
      this.dropdownlist[index] = [{
        id: 'dd' + this.count
      }]
    }

    // console.log(this.dropdownlist, "11")
  }

  onSubmit() {

    for (let i = 0; i < this.columns.length; i++) {
      if (this.columns[i].constraints) {
        let data = {
          newfieldname: this.columns[i].colname,
          newfieldtype: this.columns[i].type,
          newlabel: this.columns[i].label,
          newkonstraint: this.columns[i].constraints
        }
        this.newColumns.push(data);
      } else {
        let data = {
          newfieldname: this.columns[i].colname,
          newfieldtype: this.columns[i].type,
          newlabel: this.columns[i].label,
          newkonstraint: false
        }
        this.newColumns.push(data);
      }
    }

    this.columns.forEach((item) => {

      let data = {};

      for (var key in item) {
        if (key != 'label' && key != 'type' && key != 'constraints' && key != 'colId') {

          data[key] = item[key];
        }
      }
      if (Object.keys(data).length > 1)
        this.dropdownValue.push(data);

    });

    console.log(this.dropdownValue, "VALUE");

    this.colinfo1.forEach((item) => {
      this.newColumns.push(item);
    })
    this.tableinfo.forEach((item, index) => {
      this.newColumns.push(item);
    })
    // this.deleteColumnArray.forEach((item) => {
    //   this.newColumns.push(item);
    // })
    // this.dropdownValue.forEach((item) => {
    //   this.newColumns.push(item);
    // })

    this.data.columnList = this.newColumns;
    this.data.ddlist = this.dropdownValue;
    this.data.deleteArray = this.deleteColumnArray;

    // this.newColumns.push(this.dropdownValue);

    // console.log(this.newColumns, "NEW COLUMNS");
    // console.log(this.tableinfo, "TABLEINFO")

    console.log(this.data, "DATA");

    let check = {
      tablename: this.tableinfo[0].tablename
    }

    let modifiedUser = {
      user: localStorage.getItem("LoggedInUser"),
      time: Date(),
    };


    if (check.tablename == this.oldtablename) {
      this._userService.editTable(this.tableid, this.data)
        .subscribe((response) => {
          console.log("AFTER RESPONSE");
          this._userService.modified(this.tableid, modifiedUser)
            .subscribe((response) => {
              // this._router.navigate(['/viewTable/' + this.tableid]);
              this._router.navigate(['/adminlogin']);
              this._messageService.add(
                { severity: 'success', detail: 'Success', summary: `${this.tableinfo[0].tablename} has been EDITED successfully` });
            }, (errResponse) => {
              console.log(errResponse, 'Error while modifying mastertable')
            })
        }, (errResponse) => {
          if (errResponse.error.code == '42701') {
            this._messageService.add({
              severity: 'error', detail: 'ERROR', summary: 'Duplicate Column Not Allowed'
            })
            this.newColumns = [];
          }
          console.log(errResponse, "Error while editing table")
        })
    } else {
      this._userService.checkTablename(check)
        .subscribe((response) => {
          if (response) {
            this._userService.editTable(this.tableid, this.newColumns)
              .subscribe((response) => {
                console.log("AFTER RESPONSE");
                this._userService.modified(this.tableid, modifiedUser)
                  .subscribe((response) => {
                    this._router.navigate(['/adminlogin']);
                    // this._router.navigate(['/viewTable/' + this.tableid]);
                    this._messageService.add(
                      { severity: 'success', detail: 'Success', summary: `TABLE ${this.tableinfo[0].tablename} has been EDITED successfully` });
                  }, (errResponse) => {
                    console.log(errResponse, 'Error while modifying mastertable')
                  })
              }, (errResponse) => {
                if (errResponse.error.code == '42701') {
                  this._messageService.add({
                    severity: 'error', detail: 'ERROR', summary: 'Duplicate Column Not Allowed'
                  })
                  this.newColumns = [];

                }
                console.log(errResponse, "Error while editing table")
              })
          } else {
            this._messageService.add({
              severity: 'error', detail: 'ERROR', summary: 'Ooppss ! TableName must be unique'
            })
            this._router.navigate(['/editTable/' + this.tableid]);

          }
        }, (error) => {
          console.log(error, "Error while checking table name ")
        })
    }
  }



  removeColumn(colname) {

    console.log(colname, "0000")

    for (let i = 0; i < this.colinfo1.length; i++) {
      if (this.colinfo1[i].fieldname === colname) {
        let deletedColumn = {};

        deletedColumn = {
          deletefield: this.colinfo1[i].fieldname,
          deletefieldtype: this.colinfo1[i].fieldtype
        }
        this.deleteColumnArray.push(deletedColumn);
        this.colinfo1.splice(i, 1);
      }
    }
    console.log(this.deleteColumnArray, "Deleted column Array");

  }
}
