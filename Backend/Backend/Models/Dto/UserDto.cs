namespace Backend.Models.Dto
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string Username { get; set; }
        public Gender Gender { get; set; }
        public string? ProfilePictureUrl { get; set; }
    }
}
