using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
     public enum ExpenseType
    {
        Travel,
        Food,
        Drinks,
        Accommodation,
        Miscellaneous
    }
    [Table("expenses")]
    public class Expense
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public Guid Id { get; set; }
        [Required]
        [Column("amount")]
        [Range(0,double.MaxValue)]
        public decimal Amount { get; set; }
        [Column("type")]
        public ExpenseType Type { get; set; }
        [Column("description")]
        public string Description { get; set; }
        [Required]
        [Column("date_time")]
        public DateTime DateTime { get; set; } = DateTime.Now;
        [Column("user_id")]
        public Guid? UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }

        [Column("event_id")]
        public Guid? EventId { get; set; } 

        [ForeignKey("EventId")]
        public Event Event { get; set; }

        public ICollection<UserExpenseShare> UserExpenseShares { get; set; }

    }
}
