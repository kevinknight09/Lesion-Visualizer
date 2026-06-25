using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Prescription.AI.Api.Services;

namespace Prescription.AI.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ScanReportController : ControllerBase
    {
        private readonly IDocumentExtractionService _documentExtractionService;
        private readonly IAiService _aiService;

        public ScanReportController(
            IDocumentExtractionService documentExtractionService,
            IAiService aiService)
        {
            _documentExtractionService = documentExtractionService;
            _aiService = aiService;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadScanReport(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            try
            {
                // 1. Extract raw text from the uploaded document
                var extractedText = await _documentExtractionService.ExtractTextAsync(file);

                if (string.IsNullOrWhiteSpace(extractedText))
                {
                    return BadRequest("Failed to extract any text from the document.");
                }

                // 2. Send the extracted text to Ollama phi3 for JSON extraction
                var jsonResult = await _aiService.AnalyzeScanReportAsync(extractedText);

                // Deserialize into our strongly-typed DTO
                var resultDto = System.Text.Json.JsonSerializer.Deserialize<Models.ScanAnalysisResult>(jsonResult);

                // Return the strongly-typed DTO to the client
                return Ok(resultDto);
            }
            catch (NotSupportedException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                // Log exception here in production
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
