using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("user_expense_share")]
    public class UserExpenseShare
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public Guid id { get; set; }
        [Column("expense_id")]
        public Guid expenseId { get; set; }
        [ForeignKey("ExpenseId")]
        public Expense expense { get; set; }
        [Column("user_id")]
        public Guid userId { get; set; }
        [ForeignKey("UserId")]
        public User user { get; set; }
        [Column("share_amount")]
        public decimal shareAmount { get; set; }
    }
}
