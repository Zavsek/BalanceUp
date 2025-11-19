using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models.Dto
{
    public record EventDto
    (Guid Id, string Title, string Description, DateTime CreatedAt );
    public record CreateEventDto(
        string Title,
        string Description,
        List<Guid> Users
        );
}
