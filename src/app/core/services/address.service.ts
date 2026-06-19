import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Address } from '../models/address.model';

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  private readonly addressUrl =
    `${environment.apiBaseUrl}/api/addresses`;

  constructor(private http: HttpClient) {}

  getAllAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(this.addressUrl);
  }
}