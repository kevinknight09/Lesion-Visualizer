import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ScanAnalysisResult } from './models/scan-analysis-result.model';



@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = '/api/prescription'; // proxy will forward to backend
  private readonly uploadUrl = '/api/ScanReport/upload';

  constructor(private http: HttpClient) { }

  uploadDocument(file: File): Observable<ScanAnalysisResult> {
    const formData = new FormData();

    formData.append('file', file)

    return this.http.post<ScanAnalysisResult>(this.uploadUrl, formData)
  }
}
