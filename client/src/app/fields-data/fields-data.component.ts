import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';

import { UserServiceService } from '../user-service.service';

@Component({
  selector: 'app-fields-data',
  templateUrl: './fields-data.component.html',
  styleUrls: ['./fields-data.component.css']
})
export class FieldsDataComponent implements OnInit {
  fieldForm: FormGroup;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private messageService: MessageService,
    private modalService: BsModalService,
    private Toast: ToastModule,
    private _fb: FormBuilder,
    private _userService: UserServiceService,

  ) { }

  modalRef: BsModalRef;

  table_id: Number = this._route.snapshot.params['tableid'];
  count: Number;
  isDropdown: boolean = false;
  isRadio: Boolean = false;
  isCheckbox: Boolean = false;
  displayArray = [];
  columnArray = [];
  // colinfo1 = [];
  title: String = '';
  deleteColumnArray = [];

  ddList: Object[] = [];

  ngOnInit() {
    this.formInitialization();
    this.fetchFieldsData();
    this.tableInfo();
  }

  tableInfo() {
    this._userService.tablename(this.table_id)
      .subscribe((response) => {
        console.log(response, "RESPONSE");
        this.title = response;
      }, (error) => {
        console.log(error, "ERROR WHILE FETCHING TABLENAME");
      })

  }

  fetchFieldsData() {
    console.log("ADDING ROW IN TABLE", this.table_id);

    this._userService.getById(this.table_id)
      .subscribe((response) => {
        let colinfo = response;
        console.log(colinfo, "RESPONSE");

        colinfo.forEach((item, index) => {
          if (item.fieldname != 'uid') {
            this.displayArray.push({
              colname: item.fieldname,
              label: item.label,
              type: item.fieldtype,
              constraints: item.konstraint
            })
          }
        });
      },
        function (errResponse) {

          console.error(errResponse, 'Error while fetching field data ');
        }
      );
  }


  formInitialization() {
    this.fieldForm = this._fb.group(
      {
        'colname': ['', Validators.required],
        'label': ['', Validators.required],
        'type': ['', Validators.required],
        'constraints': ['false', Validators.required]
      }
    )
  }


  get colname() { return this.fieldForm.get('colname') }
  get label() { return this.fieldForm.get('label') }
  get type() { return this.fieldForm.get('type') }
  get constraints() { return this.fieldForm.get('constraints') }
  get radioList() { return this.fieldForm.get('radioList') as FormArray }
  get dropdownList() { return this.fieldForm.get('dropdownList') as FormArray }
  get checkboxList() { return this.fieldForm.get('checkboxList') as FormArray }


  addField(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'gray modal-lg' });
  }


  // updatefield(template, fieldname) {
  //   this.modalRef = this.modalService.show(template, { class: 'gray modal-lg' });
  //   console.log(fieldname, "COL NAME");
  // }


  formColumnArray(data) {
    this.modalRef.hide();

    console.log(data, "DATA !@#$")

    this.columnArray.push(data);
    this.displayArray.push(data);

    console.log(this.columnArray, "Column Array");

    this.fieldForm.reset();
    this.constraints.setValue('false');
    this.isDropdown = false;
    this.isRadio = false;
    this.isCheckbox = false;
    const control = <FormArray>this.fieldForm.controls['dropdownList'];
    if (control) {
      while (control.length !== 0) {
        control.removeAt(0);
      }
    }

    const control1 = <FormArray>this.fieldForm.controls['radioList'];
    if (control1) {
      while (control1.length !== 0) {
        control1.removeAt(0);
      }
    }

    const control2 = <FormArray>this.fieldForm.controls['checkboxList'];
    if (control2) {
      while (control2.length !== 0) {
        control2.removeAt(0);
      }
    }

  }

  onSubmit() {
    this.count = 0;

    console.log(this.fieldForm.value, "COLUMN DATA");

    if (this.displayArray.length != 0) {
      this.displayArray.forEach((item) => {
        if (item.colname == this.fieldForm.value.colname) {
          this.count = 1;
          this.messageService.add(
            { key: 'buzz', severity: 'error', detail: 'Error', summary: 'Fields with this name already exist' });
        }
      })
    } else {
      this.count = 1;
      this.formColumnArray(this.fieldForm.value);
    }
    if (this.count == 0) {
      this.formColumnArray(this.fieldForm.value);
    }
  }

  onSelect() {
    if (this.type.value == 'dropdown') {
      this.fieldForm.addControl('dropdownList', this._fb.array([]));
      // console.log(this.dropdownList)
      this.isDropdown = true;
      this.isRadio = false;
      this.isCheckbox = false;

    } else if (this.type.value == 'radio') {
      this.fieldForm.addControl('radioList', this._fb.array([]));
      this.isRadio = true;
      this.isDropdown = false;
      this.isCheckbox = false;
    } else if (this.type.value == 'checkbox') {
      this.fieldForm.addControl('checkboxList', this._fb.array([]));
      this.isRadio = false;
      this.isDropdown = false;
      this.isCheckbox = true;
    } else {
      this.isDropdown = false;
      this.isRadio = false;
      this.isCheckbox = false;

    }
  }


  addDropdown() {
    this.dropdownList.push(this._fb.group({
      databaseValue: '',
      displayValue: ''
    }));
    console.log(this.dropdownList)
  }

  addRadio() {
    this.radioList.push(this._fb.group({
      databaseValue: '',
      displayValue: ''
    }));
    console.log(this.radioList)
  }

  addCheckbox() {
    this.checkboxList.push(this._fb.group({
      databaseValue: '',
      displayValue: ''
    }));
    console.log(this.checkboxList)
  }


  save() {

    console.log(this.columnArray, "COLUMN ARRAY");

    this.columnArray.forEach((element, index) => {
      for (var key in element) {
        if (key == 'dropdownList') {
          element[key].forEach((item) => {
            this.columnArray.push({
              dbValue: item.databaseValue,
              dspValue: item.displayValue,
              fieldname: element.colname
            })
          })
          delete this.columnArray[index].key;
        } else if (key == 'radioList') {
          element[key].forEach((item) => {
            this.columnArray.push({
              r_dbValue: item.databaseValue,
              r_dspValue: item.displayValue,
              r_fieldname: element.colname
            })
          })
          delete this.columnArray[index].key;
        } else if (key == 'checkboxList') {
          element[key].forEach((item) => {
            this.columnArray.push({
              c_dbValue: item.databaseValue,
              c_dspValue: item.displayValue,
              c_fieldname: element.colname
            })
          })
          delete this.columnArray[index].key;
        }
      }

    })

    console.log(this.columnArray, "ColumnArray");

    this._userService.addColumn(this.table_id, this.columnArray)
      .subscribe((response) => {
        this._router.navigate(['/adminlogin']);
        this.messageService.add(
          { severity: 'success', summary: 'Fields Added Successfully' });
      }, (error) => {
        console.log(error, "ERROR WHILE ADDING COLUMN");
      })
  }


  Cancel() {
    console.log("CANCEL")

    this.modalRef.hide();
    this.fieldForm.reset();
    this.constraints.setValue('false');
    this.isDropdown = false;
    this.isRadio = false;

    const control = <FormArray>this.fieldForm.controls['dropdownList'];
    console.log(control, 'control');
    if (control) {
      while (control.length !== 0) {
        control.removeAt(0);
      }
    }

    const control1 = <FormArray>this.fieldForm.controls['radioList'];
    // console.log(control, 'control');
    if (control1) {
      while (control1.length !== 0) {
        control1.removeAt(0);
      }
    }
    const control2 = <FormArray>this.fieldForm.controls['checkboxList'];
    if (control2) {
      while (control2.length !== 0) {
        control2.removeAt(0);
      }
    }

  }

  

  deletefield(fieldname) {
    console.log(fieldname, "in delete")
    console.log(this.displayArray);

    for (let i = 0; i < this.displayArray.length; i++) {
      if (this.displayArray[i].colname === fieldname) {
        let deletedColumn = {};

        deletedColumn = {
          deletefield: this.displayArray[i].colname,
          deletefieldtype: this.displayArray[i].type
        }
        // this.deleteColumnArray.push(deletedColumn);
        this.columnArray.push(deletedColumn);
        this.displayArray.splice(i, 1);
      }

      for (let i = 0; i < this.columnArray.length; i++) {
        if (this.columnArray[i].colname === fieldname) {
          let deletedColumn = {};

          deletedColumn = {
            deletefield: this.columnArray[i].colname,
            deletefieldtype: this.columnArray[i].type
          }
          // this.deleteColumnArray.push(deletedColumn);
          // this.columnArray.push(deletedColumn);
          this.columnArray.splice(i, 1);
        }
      }
    }

    console.log(this.deleteColumnArray, "DELETED ARRAY");
  }


}
