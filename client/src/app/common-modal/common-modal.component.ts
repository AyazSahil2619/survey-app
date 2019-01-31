import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';


import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';


@Component({
  selector: 'app-common-modal',
  templateUrl: './common-modal.component.html',
  styleUrls: ['./common-modal.component.css']
})
export class CommonModalComponent implements OnInit {

  fieldForm: FormGroup;

  title: String;
  template: String;
  public onClose: Subject<boolean>;
  constructor(
    private _fb: FormBuilder,
    public bsModalRef: BsModalRef
  ) { }

  ngOnInit() {
    this.onClose = new Subject();
    // this.formInitialization();
  }



  // formInitialization() {
  //   this.fieldForm = this._fb.group(
  //     {
  //       'colname': ['', Validators.required],
  //       'label': ['', Validators.required],
  //       'type': ['', Validators.required],
  //       'constraints': ['false', Validators.required],
  //       'unique_key': ['false', Validators.required],
  //       'required_key': ['true', Validators.required],
  //       'text_length': ['null', Validators.required],
  //       'rating': ['null', Validators.required],
  //       'm_editor': ['false', Validators.required]
  //       // 'fileSize': ['null', Validators.required]

  //     }
  //   )
  // }


  // get colname() { return this.fieldForm.get('colname') }
  // get label() { return this.fieldForm.get('label') }
  // get type() { return this.fieldForm.get('type') }
  // get constraints() { return this.fieldForm.get('constraints') }
  // get unique_key() { return this.fieldForm.get('unique_key') }
  // get required_key() { return this.fieldForm.get('required_key') }
  // get text_length() { return this.fieldForm.get('text_length') }
  // get rating() { return this.fieldForm.get('rating') }
  // get m_editor() { return this.fieldForm.get('m_editor') }


  // get arrayList() { return this.fieldForm.get('arrayList') as FormArray }


  public confirm(): void {
    this.onClose.next(true);
    // this.bsModalRef.hide();

  }

  public decline(): void {
    this.onClose.next(false);
    // this.bsModalRef.hide();
  }

}


