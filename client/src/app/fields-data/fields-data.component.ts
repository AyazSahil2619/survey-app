import { Component, OnInit, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SelectItem } from 'primeng/api';

import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';

import { UserServiceService } from '../user-service.service';
import { CommonModalComponent } from '../common-modal/common-modal.component';
import { validateConfig } from '@angular/router/src/config';
// import { RxwebValidators } from '@rxweb/reactive-form-validators';



@Component({
  selector: 'app-fields-data',
  templateUrl: './fields-data.component.html',
  styleUrls: ['./fields-data.component.css']
})
export class FieldsDataComponent implements OnInit {
  fieldForm: FormGroup;

  ConstraintOptions: any;
  numbers: any;
  i = 0;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private messageService: MessageService,
    private modalService: BsModalService,
    private Toast: ToastModule,
    private _fb: FormBuilder,
    private _userService: UserServiceService,

  ) {
    this.numbers = Array.from(new Array(10), (x, i) => i + 1)
    this.ConstraintOptions = [{ label: 'Yes', value: 'true' },
    { label: 'No', value: 'false' }]
  }

  modalRef: BsModalRef;

  table_id: Number = this._route.snapshot.params['tableid'];
  count: Number;
  isDropdown: boolean = false;
  isRadio: Boolean = false;
  isCheckbox: Boolean = false;
  displayArray = [];
  columnArray = [];
  title: String = '';
  deleteColumnArray = [];
  fieldToDelete: any;
  ddList: Object[] = [];
  clicked: boolean = true;
  counter: Number;
  isLength: Boolean = false;
  isRating: Boolean = false;
  isFile: Boolean = false;
  isEditor: Boolean = false;
  isAddTemplate: boolean = false;
  isEditTemplate: boolean = false;


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
    this.displayArray = [];
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
              f_uid: item.f_uid,
              unique_key: item.u_konstraint,
              required_key: item.required
            })
          }
        });
        this.counter = this.displayArray.length;
        console.log(this.displayArray, "CURRENT");
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
        'constraints': ['false', Validators.required],
        'unique_key': ['false', Validators.required],
        'required_key': ['true', Validators.required],
        'text_length': ['null', Validators.required],
        'rating': ['null', Validators.required],
        'm_editor': ['false', Validators.required]

      }
    )
  }


  get colname() { return this.fieldForm.get('colname') }
  get label() { return this.fieldForm.get('label') }
  get type() { return this.fieldForm.get('type') }
  get constraints() { return this.fieldForm.get('constraints') }
  get unique_key() { return this.fieldForm.get('unique_key') }
  get required_key() { return this.fieldForm.get('required_key') }
  get text_length() { return this.fieldForm.get('text_length') }
  get rating() { return this.fieldForm.get('rating') }
  get m_editor() { return this.fieldForm.get('m_editor') }


  get arrayList() { return this.fieldForm.get('arrayList') as FormArray }

  // get List() { return this.fieldForm.get('List') as FormArray }

  addField(template: TemplateRef<any>) {
    this.isAddTemplate = true;
    this.modalRef = this.modalService.show(template, { class: 'gray modal-lg', backdrop: 'static' });
  }


  formColumnArray() {

    this.fieldForm.reset();
    this.constraints.setValue('false');
    this.unique_key.setValue('false');
    this.required_key.setValue('true');
    this.text_length.setValue('null');
    this.rating.setValue('null');
    this.m_editor.setValue('false');
    this.isDropdown = false;
    this.isRadio = false;
    this.isCheckbox = false;
    this.isLength = false;
    this.isRating = false;
    this.isEditor = false;
    this.isAddTemplate = false;
    this.isEditTemplate = false;

    this.fieldForm.removeControl('arrayList');

    const control = <FormArray>this.fieldForm.controls['arrayList'];
    if (control) {
      while (control.length !== 0) {
        control.removeAt(0);
      }
    }
    this.modalRef.hide();

  }


  onSubmit() {
    this.count = 0;

    console.log(this.fieldForm.value, "COLUMN DATA");

    let data: any = this.fieldForm.value;

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
      this.formColumnArray();
      this.save(data);
    }
    if (this.count == 0) {
      this.formColumnArray();
      this.save(data);
    }
  }


  save(data) {

    console.log(data, "COLUMN ARRAY");

    this._userService.addColumn(this.table_id, data)
      .subscribe((response) => {
        this.fetchFieldsData();
        this.messageService.add(
          { severity: 'success', summary: 'Field Added Successfully' });
      }, (errorResponse) => {
        if (errorResponse.error.code == '23502') {
          this.messageService.add(
            { severity: 'error', detail: 'Error', summary: 'Field contains null Value' });
        } else if (errorResponse.error.code == '42P16') {
          this.messageService.add(
            { severity: 'error', detail: 'Error', summary: 'Multiple Primary key not allowed' });
        } else {
          this.messageService.add(
            { severity: 'error', detail: 'Error', summary: 'Something went wrong' });
        }
        console.log(errorResponse, "ERROR WHILE ADDING COLUMN");
      })

  }


  deleteSuggestion(index) {
    console.log(index, "OOO");
    this.arrayList.removeAt(index);
  }

  // RxwebValidators.unique()
  addSuggestion() {
    this.arrayList.push(this._fb.group({
      databaseValue: ['', [Validators.required]],
      displayValue: ['', [Validators.required]]
    }));
    // console.log(this.arrayList)
  }

  click() {
    this.clicked = !this.clicked;
  }

  reset() {
    this.isEditor = false;
    this.isLength = false;
    this.constraints.setValue('false');
    this.unique_key.setValue('false');
    this.text_length.setValue('null');
  }

  deleteModal(f_uid) {
    const initialState = {
      title: 'Do you want to delete this field ?',
      // template: 'deleteTemplate'
    };
    this.fieldToDelete = f_uid;
    this.modalRef = this.modalService.show(CommonModalComponent, { initialState });
    this.modalRef.content.onClose.subscribe(result => {
      if (result == true) {
        this.confirm();
      } else {
        this.decline();
      }
    })
  }


  decline() {
    this.modalRef.hide();
  }

  confirm() {

    let deletedColumn = {};

    for (let i = 0; i < this.displayArray.length; i++) {
      if (this.displayArray[i].f_uid === this.fieldToDelete) {

        deletedColumn = {
          deletefield: this.displayArray[i].colname,
          deletefieldtype: this.displayArray[i].type,
        }
        // this.columnArray.push(deletedColumn);
        this.displayArray.splice(i, 1);
      }

    }
    this._userService.deleteField(this.table_id, this.fieldToDelete)
      .subscribe((response) => {
        this.modalRef.hide();
        this.messageService.add(
          { severity: 'success', detail: 'Success', summary: 'Fields Deleted Successfully' });

      }, (err) => {
        this.modalRef.hide();
        this.messageService.add(
          { severity: 'error', detail: 'Error', summary: 'Oops ! Something went wrong' });
        console.log(err, "ERROR WHILE DELETING FIELD");
      })


    console.log(this.deleteColumnArray, "DELETED ARRAY");
  }


  onFormSubmit() {
    if (this.isAddTemplate) {
      this.onSubmit();
    } else if (this.isEditTemplate) {
      this.editFormSubmit();
    }
  }



  currentFieldId: Number;
  ListToEdit: any = [];
  fieldtype: String;

  updatefield(template, field_id) {
    this.isEditTemplate = true;
    this.currentFieldId = field_id;
    console.log(this.currentFieldId, "current field Id");
    this._userService.fetchFieldData(this.table_id, field_id).subscribe((response) => {
      let info: any = response;

      console.log(info, "INFOOOOOOOOOO");
      this.ListToEdit = [];
      info.forEach((element) => {
        for (var key in element) {
          if (key == 'fieldname' || key == 'label' || key == 'fieldtype' || key == 'konstraint') {
            this.fieldForm.setValue({
              'colname': element.fieldname,
              'label': element.label,
              'constraints': element.konstraint,
              'type': element.fieldtype,
              'unique_key': element.u_konstraint,
              'required_key': element.required,
              'text_length': element.text_length,
              'rating': parseInt(element.rating),
              'm_editor': element.m_editor

            });
            console.log(typeof element.text_length, "LLLL");

            this.fieldtype = element.fieldtype;
          }
          else if (key == 'c_dbValue' || key == 'c_dspvalue') {
            this.ListToEdit.push({
              databasevalue: element.c_dbvalue,
              displayvalue: element.c_dspvalue
            })
          } else if (key == 'r_dbValue' || key == 'r_dspvalue') {
            this.ListToEdit.push({
              databasevalue: element.r_dbvalue,
              displayvalue: element.r_dspvalue
            })
          } else if (key == 'd_dbValue' || key == 'd_dspvalue') {
            this.ListToEdit.push({
              databasevalue: element.d_dbvalue,
              displayvalue: element.d_dspvalue
            })
          }
        }
      });

      console.log(this.fieldForm.value, this.fieldtype, this.ListToEdit, this.ListToEdit.length, "LLLlllllllllll");

      if (this.ListToEdit.length > 0) {
        // this.fieldForm.addControl('List', this._fb.array([]));
        this.fieldForm.addControl('arrayList', this._fb.array([]));
        this.ListToEdit.forEach((item) => {
          // this.List.push(this._fb.group({
          this.arrayList.push(this._fb.group({
            databaseValue: item.databasevalue,
            displayValue: item.displayvalue
          }));
        });
        console.log(this.arrayList, "111111111");


        if (this.fieldtype == 'dropdown') {
          this.isDropdown = true;
        } else if (this.fieldtype == 'radio') {
          this.isRadio = true;
        } else if (this.fieldtype == 'checkbox') {
          this.isCheckbox = true;
        }
      }

      if (this.fieldtype == 'short_text' || this.fieldtype == 'long_text') {
        if (this.fieldtype == 'long_text') {
          this.isEditor = true;
        }
        this.isLength = true;
      } else if (this.fieldtype == 'star_rating') {
        this.isRating = true;
      }

      this.modalRef = this.modalService.show(template, { class: 'gray modal-lg', backdrop: 'static' });


    }, (err) => {
      console.log(err, "error while fetching fields data");
    })
  }



  editFormSubmit() {

    this.fieldForm.value.f_uid = this.currentFieldId;
    console.log(this.fieldForm.value, "!!!");

    this._userService.editColumn(this.table_id, this.currentFieldId, this.fieldForm.value)
      .subscribe((response) => {
        this.displayArray.forEach((item, index) => {
          if (item.f_uid == this.currentFieldId) {
            this.displayArray.splice(index, 1);
            this.displayArray.push(this.fieldForm.value);
          }
        })
        this.formColumnArray();
        this.modalRef.hide();
        this.messageService.add(
          { severity: 'success', detail: 'Success', summary: 'Field edited Successfully' });

      }, (errResponse) => {

        if (errResponse.error.code == 42804) {
          this.formColumnArray();
          this.modalRef.hide();
          this.messageService.add(
            { severity: 'error', detail: 'Error', summary: 'Invalid FieldType Conversion' });
        }
        if (errResponse.error.code == '42P16') {
          this.formColumnArray();
          this.modalRef.hide();
          this.messageService.add(
            { severity: 'error', detail: 'Error', summary: `Multiple Primary key not allowed` });
        }
        if (errResponse.error.code == 42701) {
          this.formColumnArray();
          this.modalRef.hide();
          this.messageService.add(
            { key: 'buzz', severity: 'error', detail: 'Error', summary: `Field Name must be Unique` });
        }
        console.log(errResponse, "ERROR WHILE EDITING COLUMN");
      })

  }



  onSelect() {

    console.log("ON SELECT ");

    if (this.type.value == 'short_text' || this.type.value == 'long_text') {
      this.isLength = true;
      this.isDropdown = false;
      this.isRadio = false;
      this.isCheckbox = false;
      this.isRating = false;
      this.isFile = false;
      this.isEditor = false;
      if (this.type.value == 'long_text') {
        this.isEditor = true;
      }

    } else if (this.type.value == 'dropdown') {
      this.fieldForm.addControl('arrayList', this._fb.array([]));
      this.isDropdown = true;
      this.isRadio = false;
      this.isCheckbox = false;
      this.isRating = false;
      this.isFile = false;
      this.reset();

    } else if (this.type.value == 'radio') {
      this.fieldForm.addControl('arrayList', this._fb.array([]));
      this.isRadio = true;
      this.isDropdown = false;
      this.isRating = false;
      this.isFile = false;
      this.isCheckbox = false;
      this.reset();

    } else if (this.type.value == 'checkbox') {
      this.fieldForm.addControl('arrayList', this._fb.array([]));
      this.isRadio = false;
      this.isDropdown = false;
      this.isFile = false;
      this.isRating = false;
      this.isCheckbox = true;
      this.reset();

    } else if (this.type.value == 'file_upload') {
      this.isFile = true;
      this.isRating = false;
      this.isLength = false;
      this.isRadio = false;
      this.isDropdown = false;
      this.isCheckbox = false;
      this.reset();

    } else if (this.type.value == 'star_rating') {
      this.isRating = true;
      this.isLength = false;
      this.isRadio = false;
      this.isDropdown = false;
      this.isFile = false;
      this.isCheckbox = false;
      this.reset();

    } else {
      this.isDropdown = false;
      this.isRadio = false;
      this.isCheckbox = false;
      this.isLength = false;
      this.isFile = false;
      this.isRating = false;
      this.isEditor = false;
    }
  }

}

















