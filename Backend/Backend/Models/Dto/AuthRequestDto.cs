namespace Backend.Models.Dto
{
    public record AuthRequestDto(
    string email,
    string password,
    string username,
    string gender
    );
}
