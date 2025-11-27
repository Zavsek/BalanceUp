using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("events")]
    public class Event
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public Guid id { get; set; }
        [Column("title")]
        public string title { get; set; }
        [Column("description")]
        public string description { get; set; }
        [Required]
        [Column("created_at")]
        public DateTime createdAt { get; set; }
        [NotMapped]
        public ICollection<UserEvents> userEvents { get; set; }

        public ICollection<Expense> expenses { get; set; }


    }
}
