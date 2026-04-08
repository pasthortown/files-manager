using System.Linq.Expressions;
using FilesManager.Domain.Entities;

namespace FilesManager.Domain.Interfaces.Repositories;

/// <summary>
/// Generic base repository interface that defines standard CRUD operations.
/// </summary>
/// <typeparam name="T">The entity type that must inherit from <see cref="Entity"/>.</typeparam>
public interface IBaseRepository<T> where T : Entity
{
    /// <summary>
    /// Gets an entity by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the entity.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The entity if found; otherwise, null.</returns>
    Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all entities.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A read-only list of all entities.</returns>
    Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Finds entities that match the specified predicate.
    /// </summary>
    /// <param name="predicate">The expression to filter entities.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A read-only list of matching entities.</returns>
    Task<IReadOnlyList<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new entity to the repository.
    /// </summary>
    /// <param name="entity">The entity to add.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The added entity.</returns>
    Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing entity in the repository.
    /// </summary>
    /// <param name="entity">The entity to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task UpdateAsync(T entity, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes an entity from the repository.
    /// </summary>
    /// <param name="entity">The entity to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task DeleteAsync(T entity, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks whether any entity matches the specified predicate.
    /// </summary>
    /// <param name="predicate">The expression to check.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if any entity matches; otherwise, false.</returns>
    Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
}
