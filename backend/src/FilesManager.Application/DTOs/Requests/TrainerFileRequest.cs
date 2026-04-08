namespace FilesManager.Application.DTOs.Requests;

/// <summary>
/// DTO sent to the trainer service for each file to process.
/// </summary>
public class TrainerFileRequest
{
    /// <summary>
    /// The unique identifier of the file.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// The physical file path on disk.
    /// </summary>
    public string Path { get; set; } = string.Empty;

    /// <summary>
    /// The user-provided context keywords.
    /// </summary>
    public string? Contexto { get; set; }

    /// <summary>
    /// The name of the file.
    /// </summary>
    public string Nombre { get; set; } = string.Empty;
}
