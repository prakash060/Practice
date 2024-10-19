namespace Ecolab.AuditChallenge.Database.AuditChallenge
{
    public class UnitOfWork : IUnitOfWork, IDisposable
    {
        private readonly AuditChallengeContext _context;
        public UnitOfWork(AuditChallengeContext context, IChallengedAuditRepository challengedAuditRepository, 
            IChallengedQuestionRepository challengedQuestions, IChallengedQuestionStatusDetailRepository challengedQuestionStatusDetails,
            IAccountConfigurationRepository accountConfigurations, IRoleConfigurationRepository roleConfigurations)
        {
            _context = context;
            ChallengedAudits = challengedAuditRepository;
            ChallengedQuestions = challengedQuestions;
            ChallengedQuestionStatusDetails = challengedQuestionStatusDetails;
            AccountConfigurations = accountConfigurations;
            RoleConfigurations = roleConfigurations;
        }

        public IChallengedAuditRepository ChallengedAudits { get; }
        public IChallengedQuestionRepository ChallengedQuestions { get; }
        public IChallengedQuestionStatusDetailRepository ChallengedQuestionStatusDetails { get; }
        public IAccountConfigurationRepository AccountConfigurations { get; }
        public IRoleConfigurationRepository RoleConfigurations { get; }

        public async Task<int> Save()
        {
            return await _context.SaveChangesAsync();
        }

        private bool disposed = false;

        protected virtual void Dispose(bool disposing)
        {
            if (!disposed)
            {
                if (disposing)
                {
                    _context.Dispose();
                }
            }
            disposed = true;
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
    }
}
