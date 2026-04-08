using FilesManager.Application.Interfaces;
using FilesManager.Application.Services;
using FilesManager.Domain.Interfaces.Repositories;
using FilesManager.Infrastructure.Persistence.Context;
using FilesManager.Infrastructure.Persistence.Repositories;
using FilesManager.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FilesManager.Infrastructure;

/// <summary>
/// Extension methods for registering infrastructure services in the DI container.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Adds infrastructure services to the specified <see cref="IServiceCollection"/>.
    /// </summary>
    /// <param name="services">The service collection.</param>
    /// <param name="configuration">The application configuration.</param>
    /// <returns>The updated service collection.</returns>
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Register Entity Framework Core with SQL Server
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                sqlOptions =>
                {
                    sqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                    sqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 3,
                        maxRetryDelay: TimeSpan.FromSeconds(10),
                        errorNumbersToAdd: null);
                }));

        // Register repositories
        services.AddScoped<IArchivoRepository, ArchivoRepository>();

        // Register application services
        services.AddScoped<IArchivoService, ArchivoService>();

        // Register trainer HTTP client
        var trainerUrl = configuration.GetValue<string>("TrainerService:BaseUrl") ?? "http://172.16.5.42:8000";
        services.AddHttpClient<ITrainerService, TrainerService>(client =>
        {
            client.BaseAddress = new Uri(trainerUrl);
            client.Timeout = TimeSpan.FromSeconds(30);
        });

        return services;
    }
}
