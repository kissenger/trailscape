import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as globals from 'src/app/shared/globals';
import { TsCoordinate, TsElevationQuery } from 'src/app/shared/interfaces';

@Injectable()
export class HttpService {

  private DEBUG = true;
  private accessToken = globals.mapboxAccessToken;
  // private hostName = '192.168.0.12'
  private hostName = 'localhost';

  constructor( private http: HttpClient ) {}

  /********************************************************************************************
  *  Mapping queries
  ********************************************************************************************/
  mapboxDirectionsQuery(profile: string, start: TsCoordinate, end: TsCoordinate) {
    const coords: string =  start.lng.toFixed(6) + ',' + start.lat.toFixed(6) + ';' + end.lng.toFixed(6) + ',' + end.lat.toFixed(6);
    return this.http.get<any>('https://api.mapbox.com/directions/v5/mapbox/'
      + profile
      + '/'
      + coords
      + '?geometries=geojson&access_token='
      + this.accessToken);
  }

  myElevationsQuery(queryString: TsElevationQuery) {
    return this.http.post<any>('http://' + this.hostName + ':3000/ups-and-downs/v1/', queryString);
  }

  /********************************************************************************************
   *  calls to the backend
   ********************************************************************************************/
  importRoute(formData: Object) {
    return this.http.post<any>('http://' + this.hostName + ':3000/import-route/', formData);
  }

  saveCreatedRoute(pathData: Object) {
    return this.http.post<any>('http://' + this.hostName + ':3000/save-created-route/', pathData);
  }

  saveImportedPath(pathData: Object) {
    return this.http.post<any>('http://' + this.hostName + ':3000/save-imported-path/', pathData);
  }

  flushDatabase() {
    return this.http.post<any>('http://' + this.hostName + ':3000/flush/', '');
  }

  getPathsList(type: string, offset: number) {
    return this.http.get<any>('http://' + this.hostName + ':3000/get-paths-list/' + type + '/' + offset);
  }

  getPathById(type: string, id: string) {
    return this.http.get<any>('http://' + this.hostName + ':3000/get-path-by-id/' + type + '/' + id);
  }

  deletePath(id) {
    return this.http.delete<any>('http://' + this.hostName + ':3000/delete-path/' + 'route' + '/' + id);
  }

  getIntersectingRoutes(bbox: Array<number>) {
    let query = '?';
    bbox.forEach( (coord, index) => {
      query += 'bbox=' + coord;
       if (index !== bbox.length - 1) { query += '&'; }
    });
    return this.http.get<any>('http://' + this.hostName + ':3000/get-intersecting-routes/' + query);
  }

  exportToGpx(pathType: string, pathId: string) {
    return this.http.post<any>('http://' + this.hostName + ':3000/export-path/', {pathType, pathId});
  }

  downloadFile(fileName: string) {
    return this.http.get<any>('http://' + this.hostName + ':3000/download-file/' + fileName);
  }

  processPoints(coords: Array<TsCoordinate>, elevs?: Array<number> ) {
    return this.http.post<any>('http://' + this.hostName + ':3000/process-points/', {coords, elevs});
  }

  registerUser(userData) {
    return this.http.post<any>('http://localhost:3000/register/', userData);
  }

  loginUser(userData) {
    return this.http.post<any>('http://localhost:3000/login/', userData);
  }

  logoutUser() {
    localStorage.removeItem('token');
  }

  loggedIn() {
    return !!localStorage.getItem('token');   // double ! casts result to boolean
  }

  getToken() {
    return localStorage.getItem('token');
  }


}
