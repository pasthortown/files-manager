namespace FilesManager.Domain.Entities;

/// <summary>
/// Base entity class that provides common properties for all domain entities.
/// </summary>
public abstract class Entity
{
    /// <summary>
    /// Unique identifier for the entity.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Date and time when the entity was created.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Date and time when the entity was last updated.
    /// </summary>
    public DateTime? UpdatedAt { get; set; }
}
