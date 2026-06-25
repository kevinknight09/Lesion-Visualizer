using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Prescription.AI.Api.Services;

public class LocalOllamaAiService : IAiService
{
    private readonly HttpClient _httpClient;
    private readonly string _ollamaEndpoint = "http://localhost:11434/api/generate";

    public LocalOllamaAiService(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _httpClient.Timeout = TimeSpan.FromMinutes(5); // Local LLM might take a while
    }


    public async Task<string> AnalyzeScanReportAsync(string extractedText)
    {
        var requestBody = new
        {
            model = "phi3",
            prompt = $"You are a strict medical AI extractor. Read the following medical report text and extract the lesion data. For 'location', you MUST explicitly include the primary organ name (e.g. 'liver', 'kidney') alongside any specific regions (e.g. 'right lobe of the liver'). Output MUST be valid JSON exactly matching this schema: {{\"presence\": boolean, \"location\": \"string\", \"size\": \"string\"}}. If not found, use false or \"Unknown\".\n\nReport Text:\n{extractedText}",
            stream = false,
            format = "json"
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync(_ollamaEndpoint, content);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception($"Ollama API returned {response.StatusCode}: {error}");
        }

        var responseString = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<OllamaResponse>(responseString);

        return result?.Response ?? "{\"presence\": false, \"location\": \"Unknown\", \"size\": \"Unknown\"}";
    }

    private class OllamaResponse
    {
        [JsonPropertyName("response")]
        public string? Response { get; set; }
    }
}
