import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class UserServiceService {

  constructor(private _http: HttpClient) { }

  registration(body): Observable<any> {
    return this._http.post('http://192.1.200.134:8080/register', body, { withCredentials: true });
  }

  login(body): Observable<any> {
    return this._http.post('http://192.1.200.134:8080/login', body, { withCredentials: true });
  }

  fetchMastertableData(): Observable<any> {
    return this._http.get('http://192.1.200.134:8080/getdata', { withCredentials: true });
  }

  delete(id): Observable<any> {
    return this._http.delete('http://192.1.200.134:8080/delete/' + id, { withCredentials: true });
  }

  loggedout(): Observable<any> {
    return this._http.get('http://192.1.200.134:8080/loggedout', { withCredentials: true });
  }

  checkTablename(tablename): Observable<any> {
    return this._http.post('http://192.1.200.134:8080/checkTablename', tablename, { withCredentials: true })
  }

  createTable(data): Observable<any> {
    return this._http.post('http://192.1.200.134:8080/create', data, { withCredentials: true });
  }

  addColumn(tableid, data): Observable<any> {
    console.log(tableid, data);
    return this._http.put('http://192.1.200.134:8080/addColumn/' + tableid, data, { withCredentials: true })
  }

  tablename(tableid): Observable<any> {
    console.log(tableid, "LLL")
    return this._http.get('http://192.1.200.134:8080/tablename/' + tableid, { withCredentials: true });
  }

  getById(tableid): Observable<any> {
    return this._http.get('http://192.1.200.134:8080/view/' + tableid, { withCredentials: true });
  }

  tableData(tableid): Observable<any> {
    return this._http.get('http://192.1.200.134:8080/fetchdata/' + tableid, { withCredentials: true });
  }

  insertData(tableid, data): Observable<any> {
    return this._http.put('http://192.1.200.134:8080/update/' + tableid, data, { withCredentials: true })
  }

  modified(tableid, data): Observable<any> {
    return this._http.put('http://192.1.200.134:8080/modified/' + tableid, data, { withCredentials: true })
  }

  deleteRow(tableid, rowid): Observable<any> {
    return this._http.delete('http://192.1.200.134:8080/deletedata/' + tableid + '/' + rowid, { withCredentials: true });
  }

  dataToEdit(tableid, rowid): Observable<any> {
    return this._http.get('http://192.1.200.134:8080/updatedata/' + tableid + '/' + rowid, { withCredentials: true })
  }

  tableRowEdit(tableid, data): Observable<any> {
    return this._http.put('http://192.1.200.134:8080/updaterow/' + tableid, data, { withCredentials: true })
  }

  tableInfo(tableid): Observable<any> {
    return this._http.get('http://192.1.200.134:8080/tableData/' + tableid, { withCredentials: true })
  }

  editTableInfo(tableid, data): Observable<any> {
    return this._http.put('http://192.1.200.134:8080/editTableInfo/' + tableid, data, { withCredentials: true })
  }

  editTable(tableid, newColumnDetails) {
    return this._http.put('http://192.1.200.134:8080/editTable/' + tableid, newColumnDetails, { withCredentials: true })
  }
  fetchddValue(tableid) {
    return this._http.get('http://192.1.200.134:8080/dropdown/' + tableid, { withCredentials: true })
  }
  fetchradioValue(tableid): Observable<any> {
    return this._http.get('http://192.1.200.134:8080/radio/' + tableid, { withCredentials: true })
  }
  fetchcheckboxValue(tableid): Observable<any> {
    return this._http.get('http://192.1.200.134:8080/checkbox/' + tableid, { withCredentials: true })
  }
  checkTablenameforUpdate(tableid, tablename): Observable<any> {
    return this._http.post('http://192.1.200.134:8080/checkTablenameforUpdate/' + tableid, tablename, { withCredentials: true })
  }
  fetchFieldData(tableid, field_id) {
    return this._http.get('http://192.1.200.134:8080/fields/' + tableid + '/' + field_id, { withCredentials: true });
  }
  editColumn(tableid, field_id, data): Observable<any> {
    console.log(tableid, data);
    return this._http.put('http://192.1.200.134:8080/fieldEdit/' + tableid + '/' + field_id, data, { withCredentials: true })
  }
  deleteField(tableid, field_id): Observable<any> {
    return this._http.delete('http://192.1.200.134:8080/fieldDelete/' + tableid + '/' + field_id, { withCredentials: true })
  }
}









  // createTable(data): Observable<any> {
  //   return this._http.post('http://192.1.200.134:8080/create', data, { withCredentials: true });
  // }