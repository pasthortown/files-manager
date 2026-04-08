using AutoMapper;
using FilesManager.Application.DTOs.Requests;
using FilesManager.Application.DTOs.Responses;
using FilesManager.Domain.Entities;

namespace FilesManager.Application.Mappings;

/// <summary>
/// Base AutoMapper profile for configuring object-to-object mappings.
/// </summary>
public class MappingProfile : Profile
{
    /// <summary>
    /// Initializes mapping configurations.
    /// </summary>
    public MappingProfile()
    {
        // Archivo mappings
        CreateMap<Archivo, ArchivoResponse>();
        CreateMap<CreateArchivoRequest, Archivo>()
            .ForMember(dest => dest.Path, opt => opt.Ignore())
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Procesado, opt => opt.Ignore())
            .ForMember(dest => dest.EnProcesamiento, opt => opt.Ignore())
            .ForSourceMember(src => src.ArchivoBase64, opt => opt.DoNotValidate())
            .ForSourceMember(src => src.NombreArchivo, opt => opt.DoNotValidate());
    }
}
