using FilesManager.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FilesManager.Infrastructure.Persistence.Context;

/// <summary>
/// Entity Framework Core database context for the FilesManager application.
/// </summary>
public class ApplicationDbContext : DbContext
{
    /// <summary>
    /// Initializes a new instance of <see cref="ApplicationDbContext"/>.
    /// </summary>
    /// <param name="options">The database context options.</param>
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    /// <summary>
    /// Gets or sets the Archivos (files) table.
    /// </summary>
    public DbSet<Archivo> Archivos { get; set; } = null!;

    /// <summary>
    /// Configures the entity model using Fluent API configurations.
    /// </summary>
    /// <param name="modelBuilder">The model builder instance.</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all configurations from the current assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }

    /// <summary>
    /// Overrides SaveChangesAsync to automatically set CreatedAt and UpdatedAt timestamps.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The number of state entries written to the database.</returns>
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<Domain.Entities.Entity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
