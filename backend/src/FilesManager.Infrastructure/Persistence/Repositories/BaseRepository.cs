using System.Linq.Expressions;
using FilesManager.Domain.Entities;
using FilesManager.Domain.Interfaces.Repositories;
using FilesManager.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace FilesManager.Infrastructure.Persistence.Repositories;

/// <summary>
/// Generic base repository implementation using Entity Framework Core.
/// </summary>
/// <typeparam name="T">The entity type that must inherit from <see cref="Entity"/>.</typeparam>
public class BaseRepository<T> : IBaseRepository<T> where T : Entity
{
    protected readonly ApplicationDbContext _context;
    protected readonly DbSet<T> _dbSet;

    /// <summary>
    /// Initializes a new instance of <see cref="BaseRepository{T}"/>.
    /// </summary>
    /// <param name="context">The database context.</param>
    public BaseRepository(ApplicationDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    /// <inheritdoc />
    public async Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FindAsync(new object[] { id }, cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet.ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(predicate).ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<T> AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await _dbSet.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    /// <inheritdoc />
    public async Task UpdateAsync(T entity, CancellationToken cancellationToken = default)
    {
        _dbSet.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task DeleteAsync(T entity, CancellationToken cancellationToken = default)
    {
        _dbSet.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(predicate, cancellationToken);
    }
}
