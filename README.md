# Lesion 3D Visualizer

<p align="left">
  <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular" />
  <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/.NET-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" alt=".NET" />
  <img src="https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=c-sharp&logoColor=white" alt="C#" />
  <img src="https://img.shields.io/badge/Ollama-FFFFFF?style=for-the-badge&logo=ollama&logoColor=black" alt="Ollama" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>
A full-stack monorepo application that analyzes medical scan reports (PDF or DOCX), extracts lesion data using a local AI model, and visually highlights the affected organ on an interactive 3D human anatomy model.

## 🚀 Overview

The **Lesion 3D Visualizer** simplifies the comprehension of complex medical scan reports by bridging the gap between text diagnostics and visual representation. When a medical report is uploaded, the system performs OCR (if needed), uses a local Large Language Model (Ollama) to parse out critical lesion details, and then updates an interactive Three.js canvas to pinpoint the exact organ.

### Key Features
- **Document Processing**: Upload `.pdf` or `.docx` medical reports. 
- **OCR Support**: Built-in Tesseract OCR for parsing scanned PDF documents.
- **Local AI Analysis**: Utilizes [Ollama](https://ollama.com/) (running the `phi3` model) locally for secure, offline extraction of lesion presence, size, and location.
- **Dynamic 3D Visualization**: An Angular-powered interface using Three.js to map the extracted text directly onto a 3D model, applying visual highlights to the identified organ (e.g., Liver, Kidney, Lungs).

## 🏗️ Architecture

The project is structured as a monorepo containing both the frontend and the backend.

### `/backend` (C# .NET Web API)
- Built with **.NET**.
- Uses **PdfiumViewer** and **Tesseract** to extract text from documents.
- Communicates with a local Ollama instance to analyze the extracted text.
- Returns a structured JSON result: `{"presence": true, "location": "liver", "size": "2cm"}`.

### `/frontend` (Angular & Three.js)
- Built with **Angular**.
- Provides a clean UI for document uploading.
- Uses **Three.js** (`OrbitControls`, `GLTFLoader`) to render a `.glb` human anatomy model.
- Dynamically searches the 3D model's meshes to find and highlight the organ identified by the backend AI.

---

## 🛠️ Prerequisites

To run this project locally, ensure you have the following installed:

1. **[Node.js](https://nodejs.org/)** (v18+) & npm (for the frontend).
2. **[.NET SDK](https://dotnet.microsoft.com/download)** (v8.0+ recommended) (for the backend).
3. **[Ollama](https://ollama.com/)** running locally.
4. You must pull the `phi3` model via Ollama:
   ```bash
   ollama run phi3
   ```

---

## ⚙️ Setup & Running

### 1. Start the Backend API

1. Open a terminal and navigate to the backend API directory:
   ```bash
   cd backend/Prescription.AI.Api
   ```
2. Ensure you have the Tesseract language data files. The project expects a `tessdata` folder containing `eng.traineddata` in the output directory.
3. Run the API:
   ```bash
   dotnet run
   ```
   *The backend typically runs on `https://localhost:7142` or `http://localhost:5142`. Ensure the Ollama server is also running in the background on port `11434`.*

### 2. Start the Frontend Application

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Add the 3D model. Make sure you place a valid `human_anatomy.glb` file into the frontend assets directory:
   ```
   frontend/src/assets/models/human_anatomy.glb
   ```
4. Start the Angular development server:
   ```bash
   npm start
   ```
   *(or `ng serve`)*
5. Open your browser to `http://localhost:4200`.

---

## ⚠️ Disclaimer
**FOR EDUCATIONAL PURPOSES ONLY**
This tool is a demonstration prototype and is not certified for clinical use or diagnostic decision making. All AI analysis is performed using a local, non-specialized language model and may produce inaccurate results.
