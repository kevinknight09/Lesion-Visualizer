namespace Prescription.AI.Api.Services;

public interface IAiService
{
    Task<string> AnalyzeScanReportAsync(string extractedText);
}
