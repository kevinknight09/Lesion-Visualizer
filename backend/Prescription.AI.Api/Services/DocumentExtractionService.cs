using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.AspNetCore.Http;
using PdfiumViewer;
using Tesseract;

namespace Prescription.AI.Api.Services
{
    public interface IDocumentExtractionService
    {
        Task<string> ExtractTextAsync(IFormFile file);
    }

    public class DocumentExtractionService : IDocumentExtractionService
    {
        private readonly string _tessDataPath;

        public DocumentExtractionService()
        {
            // tessdata is copied to the output directory
            _tessDataPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "tessdata");
        }

        public async Task<string> ExtractTextAsync(IFormFile file)
        {
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            memoryStream.Position = 0;

            return extension switch
            {
                ".docx" => ExtractFromDocx(memoryStream),
                ".pdf" => ExtractFromPdf(memoryStream),
                _ => throw new NotSupportedException($"File extension {extension} is not supported.")
            };
        }

        private string ExtractFromDocx(Stream stream)
        {
            using var wordDoc = WordprocessingDocument.Open(stream, false);
            var body = wordDoc.MainDocumentPart?.Document.Body;
            return body?.InnerText ?? string.Empty;
        }

        private string ExtractFromPdf(Stream stream)
        {
            using var document = PdfDocument.Load(stream);
            var sb = new StringBuilder();
            bool hasText = false;

            // Attempt native text extraction
            for (int i = 0; i < document.PageCount; i++)
            {
                var text = document.GetPdfText(i);
                if (!string.IsNullOrWhiteSpace(text))
                {
                    sb.AppendLine(text);
                    hasText = true;
                }
            }

            // If no text was found, perform OCR
            if (!hasText)
            {
                return PerformOcrOnPdf(document);
            }

            return sb.ToString();
        }

        private string PerformOcrOnPdf(PdfDocument document)
        {
            var sb = new StringBuilder();
            using var engine = new TesseractEngine(_tessDataPath, "eng", EngineMode.Default);
            
            for (int i = 0; i < document.PageCount; i++)
            {
                // Render page to an image. Using 300 DPI for good OCR quality
                using var image = document.Render(i, 300, 300, PdfRenderFlags.CorrectFromDpi);
                
                // Tesseract requires a Pix object or we can use Bitmap/MemoryStream if using Pix.LoadFromMemory
                // Save the rendered Image to a memory stream
                using var ms = new MemoryStream();
                image.Save(ms, System.Drawing.Imaging.ImageFormat.Png);
                var imgBytes = ms.ToArray();
                
                using var pix = Pix.LoadFromMemory(imgBytes);
                using var page = engine.Process(pix);
                
                sb.AppendLine(page.GetText());
            }

            return sb.ToString();
        }
    }
}
