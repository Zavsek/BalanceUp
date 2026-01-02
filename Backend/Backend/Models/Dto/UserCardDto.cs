namespace Backend.Models.Dto
{
    record UserCardDto(Guid id, string username, string? profilePictureUrl, string gender);
}
