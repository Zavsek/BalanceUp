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
        public Guid id { get; set; }
        [Required]
        [Column("friend1")]
        public Guid friend1FK{ get; set; }
        [ForeignKey("Friend1FK")]
        public User friend1 {  get; set; }
        [Required]
        [Column("friend2")]
        public Guid friend2FK { get; set; }

        [ForeignKey("Friend2Fk")]
        public User friend2 { get; set; }
        [Required]
        [Column("friends_since")]
        public DateTime friendsSince { get; set; } = DateTime.UtcNow;
    }
}
