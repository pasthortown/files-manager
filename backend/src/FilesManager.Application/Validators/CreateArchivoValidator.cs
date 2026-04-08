using FilesManager.Application.DTOs.Requests;
using FluentValidation;

namespace FilesManager.Application.Validators;

/// <summary>
/// Validator for <see cref="CreateArchivoRequest"/>.
/// </summary>
public class CreateArchivoValidator : AbstractValidator<CreateArchivoRequest>
{
    private const long MaxFileSizeBytes = 50L * 1024 * 1024; // 50 MB

    /// <summary>
    /// Initializes validation rules for creating a new Archivo.
    /// </summary>
    public CreateArchivoValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre es requerido.")
            .MaximumLength(255).WithMessage("El nombre no puede exceder 255 caracteres.");

        RuleFor(x => x.ArchivoBase64)
            .NotEmpty().WithMessage("El contenido del archivo en base64 es requerido.")
            .Must(BeValidBase64).WithMessage("El contenido del archivo no es un base64 valido.")
            .Must(NotExceedMaxSize).WithMessage($"El archivo no puede exceder {MaxFileSizeBytes / (1024 * 1024)} MB.");

        RuleFor(x => x.NombreArchivo)
            .NotEmpty().WithMessage("El nombre del archivo original es requerido.")
            .Must(HaveExtension).WithMessage("El nombre del archivo debe tener una extension (ej: documento.pdf).");

        RuleFor(x => x.Contexto)
            .MaximumLength(2000).WithMessage("El contexto no puede exceder 2000 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Contexto));
    }

    private static bool BeValidBase64(string base64)
    {
        if (string.IsNullOrWhiteSpace(base64)) return false;
        try
        {
            Convert.FromBase64String(base64);
            return true;
        }
        catch
        {
            return false;
        }
    }

    private static bool NotExceedMaxSize(string base64)
    {
        if (string.IsNullOrWhiteSpace(base64)) return true;
        try
        {
            var bytes = Convert.FromBase64String(base64);
            return bytes.Length <= MaxFileSizeBytes;
        }
        catch
        {
            return false;
        }
    }

    private static bool HaveExtension(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName)) return false;
        return Path.HasExtension(fileName);
    }
}
