using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models.Dto
{
    public record EventDto
    (Guid id, string title, string description, DateTime createdAt );
    public record CreateEventDto(
        string title,
        string description,
        List<Guid> users
        );
}
