using System.Text.Json.Serialization;

namespace Prescription.AI.Api.Models
{
    public class ScanAnalysisResult
    {
        [JsonPropertyName("presence")]
        public bool Presence { get; set; }

        [JsonPropertyName("location")]
        public string? Location { get; set; }

        [JsonPropertyName("size")]
        public string? Size { get; set; }
    }
}
