namespace Backend.Models.Dto
{
    record IncomingFriendRequestsDto(Guid fromUserId, DateOnly sentAt, UserCardDto user);
}