// ======================================== changes made List to  arrayLIst


  // onSelect1() {
  //   console.log("ON SELECT !")
  //   // if (this.ListToEdit.length == 0) {
  //   if (this.type.value == 'short_text' || this.type.value == 'long_text') {
  //     this.isLength = true;
  //     this.isDropdown = false;
  //     this.isRadio = false;
  //     this.isCheckbox = false;
  //     this.isRating = false;
  //   } else if (this.type.value == 'dropdown') {
  //     this.fieldForm.addControl('List', this._fb.array([]));
  //     this.isDropdown = true;
  //     this.isRadio = false;
  //     this.isCheckbox = false;
  //     this.reset();

  //   } else if (this.type.value == 'radio') {
  //     this.fieldForm.addControl('List', this._fb.array([]));
  //     this.isRadio = true;
  //     this.isDropdown = false;
  //     this.isCheckbox = false;
  //     this.reset();

  //   } else if (this.type.value == 'checkbox') {
  //     this.fieldForm.addControl('List', this._fb.array([]));
  //     this.isRadio = false;
  //     this.isDropdown = false;
  //     this.isCheckbox = true;
  //     this.reset();
  //   } else if (this.type.value == 'star_rating') {
  //     console.log("IS RATING");
  //     this.isRating = true;
  //     this.isRadio = false;
  //     this.isDropdown = false;
  //     this.isCheckbox = false;
  //     this.isLength = false;
  //     this.reset();

  //   } else {
  //     this.isDropdown = false;
  //     this.isRadio = false;
  //     this.isCheckbox = false;
  //     this.isLength = false;
  //     this.isRating = false;

  //   }
  //   // }
  // }

  // addSuggestion() {
  //   this.List.push(this._fb.group({
  //     databaseValue: '',
  //     displayValue: ''
  //   }));

  // }

  // minus1(index) {
  //   console.log(index, "OOO");
  //   this.List.removeAt(index);
  // }




  // clearData() {

  //   const control = <FormArray>this.fieldForm.controls['List'];

  //   if (control) {
  //     while (control.length !== 0) {
  //       control.removeAt(0);
  //     }
  //   }

  //   this.fieldForm.removeControl('List');
  //   this.fieldForm.reset();
  //   this.constraints.setValue('false');
  //   this.unique_key.setValue('false');
  //   this.required_key.setValue('true');
  //   this.text_length.setValue('null');
  //   this.isDropdown = false;
  //   this.isRadio = false;
  //   this.isCheckbox = false;
  //   this.isLength = false;
  //   this.isRating = false;
  //   this.modalRef.hide();
  //   console.log(this.arrayList, this.fieldForm.value, "")

  // }





