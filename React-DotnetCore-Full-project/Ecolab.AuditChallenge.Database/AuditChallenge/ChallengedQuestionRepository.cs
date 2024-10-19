using Ecolab.AuditChallenge.Database.AuditChallenge.Models;
using Microsoft.EntityFrameworkCore;

namespace Ecolab.AuditChallenge.Database.AuditChallenge
{
    public class ChallengedQuestionRepository : Repository<ChallengedQuestion>, IChallengedQuestionRepository
    {
        private readonly AuditChallengeContext _context;
        public ChallengedQuestionRepository(AuditChallengeContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ChallengedQuestion>> GetChallengedQuestions()
        {
            return await FindAll();
        }

        public async Task<ChallengedQuestion> GetChallengedQuestionById(Guid challengedQuestionId)
        {
            return await FindById(challengedQuestionId);
        }

        public async Task<ChallengedQuestion> InsertChallengedQuestion(ChallengedQuestion challengedQuestion)
        {
           return await Create(challengedQuestion);
        }
        public async Task DeleteChallengedQuestion(Guid challengedQuestionId)
        {
            await Delete(challengedQuestionId);
        }

        public async Task UpdateChallengedQuestion(ChallengedQuestion challengedQuestion)
        {
            await Update(challengedQuestion);
        }

        public async Task<IEnumerable<ChallengedQuestion>> GetChallengedQuestionsByChallengedAuditId(Guid challengedAuditId)
        {
            return  await _context.ChallengedQuestions.Include(x => x.ChallengedQuestionStatusDetails)
                            .Where(x => x.ChallengedAuditId == challengedAuditId).ToListAsync();
        }
    }
}
