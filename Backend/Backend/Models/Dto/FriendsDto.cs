namespace Backend.Models.Dto
{
    public record FriendsDto(Guid friendshipId,Guid userId, string username, string? profilePictureUrl, string gender);
}
