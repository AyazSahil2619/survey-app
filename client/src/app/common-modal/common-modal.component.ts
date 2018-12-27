import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-common-modal',
  templateUrl: './common-modal.component.html',
  styleUrls: ['./common-modal.component.css']
})
export class CommonModalComponent implements OnInit {

  title: String;
  public onClose: Subject<boolean>;
  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {
    this.onClose = new Subject();
  }

  public confirm(): void {
    this.onClose.next(true);
    // this.bsModalRef.hide();

  }

  public decline(): void {
    this.onClose.next(false);
    // this.bsModalRef.hide();
  }

}


