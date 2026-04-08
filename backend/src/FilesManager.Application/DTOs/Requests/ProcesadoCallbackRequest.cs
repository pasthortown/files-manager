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
}
