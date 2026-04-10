using FilesManager.Application.Common;
using FilesManager.Application.DTOs.Requests;
using FilesManager.Application.DTOs.Responses;
using FilesManager.Application.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace FilesManager.API.Controllers;

/// <summary>
/// Controller for managing Archivo (file) operations including upload, download, and CRUD.
/// Files are sent as base64-encoded strings in JSON requests.
/// </summary>
[ApiController]
[Route("api/archivos")]
[Produces("application/json")]
[Tags("Archivos")]
public class ArchivosController : ControllerBase
{
    private readonly IArchivoService _archivoService;
    private readonly IValidator<CreateArchivoRequest> _createValidator;
    private readonly IValidator<UpdateArchivoRequest> _updateValidator;
    private readonly ILogger<ArchivosController> _logger;

    /// <summary>
    /// Initializes a new instance of <see cref="ArchivosController"/>.
    /// </summary>
    public ArchivosController(
        IArchivoService archivoService,
        IValidator<CreateArchivoRequest> createValidator,
        IValidator<UpdateArchivoRequest> updateValidator,
        ILogger<ArchivosController> logger)
    {
        _archivoService = archivoService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _logger = logger;
    }

    /// <summary>
    /// Gets all files.
    /// </summary>
    /// <remarks>
    /// Returns a list of all files stored in the system with their metadata.
    /// </remarks>
    /// <returns>An API response containing the list of all files.</returns>
    /// <response code="200">Files retrieved successfully.</response>
    /// <response code="500">An internal error occurred while retrieving files.</response>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<ArchivoResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAll()
    {
        _logger.LogInformation("Retrieving all archivos.");
        var result = await _archivoService.GetAllAsync();
        return Ok(result);
    }

