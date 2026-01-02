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
        public Guid id { get; set; }
        [Required]
        [Column("from_user_id")]
        public Guid fromUserId { get; set; }
        [ForeignKey("fromUserId")]
        public User fromUser { get; set; }
        [Required]
        [Column("to_user_id")]
        public Guid toUserId { get; set; }

        [ForeignKey("toUserId")]
        public User toUser { get; set; }

        [Required]
        [Column("sent_at")]
        public DateOnly sentAt { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    }
}
