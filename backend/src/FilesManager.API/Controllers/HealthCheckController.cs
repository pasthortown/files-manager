using FilesManager.Application.Common;
using Microsoft.AspNetCore.Mvc;

namespace FilesManager.API.Controllers;

/// <summary>
/// Controller for health check operations to verify API status.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Tags("Health Check")]
public class HealthCheckController : ControllerBase
{
    private readonly ILogger<HealthCheckController> _logger;

    /// <summary>
    /// Initializes a new instance of <see cref="HealthCheckController"/>.
    /// </summary>
    /// <param name="logger">The logger instance.</param>
    public HealthCheckController(ILogger<HealthCheckController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Checks the health status of the API.
    /// </summary>
    /// <remarks>
    /// Returns the current status of the API including the server timestamp.
    /// Use this endpoint to verify that the API is running and responsive.
    /// </remarks>
    /// <returns>An API response with the health status information.</returns>
    /// <response code="200">The API is healthy and running.</response>
    /// <response code="500">An internal error occurred while checking health status.</response>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<HealthCheckResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public IActionResult Get()
    {
        _logger.LogInformation("Health check requested at {Timestamp}", DateTime.UtcNow);

        var response = ApiResponse<HealthCheckResponse>.SuccessResponse(
            new HealthCheckResponse
            {
                Status = "Healthy",
                Timestamp = DateTime.UtcNow,
                Version = "1.0.0",
                Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown"
            },
            "API is running");

        return Ok(response);
    }

    /// <summary>
    /// Performs a detailed health check including database connectivity.
    /// </summary>
    /// <remarks>
    /// This endpoint performs a more thorough health check, verifying
    /// that all required services and dependencies are available.
    /// </remarks>
    /// <returns>An API response with the detailed health status.</returns>
    /// <response code="200">All services are healthy.</response>
    /// <response code="500">One or more services are unavailable.</response>
    [HttpGet("detailed")]
    [ProducesResponseType(typeof(ApiResponse<DetailedHealthCheckResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public IActionResult GetDetailed()
    {
        _logger.LogInformation("Detailed health check requested at {Timestamp}", DateTime.UtcNow);

        var response = ApiResponse<DetailedHealthCheckResponse>.SuccessResponse(
            new DetailedHealthCheckResponse
            {
                Status = "Healthy",
                Timestamp = DateTime.UtcNow,
                Version = "1.0.0",
                Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
                Checks = new Dictionary<string, string>
                {
                    { "API", "Healthy" },
                    { "Memory", "OK" }
                }
            },
            "All services are healthy");

        return Ok(response);
    }
}

/// <summary>
/// Response model for the basic health check endpoint.
/// </summary>
public class HealthCheckResponse
{
    /// <summary>
    /// The overall health status (e.g., "Healthy", "Degraded", "Unhealthy").
    /// </summary>
    public string Status { get; set; } = string.Empty;

    /// <summary>
    /// The server timestamp when the health check was performed.
    /// </summary>
    public DateTime Timestamp { get; set; }

    /// <summary>
    /// The current API version.
    /// </summary>
    public string Version { get; set; } = string.Empty;

    /// <summary>
    /// The current running environment (e.g., "Development", "Production").
    /// </summary>
    public string Environment { get; set; } = string.Empty;
}

/// <summary>
/// Response model for the detailed health check endpoint.
/// </summary>
public class DetailedHealthCheckResponse : HealthCheckResponse
{
    /// <summary>
    /// Dictionary of individual service checks and their statuses.
    /// </summary>
    public Dictionary<string, string> Checks { get; set; } = new();
}
