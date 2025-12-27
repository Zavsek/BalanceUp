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


        public ICollection<Expense> expenses {get; set;} 

        public ICollection<UserEvents> userEvents { get; set; }

        public ICollection<UserExpenseShare> userExpenseShares { get; set; }


        public ICollection<Friendship> friendships { get; set; }

        public ICollection<FriendRequest> sentFriendRequests { get; set; }

        public ICollection<FriendRequest> recievedFriendRequests { get; set; }

        public SpendingGoal spendingGoal { get; set; }


    }
}
