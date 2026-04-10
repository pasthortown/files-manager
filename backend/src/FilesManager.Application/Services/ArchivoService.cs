using AutoMapper;
using FilesManager.Application.Common;
using FilesManager.Application.DTOs.Requests;
using FilesManager.Application.DTOs.Responses;
using FilesManager.Application.Interfaces;
using FilesManager.Domain.Entities;
using FilesManager.Domain.Interfaces.Repositories;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace FilesManager.Application.Services;

/// <summary>
/// Service implementation for managing Archivo (file) operations.
/// Files are received as base64 and stored on disk with UID-based names.
/// </summary>
public class ArchivoService : IArchivoService
{
    private readonly IArchivoRepository _archivoRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<ArchivoService> _logger;
    private readonly ITrainerService _trainerService;
    private readonly string _basePath;

    public ArchivoService(
        IArchivoRepository archivoRepository,
        IMapper mapper,
        ILogger<ArchivoService> logger,
        IConfiguration configuration,
        ITrainerService trainerService)
    {
        _archivoRepository = archivoRepository;
        _mapper = mapper;
        _logger = logger;
        _trainerService = trainerService;
        _basePath = configuration.GetValue<string>("FileStorage:BasePath") ?? "/app/uploaded";
    }

    /// <inheritdoc />
    public async Task<ApiResponse<ArchivoResponse>> GetByIdAsync(Guid id)
    {
        var archivo = await _archivoRepository.GetByIdAsync(id);

        if (archivo is null)
        {
            return ApiResponse<ArchivoResponse>.FailureResponse(
                $"No se encontro el archivo con ID '{id}'.");
        }

        var response = _mapper.Map<ArchivoResponse>(archivo);
        return ApiResponse<ArchivoResponse>.SuccessResponse(response, "Archivo obtenido exitosamente.");
    }

    /// <inheritdoc />
    public async Task<ApiResponse<IEnumerable<ArchivoResponse>>> GetAllAsync()
    {
        var archivos = await _archivoRepository.GetAllAsync();
        var response = _mapper.Map<IEnumerable<ArchivoResponse>>(archivos);
        return ApiResponse<IEnumerable<ArchivoResponse>>.SuccessResponse(response, "Archivos obtenidos exitosamente.");
    }

    /// <inheritdoc />
    public async Task<ApiResponse<ArchivoResponse>> CreateAsync(CreateArchivoRequest request)
    {
        // Decode base64 to bytes
        byte[] fileBytes;
        try
        {
            fileBytes = Convert.FromBase64String(request.ArchivoBase64);
        }
        catch (FormatException)
        {
            return ApiResponse<ArchivoResponse>.FailureResponse(
                "El contenido del archivo no es un base64 valido.",
                new List<string> { "ArchivoBase64 tiene un formato invalido." });
        }

        // Ensure base directory exists
        Directory.CreateDirectory(_basePath);

        // Generate UID-based file name to avoid path length issues
        var extension = Path.GetExtension(request.NombreArchivo);
        var uidFileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(_basePath, uidFileName);

        // Save the file to disk
        await File.WriteAllBytesAsync(filePath, fileBytes);
        _logger.LogInformation("File saved to disk at {FilePath}", filePath);

        // Create the entity
        var archivo = _mapper.Map<Archivo>(request);
        archivo.Path = filePath;

        var created = await _archivoRepository.AddAsync(archivo);

        var response = _mapper.Map<ArchivoResponse>(created);
        return ApiResponse<ArchivoResponse>.SuccessResponse(response, "Archivo creado exitosamente.");
    }

