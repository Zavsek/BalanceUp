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
        public Guid id { get; set; }
        [Required]
        [Column("user_id")]
        public Guid userId { get; set; }
        [ForeignKey("UserId")]
        public User user { get; set; }
        [Column("weekly_limit")]
        public int? weeklyLimit { get; set; } = 700;
        [Column("daily_limit")]
        public int? dailyLimit { get; set; } = 100;
        [Column("monthly_limit")]
        public int? monthlyLimit { get; set; } = 3000;

    }
}
