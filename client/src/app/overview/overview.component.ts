import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { UserServiceService } from '../user-service.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {


  constructor(
    private _userService: UserServiceService,
    private modalService: BsModalService,
    public bsModalRef: BsModalRef
  ) { }

  ngOnInit() {
    this.fetchTableId();
  }

  @ViewChild(DataTableDirective)

  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger = new Subject();

  colinfo1 = [];
  datas = [];
  tableIdList = [];
  currentTableid: Number;
  index = 0;
  currentTablename: String;

  fetchTableId() {
    this._userService.fetchMastertableData()
      .subscribe((response) => {
        response.forEach(element => {
          this.tableIdList.push({
            id: element.id,
            tablename: element.tablename
          });
        });
        this.currentTableid = this.tableIdList[this.index].id;
        this.currentTablename = this.tableIdList[this.index].tablename;
        this.index = this.index + 1;
        this.datatableIntialization();
      }, (error) => {
        console.log(error, "Error while fetching master table data");
      })
  }



  nextClick() {
    if (this.index > 0 && this.index < this.tableIdList.length) {
      this.currentTableid = this.tableIdList[this.index].id;
      this.currentTablename = this.tableIdList[this.index].tablename;
      this.index = this.index + 1;
      this.datatableIntialization();
    } else {
      this.currentTableid = this.tableIdList[0].id;
      this.currentTablename = this.tableIdList[0].tablename;
      this.index = 1;
      this.datatableIntialization();
    }

  }


  datatableIntialization() {

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10
    };

    this._userService.getById(this.currentTableid)
      .subscribe((response) => {
        let colinfo = response;
        this.colinfo1 = [];
        colinfo.forEach((item, index) => {
          if (item.fieldname != 'uid') {
            this.colinfo1.push({
              fieldname: item.fieldname,
              fieldtype: item.fieldtype
            })
          }
        })
        this.rerender();
      }, (error) => {
        console.log(error, "error while fetching fields data")
      })


    this._userService.tableData(this.currentTableid)
      .subscribe((response) => {
        this.datas = response;
        // this.rerender();
      }, (err) => {
        console.log('Error while fetching datas', err);
      })
  }


  rerender() {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance
        .then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
          this.dtTrigger.next();
        });
    }
  }
}