    /// <summary>
    /// Gets a file by its unique identifier.
    /// </summary>
    /// <remarks>
    /// Returns the metadata of a specific file identified by its GUID.
    /// </remarks>
    /// <param name="id">The unique identifier of the file.</param>
    /// <returns>An API response containing the file details.</returns>
    /// <response code="200">File retrieved successfully.</response>
    /// <response code="404">File with the specified ID was not found.</response>
    /// <response code="500">An internal error occurred while retrieving the file.</response>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ArchivoResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetById(Guid id)
    {
        _logger.LogInformation("Retrieving archivo with ID {Id}.", id);
        var result = await _archivoService.GetByIdAsync(id);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Creates a new file by uploading its content as base64.
    /// </summary>
    /// <remarks>
    /// Accepts a JSON request containing the file metadata and the file content encoded in base64.
    /// The file is decoded and stored on disk with a UID-based filename to avoid path length issues.
    ///
    /// Example request body:
    /// ```json
    /// {
    ///   "nombre": "Informe trimestral",
    ///   "descripcion": "Informe del Q1 2026",
    ///   "observaciones": "Pendiente de revision",
    ///   "archivoBase64": "JVBERi0xLjQK...",
    ///   "nombreArchivo": "informe_q1.pdf"
    /// }
    /// ```
    /// </remarks>
    /// <param name="request">The create request containing the file metadata and base64 content.</param>
    /// <returns>An API response containing the created file details.</returns>
    /// <response code="201">File created successfully.</response>
    /// <response code="400">Validation failed for the request.</response>
    /// <response code="500">An internal error occurred while creating the file.</response>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ArchivoResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Create([FromBody] CreateArchivoRequest request)
    {
        _logger.LogInformation("Creating new archivo with name '{Nombre}'.", request.Nombre);

        var validationResult = await _createValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
            return BadRequest(ApiResponse<object>.FailureResponse("Error de validacion.", errors));
        }

        var result = await _archivoService.CreateAsync(request);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result);
    }

    /// <summary>
    /// Updates an existing file's metadata and optionally replaces the stored file.
    /// </summary>
    /// <remarks>
    /// Accepts a JSON request. All fields are optional.
    /// If archivoBase64 and nombreArchivo are provided, the old file on disk is deleted and replaced.
    ///
    /// Example request body (metadata only):
    /// ```json
    /// {
    ///   "nombre": "Informe actualizado",
    ///   "descripcion": "Nueva descripcion"
    /// }
    /// ```
    ///
    /// Example request body (with file replacement):
    /// ```json
    /// {
    ///   "nombre": "Informe actualizado",
    ///   "archivoBase64": "JVBERi0xLjQK...",
    ///   "nombreArchivo": "informe_v2.pdf"
    /// }
    /// ```
    /// </remarks>
    /// <param name="id">The unique identifier of the file to update.</param>
    /// <param name="request">The update request containing updated metadata and optionally new base64 content.</param>
    /// <returns>An API response containing the updated file details.</returns>
    /// <response code="200">File updated successfully.</response>
    /// <response code="400">Validation failed for the request.</response>
    /// <response code="404">File with the specified ID was not found.</response>
    /// <response code="500">An internal error occurred while updating the file.</response>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ArchivoResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateArchivoRequest request)
    {
        _logger.LogInformation("Updating archivo with ID {Id}.", id);

        var validationResult = await _updateValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
            return BadRequest(ApiResponse<object>.FailureResponse("Error de validacion.", errors));
        }

        var result = await _archivoService.UpdateAsync(id, request);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Deletes a file from the system (both the database record and the file on disk).
    /// </summary>
    /// <remarks>
    /// Permanently removes the file from the database and deletes the physical file from disk.
    /// This action cannot be undone.
    /// </remarks>
    /// <param name="id">The unique identifier of the file to delete.</param>
    /// <returns>An API response indicating whether the deletion was successful.</returns>
    /// <response code="200">File deleted successfully.</response>
    /// <response code="404">File with the specified ID was not found.</response>
    /// <response code="500">An internal error occurred while deleting the file.</response>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Delete(Guid id)
    {
        _logger.LogInformation("Deleting archivo with ID {Id}.", id);
        var result = await _archivoService.DeleteAsync(id);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Downloads the actual file from the server.
    /// </summary>
    /// <remarks>
    /// Returns the physical file as a binary stream with the appropriate content type.
    /// The download filename uses the original Nombre stored in the database.
    /// </remarks>
    /// <param name="id">The unique identifier of the file to download.</param>
    /// <returns>The file as a binary download.</returns>
    /// <response code="200">File downloaded successfully.</response>
    /// <response code="404">File with the specified ID was not found or the physical file is missing.</response>
    /// <response code="500">An internal error occurred while downloading the file.</response>
    [HttpGet("{id:guid}/download")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Download(Guid id)
    {
        _logger.LogInformation("Downloading archivo with ID {Id}.", id);
        var (fileBytes, fileName, contentType) = await _archivoService.DownloadAsync(id);
        return File(fileBytes, contentType, fileName);
    }

    /// <summary>
    /// Initiates the learning process for selected files.
    /// </summary>
    /// <remarks>
    /// Marks the specified files as processing and sends them to the trainer service
    /// for text extraction, context enrichment, and embedding generation.
    /// </remarks>
    /// <param name="request">The request containing file IDs to process.</param>
    /// <returns>An API response indicating whether the process was initiated.</returns>
    /// <response code="200">Learning process initiated successfully.</response>
    /// <response code="400">No valid file IDs were provided.</response>
    /// <response code="500">An internal error occurred.</response>
    [HttpPost("aprender")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Aprender([FromBody] AprenderRequest request)
    {
        _logger.LogInformation("Initiating learning for {Count} archivos.", request.ArchivoIds.Count);
        var result = await _archivoService.AprenderAsync(request);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Callback from the trainer service when file processing is complete.
    /// </summary>
    /// <remarks>
    /// Called by the trainer service after text extraction, embedding generation,
    /// and ChromaDB storage are complete. Marks the file as processed and updates its context.
    /// </remarks>
    /// <param name="id">The unique identifier of the processed file.</param>
    /// <param name="request">The callback data with enriched context keywords.</param>
    /// <returns>An API response indicating success or failure.</returns>
    /// <response code="200">File marked as processed successfully.</response>
    /// <response code="404">File with the specified ID was not found.</response>
    /// <response code="500">An internal error occurred.</response>
    [HttpPut("{id:guid}/procesado")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ProcesadoCallback(Guid id, [FromBody] ProcesadoCallbackRequest request)
    {
        _logger.LogInformation("Procesado callback for archivo {Id}.", id);
        var result = await _archivoService.ProcesadoCallbackAsync(id, request);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Deletes the learned memory (ChromaDB data) for a file without removing the file itself.
    /// </summary>
    /// <remarks>
    /// Removes all ChromaDB chunk IDs associated with the file and resets it to unprocessed state.
    /// The physical file and database record are preserved.
    /// </remarks>
    /// <param name="id">The unique identifier of the file.</param>
    /// <returns>An API response indicating success or failure.</returns>
    /// <response code="200">Memory deleted successfully.</response>
    /// <response code="400">The file has no memory data to delete.</response>
    /// <response code="404">File with the specified ID was not found.</response>
    /// <response code="500">An internal error occurred.</response>
    [HttpDelete("{id:guid}/memoria")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> EliminarMemoria(Guid id)
    {
        _logger.LogInformation("Deleting memory for archivo {Id}.", id);
        var result = await _archivoService.EliminarMemoriaAsync(id);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}
