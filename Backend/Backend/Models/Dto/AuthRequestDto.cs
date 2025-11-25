namespace Backend.Models.Dto
{
    public record AuthRequestDto(
    string Email,
    string Password,
    string Username,
    string Gender
    );
    public record LoginRequest(string Email, string Password);

}
