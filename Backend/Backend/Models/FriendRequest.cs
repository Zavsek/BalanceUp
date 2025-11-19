using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("friend_requests")]
    public class FriendRequest
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public Guid Id { get; set; }
        [Required]
        [Column("from_user_id")]
        public Guid FromUserId { get; set; }
        [ForeignKey("FromUserId")]
        public User FromUser { get; set; }
        [Required]
        [Column("to_user_id")]
        public Guid ToUserId { get; set; }

        [ForeignKey("ToUserId")]
        public User ToUser { get; set; }

        [Required]
        public DateOnly SentAt { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    }
}
