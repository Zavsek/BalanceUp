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
        public Guid id { get; set; }
        [Required]
        [StringLength(20)]
        [Column("username")]
        public string username { get; set; }
        [MaxLength(100)]
        [Column("profile_picture_url")]
        public string? profilePictureUrl { get; set; }
        [Required]
        [Column("gender")]
        public Gender gender { get; set; }
        [Column("firebase_uid")]
        public string firebaseUid { get; set; }

        [Column("created_at")]
        public DateTime createdAt { get; set; } = DateTime.UtcNow;

        [NotMapped]
        public ICollection<Expense> expenses {get; set;} 

        [NotMapped]
        public ICollection<UserEvents> userEvents { get; set; }
        [NotMapped]
        public ICollection<UserExpenseShare> userExpenseShares { get; set; }

        [NotMapped]
        public ICollection<Friendship> friendships { get; set; }
        [NotMapped]
        public ICollection<FriendRequest> sentFriendRequests { get; set; }
        [NotMapped]
        public ICollection<FriendRequest> recievedFriendRequests { get; set; }

        public SpendingGoal spendingGoal { get; set; }


    }
}
