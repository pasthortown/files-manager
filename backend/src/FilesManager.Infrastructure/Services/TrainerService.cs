using System.Text;
using System.Text.Json;
using FilesManager.Application.DTOs.Requests;
using FilesManager.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace FilesManager.Infrastructure.Services;

/// <summary>
/// HTTP client implementation for communicating with the Python trainer service.
/// </summary>
public class TrainerService : ITrainerService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<TrainerService> _logger;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    /// <summary>
    /// Initializes a new instance of <see cref="TrainerService"/>.
    /// </summary>
    public TrainerService(HttpClient httpClient, ILogger<TrainerService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task SendToTrainerAsync(IEnumerable<TrainerFileRequest> files)
    {
        var payload = new { files };
        var json = JsonSerializer.Serialize(payload, JsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        try
        {
            var response = await _httpClient.PostAsync("/train", content);
            _logger.LogInformation("Trainer response: {StatusCode}", response.StatusCode);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send files to trainer service.");
        }
    }
}
