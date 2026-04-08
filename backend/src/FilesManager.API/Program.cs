using FilesManager.API.Extensions;
using FilesManager.API.Middleware;
using FilesManager.Infrastructure;
using Serilog;

// Configure Serilog early for startup logging
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", Serilog.Events.LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore", Serilog.Events.LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate: "[{Timestamp:yyyy-MM-dd HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

try
{
    Log.Information("Starting Administrador de Archivos API");

    var builder = WebApplication.CreateBuilder(args);

    // Use Serilog as the logging provider
    builder.Host.UseSerilog();

    // Add controllers
    builder.Services.AddControllers();

    // Add API Explorer for Swagger
    builder.Services.AddEndpointsApiExplorer();

    // Add Swagger documentation
    builder.Services.AddSwaggerDocumentation();

    // Add CORS policy
    builder.Services.AddCorsPolicy();

    // Add Application services (AutoMapper, FluentValidation)
    builder.Services.AddApplicationServices();

    // Add Infrastructure services (EF Core, Repositories)
    builder.Services.AddInfrastructure(builder.Configuration);

    var app = builder.Build();

    // Global exception handling middleware
    app.UseExceptionHandlingMiddleware();

    // Swagger is enabled in all environments
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Administrador de Archivos API v1");
        options.RoutePrefix = "swagger";
    });

    // Enable CORS
    app.UseCors("AllowAll");

    // Map controllers
    app.MapControllers();

    // Log startup information
    Log.Information("API configured successfully. Listening for requests...");

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
