namespace FilesManager.Application.DTOs.Requests;

/// <summary>
/// Request DTO for initiating the learning process for selected files.
/// </summary>
public class AprenderRequest
{
    /// <summary>
    /// The IDs of the files to process.
    /// </summary>
    public List<Guid> ArchivoIds { get; set; } = new();
}
