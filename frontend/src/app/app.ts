import { Component, signal } from '@angular/core';
import { ApiService } from './api.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ScanAnalysisResult } from './models/scan-analysis-result.model';
import { Viewer } from './viewer/viewer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, Viewer],
  providers: [],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  // UI state using Angular Signals (guarantees UI updates)
  protected readonly title = signal('Lesion 3D Visualizer');
  public lesionData = signal<ScanAnalysisResult | undefined>(undefined);
  public isLoading = signal(false);
  public errorMessage = signal('');

  constructor(private apiService: ApiService) { }

  public onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    // Clear previous results
    this.lesionData.set(undefined);

    this.apiService.uploadDocument(file).subscribe({
      next: (result) => {
        // Update signals, which instantly triggers the UI to refresh
        this.lesionData.set(result);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Failed to analyze document. Is the C# backend running?');
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }
}
