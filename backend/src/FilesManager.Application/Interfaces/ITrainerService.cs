using FilesManager.Application.DTOs.Requests;

namespace FilesManager.Application.Interfaces;

/// <summary>
/// Interface for communicating with the Python trainer service.
/// </summary>
public interface ITrainerService
{
    /// <summary>
    /// Sends files to the trainer for asynchronous processing.
    /// </summary>
    /// <param name="files">The list of files to process.</param>
    Task SendToTrainerAsync(IEnumerable<TrainerFileRequest> files);
}