// =====================================================================================    changes made Lsit to array List



























 // Cancel() {


  //   this.fieldForm.reset();
  //   this.constraints.setValue('false');
  //   this.unique_key.setValue('false');
  //   this.required_key.setValue('false');
  //   this.isDropdown = false;
  //   this.isRadio = false;
  //   this.isCheckbox = false;
  //   this.fieldForm.removeControl('arrayList');
  //   const control = <FormArray>this.fieldForm.controls['arrayList'];

  //   if (control) {
  //     while (control.length !== 0) {
  //       control.removeAt(0);
  //     }
  //   }
  //   this.modalRef.hide();

  // }




  // modalRef: BsModalRef;

  // table_id: Number = this._route.snapshot.params['tableid'];
  // count: Number;
  // isDropdown: boolean = false;
  // isRadio: Boolean = false;
  // isCheckbox: Boolean = false;
  // displayArray = [];
  // columnArray = [];
  // // colinfo1 = [];
  // title: String = '';
  // deleteColumnArray = [];
  // fieldToDelete: any;
  // ddList: Object[] = [];

  // ngOnInit() {
  //   this.formInitialization();
  //   this.fetchFieldsData();
  //   this.tableInfo();
  // }

  // tableInfo() {
  //   this._userService.tablename(this.table_id)
  //     .subscribe((response) => {
  //       console.log(response, "RESPONSE");
  //       this.title = response;
  //     }, (error) => {
  //       console.log(error, "ERROR WHILE FETCHING TABLENAME");
  //     })

  // }

  // fetchFieldsData() {
  //   this.displayArray = [];
  //   console.log("ADDING ROW IN TABLE", this.table_id);

  //   this._userService.getById(this.table_id)
  //     .subscribe((response) => {
  //       let colinfo = response;
  //       console.log(colinfo, "RESPONSE");

  //       colinfo.forEach((item, index) => {
  //         if (item.fieldname != 'uid') {
  //           this.displayArray.push({
  //             colname: item.fieldname,
  //             label: item.label,
  //             type: item.fieldtype,
  //             constraints: item.konstraint,
  //             f_uid: item.f_uid
  //           })
  //         }
  //       });
  //       console.log(this.displayArray, "CURRENT");
  //     }, function (errResponse) {
  //       console.error(errResponse, 'Error while fetching field data ');
  //     }
  //     );
  // }


  // formInitialization() {
  //   this.fieldForm = this._fb.group(
  //     {
  //       'colname': ['', Validators.required],
  //       'label': ['', Validators.required],
  //       'type': ['', Validators.required],
  //       'constraints': ['false', Validators.required]
  //     }
  //   )
  // }


  // get colname() { return this.fieldForm.get('colname') }
  // get label() { return this.fieldForm.get('label') }
  // get type() { return this.fieldForm.get('type') }
  // get constraints() { return this.fieldForm.get('constraints') }
  // get radioList() { return this.fieldForm.get('radioList') as FormArray }
  // get dropdownList() { return this.fieldForm.get('dropdownList') as FormArray }
  // get checkboxList() { return this.fieldForm.get('checkboxList') as FormArray }

  // get arrayList() { return this.fieldForm.get('arrayList') as FormArray }


  // get List() { return this.fieldForm.get('List') as FormArray }


  // addField(template: TemplateRef<any>) {
  //   this.modalRef = this.modalService.show(template, { class: 'gray modal-lg' });
  // }


  // formColumnArray(data) {
  //   this.modalRef.hide();

  //   console.log(data, "DATA !@#$")

  //   // this.displayArray.push(data);
  //   this.columnArray.push(data);

  //   console.log(this.displayArray, "Display Array")
  //   console.log(this.columnArray, "Column Array");

  //   this.fieldForm.reset();
  //   this.constraints.setValue('false');
  //   this.isDropdown = false;
  //   this.isRadio = false;
  //   this.isCheckbox = false;
  //   // const control = <FormArray>this.fieldForm.controls['dropdownList'];
  //   // if (control) {
  //   //   while (control.length !== 0) {
  //   //     control.removeAt(0);
  //   //   }
  //   // }

  //   // const control1 = <FormArray>this.fieldForm.controls['radioList'];
  //   // if (control1) {
  //   //   while (control1.length !== 0) {
  //   //     control1.removeAt(0);
  //   //   }
  //   // }

  //   // const control2 = <FormArray>this.fieldForm.controls['checkboxList'];
  //   // if (control2) {
  //   //   while (control2.length !== 0) {
  //   //     control2.removeAt(0);
  //   //   }
  //   // }

  //   const control = <FormArray>this.fieldForm.controls['arrayList'];
  //   if (control) {
  //     while (control.length !== 0) {
  //       control.removeAt(0);
  //     }
  //   }


  // }



  // onSubmit() {
  //   this.count = 0;

  //   console.log(this.fieldForm.value, "COLUMN DATA");

  //   if (this.displayArray.length != 0) {
  //     this.displayArray.forEach((item) => {
  //       if (item.colname == this.fieldForm.value.colname) {
  //         this.count = 1;
  //         this.messageService.add(
  //           { key: 'buzz', severity: 'error', detail: 'Error', summary: 'Fields with this name already exist' });
  //       }
  //     })
  //   } else {
  //     this.count = 1;
  //     this.formColumnArray(this.fieldForm.value);
  //     this.save();
  //   }
  //   if (this.count == 0) {
  //     this.formColumnArray(this.fieldForm.value);
  //     this.save();
  //   }
  // }

  // onSelect() {
  //   // if (this.type.value == 'dropdown') {
  //   //   this.fieldForm.addControl('dropdownList', this._fb.array([]));
  //   //   this.isDropdown = true;
  //   //   this.isRadio = false;
  //   //   this.isCheckbox = false;

  //   // } else if (this.type.value == 'radio') {
  //   //   this.fieldForm.addControl('radioList', this._fb.array([]));
  //   //   this.isRadio = true;
  //   //   this.isDropdown = false;
  //   //   this.isCheckbox = false;
  //   // } else if (this.type.value == 'checkbox') {
  //   //   this.fieldForm.addControl('checkboxList', this._fb.array([]));
  //   //   this.isRadio = false;
  //   //   this.isDropdown = false;
  //   //   this.isCheckbox = true;
  //   // } else {
  //   //   this.isDropdown = false;
  //   //   this.isRadio = false;
  //   //   this.isCheckbox = false;

  //   // }
  //   if (this.type.value == 'dropdown') {
  //     this.fieldForm.addControl('arrayList', this._fb.array([]));
  //     this.isDropdown = true;
  //     this.isRadio = false;
  //     this.isCheckbox = false;
  //   } else if (this.type.value == 'radio') {
  //     this.fieldForm.addControl('arrayList', this._fb.array([]));
  //     this.isRadio = true;
  //     this.isDropdown = false;
  //     this.isCheckbox = false;
  //   } else if (this.type.value == 'checkbox') {
  //     this.fieldForm.addControl('arrayList', this._fb.array([]));
  //     this.isRadio = false;
  //     this.isDropdown = false;
  //     this.isCheckbox = true;
  //   } else {
  //     this.isDropdown = false;
  //     this.isRadio = false;
  //     this.isCheckbox = false;

  //   }
  // }


  // add() {
  //   this.arrayList.push(this._fb.group({
  //     databaseValue: '',
  //     displayValue: ''
  //   }));
  //   console.log(this.arrayList)
  // }



  // // addDropdown() {
  // //   this.dropdownList.push(this._fb.group({
  // //     databaseValue: '',
  // //     displayValue: ''
  // //   }));
  // //   console.log(this.dropdownList)
  // // }

  // addRadio() {
  //   this.radioList.push(this._fb.group({
  //     databaseValue: '',
  //     displayValue: ''
  //   }));
  //   console.log(this.radioList)
  // }

  // addCheckbox() {
  //   this.checkboxList.push(this._fb.group({
  //     databaseValue: '',
  //     displayValue: ''
  //   }));
  //   console.log(this.checkboxList)
  // }


  // addSuggestion() {
  //   this.List.push(this._fb.group({
  //     databaseValue: '',
  //     displayValue: ''
  //   }));

  // }


  // save() {

  //   console.log(this.columnArray, "COLUMN ARRAY");

  //   // this.columnArray.forEach((element, index) => {
  //   //   for (var key in element) {
  //   //     if (key == 'dropdownList') {
  //   //       element[key].forEach((item) => {
  //   //         this.columnArray.push({
  //   //           dbValue: item.databaseValue,
  //   //           dspValue: item.displayValue,
  //   //           fieldname: element.colname
  //   //         })
  //   //       })
  //   //       delete this.columnArray[index].key;
  //   //     } else if (key == 'radioList') {
  //   //       element[key].forEach((item) => {
  //   //         this.columnArray.push({
  //   //           r_dbValue: item.databaseValue,
  //   //           r_dspValue: item.displayValue,
  //   //           r_fieldname: element.colname
  //   //         })
  //   //       })
  //   //       delete this.columnArray[index].key;
  //   //     } else if (key == 'checkboxList') {
  //   //       element[key].forEach((item) => {
  //   //         this.columnArray.push({
  //   //           c_dbValue: item.databaseValue,
  //   //           c_dspValue: item.displayValue,
  //   //           c_fieldname: element.colname
  //   //         })
  //   //       })
  //   //       delete this.columnArray[index].key;
  //   //     }
  //   //   }

  //   // })

  //   // console.log(this.columnArray, "ColumnArray");

  //   // this._userService.addColumn(this.table_id, this.columnArray)
  //   //   .subscribe((response) => {
  //   //     // this._router.navigate(['/adminlogin']);
  //   //     this.fetchFieldsData();
  //   //     this.messageService.add(
  //   //       { severity: 'success', summary: 'Fields Updated Successfully' });
  //   //   }, (error) => {
  //   //     this.messageService.add(
  //   //       { severity: 'error', summary: 'Something went wrong' });
  //   //     console.log(error, "ERROR WHILE ADDING COLUMN");
  //   //   })

  // }


  // Cancel() {
  //   console.log("CANCEL")

  //   this.modalRef.hide();
  //   this.fieldForm.reset();
  //   this.constraints.setValue('false');
  //   this.isDropdown = false;
  //   this.isRadio = false;

  //   const control = <FormArray>this.fieldForm.controls['dropdownList'];
  //   console.log(control, 'control');
  //   if (control) {
  //     while (control.length !== 0) {
  //       control.removeAt(0);
  //     }
  //   }

  //   const control1 = <FormArray>this.fieldForm.controls['radioList'];
  //   // console.log(control, 'control');
  //   if (control1) {
  //     while (control1.length !== 0) {
  //       control1.removeAt(0);
  //     }
  //   }
  //   const control2 = <FormArray>this.fieldForm.controls['checkboxList'];
  //   if (control2) {
  //     while (control2.length !== 0) {
  //       control2.removeAt(0);
  //     }
  //   }



  // }


  // deleteModal(template: TemplateRef<any>, f_uid) {
  //   this.fieldToDelete = f_uid;
  //   this.modalRef = this.modalService.show(template);
  // }


  // decline() {
  //   this.modalRef.hide();
  // }

  // confirm() {

  //   let deletedColumn = {};

  //   for (let i = 0; i < this.displayArray.length; i++) {
  //     if (this.displayArray[i].f_uid === this.fieldToDelete) {

  //       deletedColumn = {
  //         deletefield: this.displayArray[i].colname,
  //         deletefieldtype: this.displayArray[i].type,
  //       }
  //       // this.columnArray.push(deletedColumn);
  //       this.displayArray.splice(i, 1);
  //     }


  //     // for (let i = 0; i < this.columnArray.length; i++) {
  //     //   if (this.columnArray[i].colname === this.fieldToDelete) {
  //     //     let deletedColumn = {};

  //     //     deletedColumn = {
  //     //       deletefield: this.columnArray[i].colname,
  //     //       deletefieldtype: this.columnArray[i].type
  //     //     }
  //     //     this.columnArray.splice(i, 1);
  //     //   }
  //     // }
  //   }
  //   this._userService.deleteField(this.table_id, this.fieldToDelete)
  //     .subscribe((response) => {
  //       this.modalRef.hide();
  //       this.messageService.add(
  //         { severity: 'success', detail: 'Success', summary: 'Fields Deleted Successfully' });

  //     }, (err) => {
  //       this.modalRef.hide();
  //       this.messageService.add(
  //         { severity: 'error', detail: 'Error', summary: 'Oops ! SOmething went wrong' });
  //       console.log(err, "ERROR WHILE DELETING FIELD");
  //     })


  //   console.log(this.deleteColumnArray, "DELETED ARRAY");
  // }



  // currentFieldId: Number;
  // ListToEdit: any = [];
  // fieldtype: String;

  // updatefield(template, field_id) {
  //   this.currentFieldId = field_id;
  //   console.log(this.currentFieldId, "current field Id");
  //   this._userService.fetchFieldData(this.table_id, field_id).subscribe((response) => {
  //     console.log(response, "1111111111");
  //     let info: any = response;


  //     info.forEach(element => {

  //       for (var key in element) {

  //         if (key == 'fieldname' || key == 'label' || key == 'fieldtype' || key == 'konstraint') {

  //           this.fieldForm.setValue({
  //             'colname': element.fieldname,
  //             'label': element.label,
  //             'constraints': element.konstraint,
  //             'type': element.fieldtype
  //           });
  //           this.fieldtype = element.fieldtype;

  //         }

  //         else if (key == 'c_dbValue' || key == 'c_dspvalue') {

  //           this.ListToEdit.push({
  //             databasevalue: element.c_dbvalue,
  //             displayvalue: element.c_dspvalue
  //           })

  //         } else if (key == 'r_dbValue' || key == 'r_dspvalue') {

  //           this.ListToEdit.push({
  //             databasevalue: element.r_dbvalue,
  //             displayvalue: element.r_dspvalue
  //           })

  //         } else if (key == 'd_dbValue' || key == 'd_dspvalue') {

  //           this.ListToEdit.push({
  //             databasevalue: element.d_dbvalue,
  //             displayvalue: element.d_dspvalue
  //           })

  //         }

  //       }
  //     });

  //     console.log(this.ListToEdit, "LLL");


  //     if (this.ListToEdit.length > 0) {

  //       this.fieldForm.addControl('List', this._fb.array([]));

  //       this.ListToEdit.forEach((item) => {

  //         this.List.push(this._fb.group({
  //           databaseValue: item.databasevalue,
  //           displayValue: item.displayvalue
  //         }));

  //       });

  //       if (this.fieldtype == 'dropdown') {
  //         this.isDropdown = true;
  //       } else if (this.fieldtype == 'radio') {
  //         this.isRadio = true;
  //       } else if (this.fieldtype == 'checkbox')
  //         this.isCheckbox = true;
  //     }

  //     this.modalRef = this.modalService.show(template, { class: 'gray modal-lg' });


  //   }, (err) => {
  //     console.log(err, "error while fetching fields data");
  //   })
  // }

  // onSelect1() {
  //   if (this.type.value == 'dropdown') {
  //     this.fieldForm.addControl('List', this._fb.array([]));
  //     this.isDropdown = true;
  //     this.isRadio = false;
  //     this.isCheckbox = false;

  //   } else if (this.type.value == 'radio') {
  //     this.fieldForm.addControl('List', this._fb.array([]));
  //     this.isRadio = true;
  //     this.isDropdown = false;
  //     this.isCheckbox = false;
  //   } else if (this.type.value == 'checkbox') {
  //     this.fieldForm.addControl('List', this._fb.array([]));
  //     this.isRadio = false;
  //     this.isDropdown = false;
  //     this.isCheckbox = true;
  //   } else {
  //     this.isDropdown = false;
  //     this.isRadio = false;
  //     this.isCheckbox = false;

  //   }
  // }


  // editFormSubmit() {

  //   this.fieldForm.value.f_uid = this.currentFieldId;
  //   console.log(this.fieldForm.value, "!!!");

  //   this._userService.editColumn(this.table_id, this.currentFieldId, this.fieldForm.value)
  //     .subscribe((response) => {
  //       this.displayArray.forEach((item, index) => {
  //         if (item.f_uid == this.currentFieldId) {
  //           this.displayArray.splice(index, 1);
  //           this.displayArray.push(this.fieldForm.value);
  //         }
  //       })
  //       this.modalRef.hide();
  //       this.messageService.add(
  //         { severity: 'success', detail: 'Success', summary: 'Field edited Successfully' });

  //     }, (errResponse) => {

  //       if (errResponse.error.code == 42804) {
  //         this.modalRef.hide();
  //         this.messageService.add(
  //           { severity: 'error', detail: 'Error', summary: 'Invalid FieldType Conversion' });
  //       }
  //       if (errResponse.error.code == '42P16') {
  //         this.modalRef.hide();
  //         this.messageService.add(
  //           { severity: 'error', detail: 'Error', summary: `Multiple Primary key not allowed` });
  //       }
  //       if (errResponse.error.code == 42701) {
  //         this.messageService.add(
  //           { key: 'buzz', severity: 'error', detail: 'Error', summary: `Field Name must be Unique` });
  //       }
  //       console.log(errResponse, "ERROR WHILE EDITING COLUMN");
  //     })

  // }

  // editCancel() {

  //   this.modalRef.hide();
  //   this.fieldForm.reset();
  //   this.constraints.setValue('false');
  //   this.isDropdown = false;
  //   this.isRadio = false;
  //   this.isCheckbox = false;

  //   const control3 = <FormArray>this.fieldForm.controls['List'];
  //   if (control3) {
  //     while (control3.length !== 0) {
  //       control3.removeAt(0);
  //     }
  //   }


  // }