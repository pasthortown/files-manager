namespace FilesManager.Application.DTOs.Requests;

/// <summary>
/// Request DTO for the trainer callback when file processing is complete.
/// </summary>
public class ProcesadoCallbackRequest
{
    /// <summary>
    /// The enriched context keywords from AI processing.
    /// </summary>
    public string Contexto { get; set; } = string.Empty;

    /// <summary>
    /// Timestamp when the processing started (ISO 8601 from trainer).
    /// </summary>
    public DateTime? ProcesamientoInicio { get; set; }

    /// <summary>
    /// Timestamp when the processing finished (ISO 8601 from trainer).
    /// </summary>
    public DateTime? ProcesamientoFin { get; set; }
}
