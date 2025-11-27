using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Expense> Expenses { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<UserEvents> UserEvents { get; set; }
        public DbSet<UserExpenseShare> UserExpenseShares { get; set; }
        public DbSet<Friendship> Friendships { get; set; }
        public DbSet<FriendRequest> FriendRequests { get; set; }
        public DbSet<SpendingGoal> SpendingGoals { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

        //User
            modelBuilder.Entity<User>()
                .Property(u => u.gender)
                .HasConversion<string>();


        //Expense
            modelBuilder.Entity<Expense>()
                .Property(e => e.type)
                .HasConversion<string>();

            modelBuilder.Entity<Expense>()
                .Property(e => e.amount)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Expense>()
                .HasOne(e => e.user)
                .WithMany(u => u.expenses)
                .HasForeignKey(e => e.userId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Expense>()
                .HasOne(e => e.expenseEvent)
                .WithMany(ev => ev.expenses)
                .HasForeignKey(e => e.eventId)
                .OnDelete(DeleteBehavior.SetNull);


        //UserEvents - Many to Many between User and Event
            modelBuilder.Entity<UserEvents>()
                .HasIndex(ue => new { ue.userId, ue.eventId })
                .IsUnique();

            modelBuilder.Entity<UserEvents>()
                .HasOne(ue => ue.user)
                .WithMany(u => u.userEvents)
                .HasForeignKey(ue => ue.userId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserEvents>()
                .HasOne(ue => ue.userEvent)
                .WithMany(e => e.userEvents)
                .HasForeignKey(ue => ue.eventId)
                .OnDelete(DeleteBehavior.Cascade);


        //UserExpenseShare 
            modelBuilder.Entity<UserExpenseShare>()
                .HasOne(ues => ues.user)
                .WithMany(u => u.userExpenseShares)
                .HasForeignKey(ues => ues.userId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserExpenseShare>()
                .HasOne(ues => ues.expense)
                .WithMany(e => e.userExpenseShares)
                .HasForeignKey(ues => ues.expenseId)
                .OnDelete(DeleteBehavior.Cascade);
        

        //Friendship
            modelBuilder.Entity<Friendship>()
    .           HasOne(f => f.friend1)
        .       WithMany(u => u.friendships)
    .           HasForeignKey(f => f.friend1FK)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Friendship>()
                .HasOne(f => f.friend2)
                .WithMany()
                .HasForeignKey(f => f.friend2FK)
                .OnDelete(DeleteBehavior.Cascade);
            

        //FriendRequest
            modelBuilder.Entity<FriendRequest>()
                .HasOne(fr => fr.fromUser)
                .WithMany(u => u.sentFriendRequests)
                .HasForeignKey(fr =>  fr.fromUserId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<FriendRequest>()
                .HasOne(fr => fr.toUser)
                .WithMany(u => u.recievedFriendRequests)
                .HasForeignKey(fr => fr.toUserId)
                .OnDelete(DeleteBehavior.Cascade);


        //SpendingGoal - One to One between User and SpendingGoal
            modelBuilder.Entity<SpendingGoal>()
                .HasOne(sg => sg.user)
                .WithOne(u => u.spendingGoal)
                .HasForeignKey<SpendingGoal>(sg => sg.userId)
                .OnDelete(DeleteBehavior.Cascade);

        }


    }
}