    /// <inheritdoc />
    public async Task<ApiResponse<ArchivoResponse>> UpdateAsync(Guid id, UpdateArchivoRequest request)
    {
        var archivo = await _archivoRepository.GetByIdAsync(id);

        if (archivo is null)
        {
            return ApiResponse<ArchivoResponse>.FailureResponse(
                $"No se encontro el archivo con ID '{id}'.");
        }

        // Update metadata fields if provided
        if (!string.IsNullOrWhiteSpace(request.Nombre))
        {
            archivo.Nombre = request.Nombre;
        }

        if (request.Descripcion is not null)
        {
            archivo.Descripcion = request.Descripcion;
        }

        if (request.Observaciones is not null)
        {
            archivo.Observaciones = request.Observaciones;
        }

        if (request.Contexto is not null)
        {
            archivo.Contexto = request.Contexto;
        }

        // Replace the file on disk if a new base64 is provided
        if (!string.IsNullOrWhiteSpace(request.ArchivoBase64))
        {
            byte[] fileBytes;
            try
            {
                fileBytes = Convert.FromBase64String(request.ArchivoBase64);
            }
            catch (FormatException)
            {
                return ApiResponse<ArchivoResponse>.FailureResponse(
                    "El contenido del archivo no es un base64 valido.");
            }

            // Delete old file from disk
            if (File.Exists(archivo.Path))
            {
                File.Delete(archivo.Path);
                _logger.LogInformation("Old file deleted from disk at {FilePath}", archivo.Path);
            }

            // Save new file with UID name
            Directory.CreateDirectory(_basePath);
            var extension = Path.GetExtension(request.NombreArchivo ?? ".bin");
            var uidFileName = $"{Guid.NewGuid()}{extension}";
            var newFilePath = Path.Combine(_basePath, uidFileName);

            await File.WriteAllBytesAsync(newFilePath, fileBytes);
            archivo.Path = newFilePath;
            _logger.LogInformation("New file saved to disk at {FilePath}", newFilePath);
        }

        await _archivoRepository.UpdateAsync(archivo);

        var response = _mapper.Map<ArchivoResponse>(archivo);
        return ApiResponse<ArchivoResponse>.SuccessResponse(response, "Archivo actualizado exitosamente.");
    }

    /// <inheritdoc />
    public async Task<ApiResponse<bool>> DeleteAsync(Guid id)
    {
        var archivo = await _archivoRepository.GetByIdAsync(id);

        if (archivo is null)
        {
            return ApiResponse<bool>.FailureResponse(
                $"No se encontro el archivo con ID '{id}'.");
        }

        // Delete ChromaDB data if present
        if (!string.IsNullOrWhiteSpace(archivo.ChromaDbIds))
        {
            var chromaIds = archivo.ChromaDbIds.Split(',', StringSplitOptions.RemoveEmptyEntries);
            try
            {
                await _trainerService.DeleteMemoryAsync(chromaIds);
                _logger.LogInformation("ChromaDB data deleted for archivo {Id}", id);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to delete ChromaDB data for archivo {Id}, proceeding with file deletion.", id);
            }
        }

        // Delete the file from disk
        if (File.Exists(archivo.Path))
        {
            File.Delete(archivo.Path);
            _logger.LogInformation("File deleted from disk at {FilePath}", archivo.Path);
        }
        else
        {
            _logger.LogWarning("File not found on disk at {FilePath}, proceeding with database deletion.", archivo.Path);
        }

        // Delete the database record
        await _archivoRepository.DeleteAsync(archivo);

        return ApiResponse<bool>.SuccessResponse(true, "Archivo eliminado exitosamente.");
    }

    /// <inheritdoc />
    public async Task<(byte[] fileBytes, string fileName, string contentType)> DownloadAsync(Guid id)
    {
        var archivo = await _archivoRepository.GetByIdAsync(id);

        if (archivo is null)
        {
            throw new KeyNotFoundException($"No se encontro el archivo con ID '{id}'.");
        }

        if (!File.Exists(archivo.Path))
        {
            throw new FileNotFoundException($"El archivo fisico no fue encontrado en la ruta '{archivo.Path}'.");
        }

        var fileBytes = await File.ReadAllBytesAsync(archivo.Path);

        // Use the original Nombre for the download file name, with the extension from Path
        var extension = Path.GetExtension(archivo.Path);
        var downloadName = archivo.Nombre.EndsWith(extension, StringComparison.OrdinalIgnoreCase)
            ? archivo.Nombre
            : $"{archivo.Nombre}{extension}";

        // Determine content type from file extension
        var provider = new FileExtensionContentTypeProvider();
        if (!provider.TryGetContentType(archivo.Path, out var contentType))
        {
            contentType = "application/octet-stream";
        }

        return (fileBytes, downloadName, contentType);
    }

