namespace Ecolab.AuditChallenge.Database.AuditChallenge
{
    public interface IUnitOfWork : IDisposable
    {
        IChallengedAuditRepository ChallengedAudits { get; }
        IChallengedQuestionRepository ChallengedQuestions { get; }
        IChallengedQuestionStatusDetailRepository ChallengedQuestionStatusDetails { get; }
        IAccountConfigurationRepository AccountConfigurations { get; }
        IRoleConfigurationRepository RoleConfigurations { get; }
        Task<int> Save();
    }
}
