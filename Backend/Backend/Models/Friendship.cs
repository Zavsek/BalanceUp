using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("friendships")]
    public class Friendship
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public Guid Id { get; set; }
        [Required]
        [Column("friend1")]
        public Guid Friend1FK{ get; set; }
        [ForeignKey("Friend1FK")]
        public User Friend1 {  get; set; }
        [Required]
        [Column("friend2")]
        public Guid Friend2FK { get; set; }

        [ForeignKey("Friend2Fk")]
        public User Friend2 { get; set; }
        [Required]
        [Column("friends_since")]
        public DateTime FriendsSince { get; set; } = DateTime.UtcNow;
    }
}
