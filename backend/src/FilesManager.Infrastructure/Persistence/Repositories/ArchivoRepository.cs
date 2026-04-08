using FilesManager.Domain.Entities;
using FilesManager.Domain.Interfaces.Repositories;
using FilesManager.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace FilesManager.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for managing <see cref="Archivo"/> entities.
/// </summary>
public class ArchivoRepository : BaseRepository<Archivo>, IArchivoRepository
{
    /// <summary>
    /// Initializes a new instance of <see cref="ArchivoRepository"/>.
    /// </summary>
    /// <param name="context">The database context.</param>
    public ArchivoRepository(ApplicationDbContext context) : base(context)
    {
    }

    /// <inheritdoc />
    public async Task<IEnumerable<Archivo>> GetByNombreAsync(string nombre, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(a => a.Nombre.ToLower().Contains(nombre.ToLower()))
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<bool> ExistsByNombreAsync(string nombre, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AnyAsync(a => a.Nombre.ToLower() == nombre.ToLower(), cancellationToken);
    }
}
