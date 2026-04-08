using FilesManager.Application.DTOs.Requests;
using FluentValidation;

namespace FilesManager.Application.Validators;

/// <summary>
/// Validator for <see cref="UpdateArchivoRequest"/>.
/// </summary>
public class UpdateArchivoValidator : AbstractValidator<UpdateArchivoRequest>
{
    private const long MaxFileSizeBytes = 50L * 1024 * 1024; // 50 MB

    /// <summary>
    /// Initializes validation rules for updating an existing Archivo.
    /// </summary>
    public UpdateArchivoValidator()
    {
        RuleFor(x => x.Nombre)
            .MaximumLength(255).WithMessage("El nombre no puede exceder 255 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Nombre));

        RuleFor(x => x.ArchivoBase64)
            .Must(BeValidBase64!).WithMessage("El contenido del archivo no es un base64 valido.")
            .Must(NotExceedMaxSize!).WithMessage($"El archivo no puede exceder {MaxFileSizeBytes / (1024 * 1024)} MB.")
            .When(x => !string.IsNullOrWhiteSpace(x.ArchivoBase64));

        RuleFor(x => x.NombreArchivo)
            .NotEmpty().WithMessage("El nombre del archivo es requerido cuando se proporciona un archivo nuevo.")
            .Must(HaveExtension!).WithMessage("El nombre del archivo debe tener una extension.")
            .When(x => !string.IsNullOrWhiteSpace(x.ArchivoBase64));

        RuleFor(x => x.Contexto)
            .MaximumLength(2000).WithMessage("El contexto no puede exceder 2000 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Contexto));
    }

    private static bool BeValidBase64(string base64)
    {
        if (string.IsNullOrWhiteSpace(base64)) return true;
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