    /// <inheritdoc />
    public async Task<ApiResponse<bool>> AprenderAsync(AprenderRequest request)
    {
        if (request.ArchivoIds == null || request.ArchivoIds.Count == 0)
        {
            return ApiResponse<bool>.FailureResponse("Debe seleccionar al menos un archivo.");
        }

        var archivos = await _archivoRepository.FindAsync(a => request.ArchivoIds.Contains(a.Id));

        if (archivos.Count == 0)
        {
            return ApiResponse<bool>.FailureResponse("No se encontraron archivos con los IDs proporcionados.");
        }

        // Mark files as processing with start timestamp
        foreach (var archivo in archivos)
        {
            archivo.EnProcesamiento = true;
            archivo.ProcesamientoInicio = DateTime.UtcNow;
            archivo.ProcesamientoFin = null;
            await _archivoRepository.UpdateAsync(archivo);
        }

        // Build trainer payload and send asynchronously
        var trainerFiles = archivos.Select(a => new TrainerFileRequest
        {
            Id = a.Id,
            Path = a.Path,
            Contexto = a.Contexto,
            Nombre = a.Nombre
        });

        _ = Task.Run(async () =>
        {
            try
            {
                await _trainerService.SendToTrainerAsync(trainerFiles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending files to trainer service.");
            }
        });

        _logger.LogInformation("Learning initiated for {Count} archivos.", archivos.Count);
        return ApiResponse<bool>.SuccessResponse(true, $"Proceso de aprendizaje iniciado para {archivos.Count} archivo(s).");
    }

    /// <inheritdoc />
    public async Task<ApiResponse<bool>> ProcesadoCallbackAsync(Guid id, ProcesadoCallbackRequest request)
    {
        var archivo = await _archivoRepository.GetByIdAsync(id);

        if (archivo is null)
        {
            return ApiResponse<bool>.FailureResponse($"No se encontro el archivo con ID '{id}'.");
        }

        archivo.Procesado = true;
        archivo.EnProcesamiento = false;
        archivo.Contexto = request.Contexto;
        archivo.ChromaDbIds = request.ChromaDbIds;
        archivo.ProcesamientoInicio = request.ProcesamientoInicio ?? archivo.ProcesamientoInicio;
        archivo.ProcesamientoFin = request.ProcesamientoFin ?? DateTime.UtcNow;

        await _archivoRepository.UpdateAsync(archivo);

        _logger.LogInformation("Archivo {Id} marked as processed with context: {Contexto}", id, request.Contexto);
        return ApiResponse<bool>.SuccessResponse(true, "Archivo procesado exitosamente.");
    }

    /// <inheritdoc />
    public async Task<ApiResponse<bool>> EliminarMemoriaAsync(Guid id)
    {
        var archivo = await _archivoRepository.GetByIdAsync(id);

        if (archivo is null)
        {
            return ApiResponse<bool>.FailureResponse($"No se encontro el archivo con ID '{id}'.");
        }

        if (string.IsNullOrWhiteSpace(archivo.ChromaDbIds))
        {
            return ApiResponse<bool>.FailureResponse("El archivo no tiene datos en memoria para eliminar.");
        }

        var chromaIds = archivo.ChromaDbIds.Split(',', StringSplitOptions.RemoveEmptyEntries);
        await _trainerService.DeleteMemoryAsync(chromaIds);

        archivo.ChromaDbIds = null;
        archivo.Procesado = false;
        archivo.ProcesamientoInicio = null;
        archivo.ProcesamientoFin = null;

        await _archivoRepository.UpdateAsync(archivo);

        _logger.LogInformation("Memory deleted for archivo {Id} ({Count} ChromaDB IDs removed)", id, chromaIds.Length);
        return ApiResponse<bool>.SuccessResponse(true, "Memoria eliminada exitosamente.");
    }
}
