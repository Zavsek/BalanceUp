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
        public Guid Id { get; set; }
        [Column("title")]
        public string Title { get; set; }
        [Column("description")]
        public string Description { get; set; }
        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
        [NotMapped]
        public ICollection<UserEvents> UserEvents { get; set; }

        public ICollection<Expense> Expenses { get; set; }


    }
}
