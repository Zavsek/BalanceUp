using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    [Table("spending_goals")]
    public class SpendingGoal
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public Guid Id { get; set; }
        [Required]
        [Column("user_id")]
        public Guid UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; }
        [Column("weekly_limit")]
        public int? WeeklyLimit { get; set; } = 700;
        [Column("daily_limit")]
        public int? DailyLimit { get; set; } = 100;
        [Column("monthly_limit")]
        public int? MonthlyLimit { get; set; } = 3000;

    }
}
