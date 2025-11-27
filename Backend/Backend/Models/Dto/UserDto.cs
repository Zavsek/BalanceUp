namespace Backend.Models.Dto
{
    public record UserDto(Guid id, string username, Gender gender, string? profilePictureUrl);
}
