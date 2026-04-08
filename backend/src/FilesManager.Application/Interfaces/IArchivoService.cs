using FilesManager.Application.Common;
using FilesManager.Application.DTOs.Requests;
using FilesManager.Application.DTOs.Responses;

namespace FilesManager.Application.Interfaces;

/// <summary>
/// Service interface for managing Archivo (file) operations.
/// </summary>
public interface IArchivoService
{
    /// <summary>
    /// Gets a file by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the file.</param>
    /// <returns>An API response containing the file details.</returns>
    Task<ApiResponse<ArchivoResponse>> GetByIdAsync(Guid id);

    /// <summary>
    /// Gets all files.
    /// </summary>
    /// <returns>An API response containing the list of all files.</returns>
    Task<ApiResponse<IEnumerable<ArchivoResponse>>> GetAllAsync();

    /// <summary>
    /// Creates a new file record and stores the uploaded file on disk.
    /// </summary>
    /// <param name="request">The create request containing file metadata and the file itself.</param>
    /// <returns>An API response containing the created file details.</returns>
    Task<ApiResponse<ArchivoResponse>> CreateAsync(CreateArchivoRequest request);

    /// <summary>
    /// Updates an existing file record and optionally replaces the stored file.
    /// </summary>
    /// <param name="id">The unique identifier of the file to update.</param>
    /// <param name="request">The update request containing updated metadata and optionally a new file.</param>
    /// <returns>An API response containing the updated file details.</returns>
    Task<ApiResponse<ArchivoResponse>> UpdateAsync(Guid id, UpdateArchivoRequest request);

    /// <summary>
    /// Deletes a file record and removes the file from disk.
    /// </summary>
    /// <param name="id">The unique identifier of the file to delete.</param>
    /// <returns>An API response indicating success or failure.</returns>
    Task<ApiResponse<bool>> DeleteAsync(Guid id);

    /// <summary>
    /// Downloads the actual file from disk.
    /// </summary>
    /// <param name="id">The unique identifier of the file to download.</param>
    /// <returns>A tuple containing the file bytes, file name, and content type.</returns>
    Task<(byte[] fileBytes, string fileName, string contentType)> DownloadAsync(Guid id);

    /// <summary>
    /// Initiates the learning process for the specified file IDs.
    /// </summary>
    /// <param name="request">The request containing file IDs to process.</param>
    /// <returns>An API response indicating success or failure.</returns>
    Task<ApiResponse<bool>> AprenderAsync(AprenderRequest request);

    /// <summary>
    /// Callback from the trainer service when file processing is complete.
    /// </summary>
    /// <param name="id">The ID of the processed file.</param>
    /// <param name="request">The callback data with enriched context.</param>
    /// <returns>An API response indicating success or failure.</returns>
    Task<ApiResponse<bool>> ProcesadoCallbackAsync(Guid id, ProcesadoCallbackRequest request);
}
