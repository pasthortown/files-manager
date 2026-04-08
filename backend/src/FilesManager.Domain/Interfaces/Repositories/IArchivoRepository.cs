using FilesManager.Domain.Entities;

namespace FilesManager.Domain.Interfaces.Repositories;

/// <summary>
/// Repository interface for managing <see cref="Archivo"/> entities.
/// </summary>
public interface IArchivoRepository : IBaseRepository<Archivo>
{
    /// <summary>
    /// Searches for files whose name contains the specified string (case insensitive).
    /// </summary>
    /// <param name="nombre">The name or partial name to search for.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A collection of matching files.</returns>
    Task<IEnumerable<Archivo>> GetByNombreAsync(string nombre, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks whether a file with the specified name already exists.
    /// </summary>
    /// <param name="nombre">The name to check.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if a file with the given name exists; otherwise, false.</returns>
    Task<bool> ExistsByNombreAsync(string nombre, CancellationToken cancellationToken = default);
}
