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
              constraints: item.konstraint,
              f_uid: item.f_uid
            })
          }
          console.log(this.displayArray, "CURRENT");
        });
      }, function (errResponse) {
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

  get dropdownList1() { return this.fieldForm.get('dropdownList1') as FormArray }



  addField(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'gray modal-lg' });
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


  addDropdown1() {
    this.dropdownList1.push(this._fb.group({
      databaseValue: '',
      displayValue: ''
    }));
    console.log(this.dropdownList)
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

  editCancel() {

    this.modalRef.hide();
    this.modalRef.hide();
    this.fieldForm.reset();
    this.constraints.setValue('false');
    this.isDropdown = false;
    this.isRadio = false;

    const control3 = <FormArray>this.fieldForm.controls['dropdownList1'];
    if (control3) {
      while (control3.length !== 0) {
        control3.removeAt(0);
      }
    }

  }


  deletefield(fieldname) {

    for (let i = 0; i < this.displayArray.length; i++) {
      if (this.displayArray[i].colname === fieldname) {
        let deletedColumn = {};

        deletedColumn = {
          deletefield: this.displayArray[i].colname,
          deletefieldtype: this.displayArray[i].type
        }
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
          this.columnArray.splice(i, 1);
        }
      }
    }

    console.log(this.deleteColumnArray, "DELETED ARRAY");
  }

  formColumnArray(data) {
    this.modalRef.hide();

    console.log(data, "DATA !@#$")

    this.displayArray.push(data);
    this.columnArray.push(data);

    console.log(this.displayArray, "Display Array")
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

  currentFieldId: Number;
  dropdownToEdit: any = [];
  radioListToEdit: any = [];
  checkboxListToEdit: any = [];
  // colObject: any = {};

  updatefield(template, field_id) {
    this.currentFieldId = field_id;
    this.modalRef = this.modalService.show(template, { class: 'gray modal-lg' });
    console.log(this.currentFieldId, "current field Id");
    this._userService.fetchFieldData(this.table_id, field_id).subscribe((response) => {
      console.log(response);
      let info: any = response;

      info.forEach(element => {

        if (element.c_dbValue != null || element.c_dspvalue != null) {

          this.checkboxListToEdit.push({
            databasevalue: element.d_dbvalue,
            displayvalue: element.d_dspvalue
          })

        } else if (element.d_dbvalue != null || element.d_dspvalue != null) {

          this.dropdownToEdit.push({
            databasevalue: element.d_dbvalue,
            displayvalue: element.d_dspvalue
          })

        } else if (element.r_dbValue != null || element.r_dspvalue != null) {

          this.radioListToEdit.push({
            databasevalue: element.d_dbvalue,
            displayvalue: element.d_dspvalue
          })

        }

        for (var key in element) {

          if (key == 'fieldname' || key == 'label' || key == 'fieldtype' || key == 'konstraint') {

            this.fieldForm.setValue({ 'colname': element.fieldname, 'label': element.label, 'constraints': element.konstraint, 'type': element.fieldtype });
          }

        }
      });

      if (this.dropdownToEdit.length > 0) {

        this.fieldForm.addControl('dropdownList1', this._fb.array([]));

        this.dropdownToEdit.forEach((item) => {
          this.dropdownList1.push(this._fb.group({
            databaseValue: item.databasevalue,
            displayValue: item.displayvalue
          }));

        });
        this.isDropdown = true;
      }

      console.log(this.dropdownToEdit, "111");

    }, (err) => {
      console.log(err);
    })
  }



  editFormSubmit() {

    this.fieldForm.value.f_uid = this.currentFieldId;

    console.log(this.fieldForm.value,"!!!");
   
  }

}










 // let removeIndex = null;
    // let counter = 0;
    // let counters = 0;
    // console.log(this.fieldForm.value, "NEW DATA");
    // if (this.displayArray.length) {
    //   this.displayArray.forEach((item, index) => {
    //     if (item.f_uid != this.currentFieldId) {
    //       if (item.colname != this.fieldForm.value.colname) {
    //         if (counter == 0) {
    //           counter = 1;
    //           this.fieldForm.value.f_uid = this.currentFieldId;
    //           this.formColumnArray(this.fieldForm.value);
    //         }
    //       } else {
    //         this.messageService.add(
    //           { key: 'buzz', severity: 'error', detail: 'Error', summary: 'Fields with this name already exist' });
    //       }
    //     } else {
    //       if (counters == 0) {
    //         counters = 1;
    //         this.displayArray.splice(index, 1);
    //       }
    //     }
    //   })
    // }