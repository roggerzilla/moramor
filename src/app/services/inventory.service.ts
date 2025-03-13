import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = 'http://127.0.0.1:8000/api/items';  // URL de la API de Laravel

  constructor(private http: HttpClient) {}

  addItem(item: any): Observable<any> {
    return this.http.post(this.apiUrl, item);
  }

  getItems(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  uploadImage(image: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/upload-image`, formData);
  }
}