using Ecolab.AuditChallenge.Database.AuditChallenge.Models;
namespace Ecolab.AuditChallenge.Database.AuditChallenge
{
    public class ChallengedQuestionStatusDetailRepository : Repository<ChallengedQuestionDetail>, IChallengedQuestionStatusDetailRepository
    {
        public ChallengedQuestionStatusDetailRepository(AuditChallengeContext context) : base(context)
        {
        }

        public async Task<IEnumerable<ChallengedQuestionDetail>> GetChallengedQuestionStatusDetails()
        {
            return await FindAll();
        }
        public async Task<ChallengedQuestionDetail> GetChallengedQuestionStatusDetailById(Guid challengedQuestionStatusDetailId)
        {
            return await FindById(challengedQuestionStatusDetailId);
        }

        public async Task InsertChallengedQuestionStatusDetail(ChallengedQuestionDetail challengedQuestionStatusDetail)
        {
            await Create(challengedQuestionStatusDetail);
        }

        public async Task UpdateChallengedQuestionStatusDetail(ChallengedQuestionDetail challengedQuestionStatusDetail)
        {
            await Update(challengedQuestionStatusDetail);
        }
        public async Task DeleteChallengedQuestionStatusDetail(Guid challengedQuestionStatusDetailId)
        {
            await Delete(challengedQuestionStatusDetailId);
        }

        public async Task<ChallengedQuestionDetail> GetChallengedQuestionsByChallengedQuestionId(Guid challengedQuestionId)
        {
            var questionStatusDetails = await FindByCondition(q => q.ChallengedQuestionId == challengedQuestionId && q.IsActive);

            return questionStatusDetails.ToList().FirstOrDefault();
        }
    }
}
