namespace Backend.Models.Dto
{
    public record ExpenseDto( Guid Id, decimal Amount, ExpenseType Type, string Description, DateTime Time);

    public record UserShareDto(Guid UserId, decimal ShareAmount);

    public record EventExpenseDto(
        Guid EventId,
        decimal Amount,
        ExpenseType Type,
        string Description,
        DateTime Time,
        List<UserShareDto> Shares
    );

    public record UpdateSharesDto(
    List<UserShareDto> Shares   
    );
}
