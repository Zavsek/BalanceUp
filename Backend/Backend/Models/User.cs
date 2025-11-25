using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public enum Gender
    {
        Male,
        Female,
        Other
    }
    [Table("users")]
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public Guid Id { get; set; }
        [Required]
        [StringLength(20)]
        [Column("username")]
        public string Username { get; set; }
        [MaxLength(100)]
        [Column("profile_picture_url")]
        public string? ProfilePictureUrl { get; set; }
        [Required]
        [Column("gender")]
        public Gender Gender { get; set; }
        [Column("firebase_uid")]
        public string FirebaseUid { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [NotMapped]
        public ICollection<Expense> Expenses {get; set;} 

        [NotMapped]
        public ICollection<UserEvents> UserEvents { get; set; }
        [NotMapped]
        public ICollection<UserExpenseShare> UserExpenseShares { get; set; }

        [NotMapped]
        public ICollection<Friendship> Friendships { get; set; }
        [NotMapped]
        public ICollection<FriendRequest> SentFriendRequests { get; set; }
        [NotMapped]
        public ICollection<FriendRequest> RecievedFriendRequests { get; set; }

        public SpendingGoal SpendingGoal { get; set; }


    }
}
