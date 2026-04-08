using System.Reflection;
using FilesManager.Application.Mappings;
using FluentValidation;
using Microsoft.OpenApi.Models;

namespace FilesManager.API.Extensions;

/// <summary>
/// Extension methods for configuring dependency injection and application services.
/// </summary>
public static class ServiceExtensions
{
    /// <summary>
    /// Adds and configures Swagger/OpenAPI documentation.
    /// </summary>
    /// <param name="services">The service collection.</param>
    /// <returns>The updated service collection.</returns>
    public static IServiceCollection AddSwaggerDocumentation(this IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Administrador de Archivos API",
                Version = "v1",
                Description = "API para el sistema Administrador de Archivos. Proporciona endpoints para la gestion integral de archivos.",
                Contact = new OpenApiContact
                {
                    Name = "Equipo de Desarrollo",
                    Email = "dev@filesmanager.com"
                },
                License = new OpenApiLicense
                {
                    Name = "Uso Interno"
                }
            });

            // Include XML comments from the API project
            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            if (File.Exists(xmlPath))
            {
                options.IncludeXmlComments(xmlPath);
            }
        });

        return services;
    }

    /// <summary>
    /// Adds and configures CORS policy for development.
    /// </summary>
    /// <param name="services">The service collection.</param>
    /// <returns>The updated service collection.</returns>
    public static IServiceCollection AddCorsPolicy(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", builder =>
            {
                builder
                    .AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader();
            });
        });

        return services;
    }

    /// <summary>
    /// Adds application layer services (AutoMapper, FluentValidation, etc.).
    /// </summary>
    /// <param name="services">The service collection.</param>
    /// <returns>The updated service collection.</returns>
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // AutoMapper
        services.AddAutoMapper(typeof(MappingProfile).Assembly);

        // FluentValidation - register all validators from Application assembly
        services.AddValidatorsFromAssembly(typeof(MappingProfile).Assembly);

        // Register application services here as they are created
        // Example: services.AddScoped<IFileService, FileService>();

        return services;
    }
}
