namespace FilesManager.Application.DTOs.Requests;

/// <summary>
/// Request DTO for updating an existing Archivo (file).
/// </summary>
public class UpdateArchivoRequest
{
    /// <summary>
    /// The updated name of the file. Optional, max 255 characters.
    /// </summary>
    public string? Nombre { get; set; }

    /// <summary>
    /// The updated description of the file. Optional.
    /// </summary>
    public string? Descripcion { get; set; }

    /// <summary>
    /// Updated observations or notes about the file. Optional.
    /// </summary>
    public string? Observaciones { get; set; }

    /// <summary>
    /// The replacement file content encoded in base64. Optional.
    /// </summary>
    public string? ArchivoBase64 { get; set; }

    /// <summary>
    /// The original file name with extension for the replacement file. Required if ArchivoBase64 is provided.
    /// </summary>
    public string? NombreArchivo { get; set; }

    /// <summary>
    /// Updated comma-separated context keywords for classification.
    /// </summary>
    public string? Contexto { get; set; }
}
