using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class RenameInFriendRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SentAt",
                table: "friend_requests",
                newName: "sent_at");

            migrationBuilder.AddColumn<Guid>(
                name: "ExpenseId",
                table: "user_expense_share",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "user_expense_share",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "user_events",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "Friend1FK",
                table: "friendships",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExpenseId",
                table: "user_expense_share");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "user_expense_share");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "user_events");

            migrationBuilder.DropColumn(
                name: "Friend1FK",
                table: "friendships");

            migrationBuilder.RenameColumn(
                name: "sent_at",
                table: "friend_requests",
                newName: "SentAt");
        }
    }
}
