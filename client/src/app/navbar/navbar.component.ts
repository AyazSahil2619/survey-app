import { Component, OnInit, TemplateRef } from '@angular/core';
import { AuthService } from '../auth.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { OverviewComponent } from '../overview/overview.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(public auth: AuthService,
    private modalService: BsModalService,
  ) { }

  ngOnInit() {
  }

  modalRef: BsModalRef;
  show: boolean;

  openNav() {
    this.show = true;
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
  }


  closeNav() {
    this.show = false;
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
  }


  overView(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(OverviewComponent, { class: 'gray modal-lg', backdrop: 'static' });
  }
}
