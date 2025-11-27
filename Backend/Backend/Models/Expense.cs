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
        public Guid id { get; set; }
        [Required]
        [Column("amount")]
        [Range(0,double.MaxValue)]
        public decimal amount { get; set; }
        [Column("type")]
        public ExpenseType type { get; set; }
        [Column("description")]
        public string description { get; set; }
        [Required]
        [Column("date_time")]
        public DateTime dateTime { get; set; } = DateTime.Now;
        [Column("user_id")]
        public Guid? userId { get; set; }
        [ForeignKey("UserId")]
        public User user { get; set; }

        [Column("event_id")]
        public Guid? eventId { get; set; } 

        [ForeignKey("EventId")]
        public Event expenseEvent { get; set; }

        public ICollection<UserExpenseShare> userExpenseShares { get; set; }

    }
}
