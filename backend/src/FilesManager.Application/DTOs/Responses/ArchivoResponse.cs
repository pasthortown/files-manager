namespace FilesManager.Application.DTOs.Responses;

/// <summary>
/// Response DTO representing an Archivo (file) entity.
/// </summary>
public class ArchivoResponse
{
    /// <summary>
    /// The unique identifier of the file.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// The name of the file.
    /// </summary>
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// The description of the file.
    /// </summary>
    public string? Descripcion { get; set; }

    /// <summary>
    /// Observations or notes about the file.
    /// </summary>
    public string? Observaciones { get; set; }

    /// <summary>
    /// The physical file path where the file is stored.
    /// </summary>
    public string Path { get; set; } = string.Empty;

    /// <summary>
    /// The date and time when the file was created.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// The date and time when the file was last updated.
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// Indicates whether the file has been processed.
    /// </summary>
    public bool Procesado { get; set; }

    /// <summary>
    /// Comma-separated context keywords for document classification.
    /// </summary>
    public string? Contexto { get; set; }

    /// <summary>
    /// Indicates whether the file is currently being processed.
    /// </summary>
    public bool EnProcesamiento { get; set; }

    /// <summary>
    /// Timestamp when the processing started.
    /// </summary>
    public DateTime? ProcesamientoInicio { get; set; }

    /// <summary>
    /// Timestamp when the processing finished.
    /// </summary>
    public DateTime? ProcesamientoFin { get; set; }
}
