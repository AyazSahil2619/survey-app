import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { environment } from '../environments/environment'
import 'rxjs/Rx'
@Injectable()
export class UserServiceService {

  constructor(private _http: HttpClient) { }

  registration(body): Observable<any> {
    return this._http.post(`${environment.ip}/register`, body, { withCredentials: true });
  }

  login(body): Observable<any> {
    console.log(body, "BODY");
    return this._http.post(`${environment.ip}/login`, body, { withCredentials: true });
  }

  fetchMastertableData(): Observable<any> {
    return this._http.get(`${environment.ip}/getdata`, { withCredentials: true });
  }

  delete(id): Observable<any> {
    return this._http.delete(`${environment.ip}/delete/` + id, { withCredentials: true });
  }

  loggedout(): Observable<any> {
    return this._http.get(`${environment.ip}/loggedout`, { withCredentials: true });
  }

  checkTablename(tablename, tableid): Observable<any> {
    if (tableid == null) {
      tableid = 0;
    }
    console.log(tableid, "LLLL")
    return this._http.post(`${environment.ip}/checkTablename/` + tableid, tablename, { withCredentials: true })
  }

  createTable(data): Observable<any> {
    return this._http.post(`${environment.ip}/create`, data, { withCredentials: true });
  }

  addColumn(tableid, data): Observable<any> {
    console.log(tableid, data);
    return this._http.put(`${environment.ip}/addColumn/` + tableid, data, { withCredentials: true })
  }

  tablename(tableid): Observable<any> {
    console.log(tableid, "LLL")
    return this._http.get(`${environment.ip}/tablename/` + tableid, { withCredentials: true });
  }

  getById(tableid): Observable<any> {
    return this._http.get(`${environment.ip}/view/` + tableid, { withCredentials: true });
  }

  tableData(tableid): Observable<any> {
    return this._http.get(`${environment.ip}/fetchdata/` + tableid, { withCredentials: true });
  }

  insertData(tableid, data): Observable<any> {
    return this._http.put(`${environment.ip}/update/` + tableid, data, { withCredentials: true })
  }

  modified(tableid, data): Observable<any> {
    return this._http.put(`${environment.ip}/modified/` + tableid, data, { withCredentials: true })
  }

  deleteRow(tableid, rowid): Observable<any> {
    return this._http.delete(`${environment.ip}/deletedata/` + tableid + '/' + rowid, { withCredentials: true });
  }

  dataToEdit(tableid, rowid): Observable<any> {
    return this._http.get(`${environment.ip}/updatedata/` + tableid + '/' + rowid, { withCredentials: true })
  }

  tableRowEdit(tableid, data): Observable<any> {
    return this._http.put(`${environment.ip}/updaterow/` + tableid, data, { withCredentials: true })
  }

  tableInfo(tableid): Observable<any> {
    return this._http.get(`${environment.ip}/tableData/` + tableid, { withCredentials: true })
  }

  editTableInfo(tableid, data): Observable<any> {
    return this._http.put(`${environment.ip}/editTableInfo/` + tableid, data, { withCredentials: true })
  }

  editTable(tableid, newColumnDetails) {
    return this._http.put(`${environment.ip}/editTable/` + tableid, newColumnDetails, { withCredentials: true })
  }
  fetchddValue(tableid) {
    return this._http.get(`${environment.ip}/dropdown/` + tableid, { withCredentials: true })
  }
  fetchradioValue(tableid): Observable<any> {
    return this._http.get(`${environment.ip}/radio/` + tableid, { withCredentials: true })
  }
  fetchcheckboxValue(tableid): Observable<any> {
    return this._http.get(`${environment.ip}/checkbox/` + tableid, { withCredentials: true })
  }
  // checkTablenameforUpdate(tableid, tablename): Observable<any> {
  //   return this._http.post(`${environment.ip}/checkTablenameforUpdate/` + tableid, tablename, { withCredentials: true })
  // }
  fetchFieldData(tableid, field_id) {
    return this._http.get(`${environment.ip}/fields/` + tableid + '/' + field_id, { withCredentials: true });
  }
  editColumn(tableid, field_id, data): Observable<any> {
    console.log(tableid, data);
    return this._http.put(`${environment.ip}/fieldEdit/` + tableid + '/' + field_id, data, { withCredentials: true })
  }
  deleteField(tableid, field_id): Observable<any> {
    return this._http.delete(`${environment.ip}/fieldDelete/` + tableid + '/' + field_id, { withCredentials: true })
  }
  generateUrl(data): Observable<any> {
    console.log(data, "DATA");
    return this._http.post(`${environment.ip}/generateUrl`, data, { withCredentials: true });
  }
  sendMail(data): Observable<any> {
    return this._http.post(`${environment.ip}/sendMail`, data, { withCredentials: true });
  }
  checkToken(tableid, token): Observable<any> {
    return this._http.get(`${environment.ip}/checkToken/` + tableid + '/' + token, { withCredentials: true })
  }

  upload(file): Observable<any> {

    console.log(file, typeof file, "IN service");
    const formData: FormData = new FormData();
    for (var i = 0; i < file.length; i++) {
      // formData.append("file", file[i]);  
      formData.append("file", file[i], file[i]['name']);
      // formData.append("f_uid", (file[i].f_uid).toString(), file[i]['name']);
      // formData.append("table_id", file[i].table_id, file[i]['name']);

    }
    console.log(formData, "FORMDATA");
    // formdata.append('file', file);
    return this._http.post(`${environment.ip}/upload`, formData, { withCredentials: true });
  }

  fetchFile(filename): Observable<any> {

    return this._http.get(`${environment.ip}/fetchFile/` + filename, {
      withCredentials: true,
      responseType: 'blob',
      headers: new HttpHeaders().append('Content-Type', 'application/json'),
    });

  }

  headerData(tableid): Observable<any> {
    return this._http.head(`${environment.ip}/headerData/` + tableid, { withCredentials: true });
  }


}



  // createTable(data): Observable<any> {
  //   return this._http.post('http://192.1.200.134:8080/create', data, { withCredentials: true });
  // }