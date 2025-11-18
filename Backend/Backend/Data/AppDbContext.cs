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
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .Property(u => u.Gender)
                .HasConversion<string>();

            modelBuilder.Entity<Expense>()
                .Property(e => e.Type)
                .HasConversion<string>();

            modelBuilder.Entity<Expense>()
                .Property(e => e.Amount)
                .HasColumnType("decimal(18,2)");


            modelBuilder.Entity<UserEvents>()
                .HasIndex(ue => new { ue.UserId, ue.EventId })
                .IsUnique();

            modelBuilder.Entity<UserEvents>()
                .HasOne(ue => ue.User)
                .WithMany(u => u.UserEvents)
                .HasForeignKey(ue => ue.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserEvents>()
                .HasOne(ue => ue.Event)
                .WithMany(e => e.UserEvents)
                .HasForeignKey(ue => ue.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Expense>()
                .HasOne(e => e.User)
                .WithMany(u => u.Expenses)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Expense>()
                .HasOne(e => e.Event)
                .WithMany(ev => ev.Expenses)
                .HasForeignKey(e => e.EventId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<UserExpenseShare>()
                .HasOne(ues => ues.User)
                .WithMany(u => u.UserExpenseShares)
                .HasForeignKey(ues => ues.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserExpenseShare>()
                .HasOne(ues => ues.Expense)
                .WithMany(e => e.UserExpenseShares)
                .HasForeignKey(ues => ues.ExpenseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Friendship>()
    .           HasOne(f => f.Friend1)
        .       WithMany(u => u.Friendships)
    .           HasForeignKey(f => f.Friend1FK)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<Friendship>()
                .HasOne(f => f.Friend2)
                .WithMany()
                .HasForeignKey(f => f.Friend2FK)
                .OnDelete(DeleteBehavior.Cascade);
            
            modelBuilder.Entity<FriendRequest>()
                .HasOne(fr => fr.FromUser)
                .WithMany(u => u.SentFriendRequests)
                .HasForeignKey(fr =>  fr.FromUserId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<FriendRequest>()
                .HasOne(fr => fr.ToUser)
                .WithMany(u => u.RecievedFriendRequests)
                .HasForeignKey(fr => fr.ToUserId)
                .OnDelete(DeleteBehavior.Cascade);


        }


    }
}
