using System.Net;
using System.Text.Json;
using FilesManager.Application.Common;
using FilesManager.Domain.Exceptions;

namespace FilesManager.API.Middleware;

/// <summary>
/// Global exception handling middleware that catches unhandled exceptions
/// and returns standardized API error responses.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    /// <summary>
    /// Initializes a new instance of <see cref="ExceptionHandlingMiddleware"/>.
    /// </summary>
    /// <param name="next">The next middleware in the pipeline.</param>
    /// <param name="logger">The logger instance.</param>
    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    /// <summary>
    /// Invokes the middleware to handle exceptions globally.
    /// </summary>
    /// <param name="context">The HTTP context.</param>
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, message) = exception switch
        {
            DomainException domainEx => (HttpStatusCode.BadRequest, domainEx.Message),
            KeyNotFoundException => (HttpStatusCode.NotFound, "The requested resource was not found."),
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "You are not authorized to access this resource."),
            ArgumentException argEx => (HttpStatusCode.BadRequest, argEx.Message),
            _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred. Please try again later.")
        };

        context.Response.StatusCode = (int)statusCode;

        var response = ApiResponse<object>.FailureResponse(
            message,
            new List<string> { exception.Message });

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var jsonResponse = JsonSerializer.Serialize(response, jsonOptions);
        await context.Response.WriteAsync(jsonResponse);
    }
}

/// <summary>
/// Extension methods for registering the exception handling middleware.
/// </summary>
public static class ExceptionHandlingMiddlewareExtensions
{
    /// <summary>
    /// Adds the global exception handling middleware to the application pipeline.
    /// </summary>
    /// <param name="app">The application builder.</param>
    /// <returns>The application builder for chaining.</returns>
    public static IApplicationBuilder UseExceptionHandlingMiddleware(this IApplicationBuilder app)
    {
        return app.UseMiddleware<ExceptionHandlingMiddleware>();
    }
}
