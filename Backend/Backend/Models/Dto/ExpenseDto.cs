namespace Backend.Models.Dto
{
    public record ExpenseDto(Guid id, decimal amount, string type, string description, DateTime time);

    public record UserShareDto(Guid userId, decimal shareAmount);


    public record UpdateSharesDto(
    List<UserShareDto> shares   
    );
}
