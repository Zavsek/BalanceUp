using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("user_events")]
    public class UserEvents
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")] 
        public int Id { get; set; }
        [Required]
        [Column("user_id")]
        public Guid UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }
        [Required]
        [Column("event_id")]
        public Guid EventId { get; set; }
        [ForeignKey("ExpenseId")]
        [NotMapped]
        public Event Event{ get; set; } 
    }
}
