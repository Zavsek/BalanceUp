namespace Backend.Models.Dto
{
    public record ExpenseDto(decimal amount, ExpenseType type, string description, DateTime time);

    public record UserShareDto(Guid userId, decimal shareAmount);

    public record EventExpenseDto(
        Guid eventId,
        decimal amount,
        ExpenseType type,
        string description,
        DateTime time,
        List<UserShareDto> shares
    );

    public record UpdateSharesDto(
    List<UserShareDto> shares   
    );
}
