namespace Backend.Models.Dto
{
    public record UserDto(Guid Id, string Username, Gender Gender, string? ProfilePictureUrl);
}
