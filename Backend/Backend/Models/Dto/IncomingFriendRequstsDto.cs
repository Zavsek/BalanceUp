namespace Backend.Models.Dto
{
    record IncomingFriendRequestsDto(Guid requestId, Guid fromUserId, DateOnly sentAt, UserCardDto user);
}
