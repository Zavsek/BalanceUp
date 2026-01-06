using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models.Dto
{
    //used for getting list of events for user
    public record EventDto
    (Guid id, string title, string description, DateTime createdAt);
    //used for creating event
    public record CreateEventDto(
        string title,
        string? description,
        List<Guid> users
        );
    //used for getting full event details
    public record EventDetailsDto(Guid id, string title, string? desctiption, DateTime createdAt, List<EventUserDto> users, List<EventExpensesDto> expenses);

    //User for event
    public record EventUserDto(Guid id, string username);

    //expenses for event
    public record EventExpensesDto(Guid? id, decimal amount, string description, string type, DateTime dateTime,  List<ExpenseShareDto> shares);

    //Expense shares for event expense
    public record ExpenseShareDto( Guid userId,string username, decimal shareAmount);

}
