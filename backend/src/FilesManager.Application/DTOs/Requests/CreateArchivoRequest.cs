namespace FilesManager.Application.DTOs.Requests;

/// <summary>
/// Request DTO for creating a new Archivo (file).
/// </summary>
public class CreateArchivoRequest
{
    /// <summary>
    /// The name of the file. Required, max 255 characters.
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
    /// The file content encoded in base64. Required.
    /// </summary>
    public string ArchivoBase64 { get; set; } = string.Empty;

    /// <summary>
    /// The original file name with extension (e.g. "documento.pdf"). Required for determining the file extension.
    /// </summary>
    public string NombreArchivo { get; set; } = string.Empty;

    /// <summary>
    /// Optional comma-separated context keywords for document classification.
    /// </summary>
    public string? Contexto { get; set; }
}
