using FilesManager.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FilesManager.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity Framework Core configuration for the <see cref="Archivo"/> entity.
/// </summary>
public class ArchivoConfiguration : IEntityTypeConfiguration<Archivo>
{
    /// <summary>
    /// Configures the Archivo entity mapping.
    /// </summary>
    /// <param name="builder">The entity type builder.</param>
    public void Configure(EntityTypeBuilder<Archivo> builder)
    {
        builder.ToTable("Archivos");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Nombre)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(a => a.Descripcion)
            .HasColumnType("nvarchar(max)");

        builder.Property(a => a.Observaciones)
            .HasColumnType("nvarchar(max)");

        builder.Property(a => a.Path)
            .IsRequired();

        builder.Property(a => a.Procesado)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(a => a.Contexto)
            .HasColumnType("nvarchar(max)");

        builder.Property(a => a.EnProcesamiento)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(a => a.ProcesamientoInicio)
            .IsRequired(false);

        builder.Property(a => a.ProcesamientoFin)
            .IsRequired(false);

        builder.Property(a => a.ChromaDbIds)
            .HasColumnType("nvarchar(max)");
    }
}
