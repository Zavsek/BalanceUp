namespace Backend.Models.Dto
{
    public record AuthRequestDto(
    string Email,
    string Password,
    string Username,
    Gender Gender
    );
    public record LoginRequest(string FirebaseUid);

}
