using Ecolab.AuditChallenge.Database.AuditChallenge.Models;
using Microsoft.EntityFrameworkCore;

namespace Ecolab.AuditChallenge.Database.AuditChallenge
{
    public class AuditChallengeContext : DbContext
    {
        public AuditChallengeContext()
        {

        }

        public AuditChallengeContext(DbContextOptions<AuditChallengeContext> options) : base(options)
        {
        }

        public virtual DbSet<ChallengedAudit> ChallengedAudits { get; set; }
        public virtual DbSet<ChallengedQuestion> ChallengedQuestions { get; set; }
        public virtual DbSet<ChallengedQuestionDetail> ChallengedQuestionStatusDetails { get; set; }
        public virtual DbSet<AccountConfiguration> AccountConfigurations { get; set; }
        public virtual DbSet<RoleConfiguration> RoleConfigurations { get; set; }
    }
}
