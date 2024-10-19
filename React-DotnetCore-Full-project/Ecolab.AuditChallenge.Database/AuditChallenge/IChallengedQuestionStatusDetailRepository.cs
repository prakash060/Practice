using Ecolab.AuditChallenge.Database.AuditChallenge.Models;

namespace Ecolab.AuditChallenge.Database.AuditChallenge
{
    public interface IChallengedQuestionStatusDetailRepository
    {
        Task<IEnumerable<ChallengedQuestionDetail>> GetChallengedQuestionStatusDetails();
        Task<ChallengedQuestionDetail> GetChallengedQuestionStatusDetailById(Guid challengedQuestionStatusDetailId);
        Task InsertChallengedQuestionStatusDetail(ChallengedQuestionDetail challengedQuestionStatusDetail);
        Task DeleteChallengedQuestionStatusDetail(Guid challengedQuestionStatusDetailId);
        Task UpdateChallengedQuestionStatusDetail(ChallengedQuestionDetail challengedQuestionStatusDetail);
        Task<ChallengedQuestionDetail> GetChallengedQuestionsByChallengedQuestionId(Guid challengedQuestionId);
    }
}
