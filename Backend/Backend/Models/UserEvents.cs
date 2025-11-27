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
        public int id { get; set; }
        [Required]
        [Column("user_id")]
        public Guid userId { get; set; }
        [ForeignKey("UserId")]
        public User user { get; set; }
        [Required]
        [Column("event_id")]
        public Guid eventId { get; set; }
        [ForeignKey("ExpenseId")]
        [NotMapped]
        public Event userEvent{ get; set; } 
    }
}
