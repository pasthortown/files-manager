namespace FilesManager.Domain.Entities;

/// <summary>
/// Represents a file (Archivo) entity in the system.
/// </summary>
public class Archivo : Entity
{
    /// <summary>
    /// The name of the file.
    /// </summary>
    public string Nombre { get; set; } = string.Empty;

    /// <summary>
    /// An optional description of the file.
    /// </summary>
    public string? Descripcion { get; set; }

    /// <summary>
    /// Optional observations or notes about the file.
    /// </summary>
    public string? Observaciones { get; set; }

    /// <summary>
    /// The physical file path on disk where the uploaded file is stored.
    /// </summary>
    public string Path { get; set; } = string.Empty;

    /// <summary>
    /// Indicates whether the file has been processed.
    /// </summary>
    public bool Procesado { get; set; } = false;

    /// <summary>
    /// Comma-separated context keywords for document classification.
    /// </summary>
    public string? Contexto { get; set; }

    /// <summary>
    /// Indicates whether the file is currently being processed by the trainer.
    /// </summary>
    public bool EnProcesamiento { get; set; } = false;
}
