using Ecolab.AuditChallenge.Database.AuditChallenge.Models;

namespace Ecolab.AuditChallenge.Database.AuditChallenge
{
    public interface IChallengedQuestionRepository
    {
        Task<IEnumerable<ChallengedQuestion>> GetChallengedQuestions();
        Task<ChallengedQuestion> GetChallengedQuestionById(Guid challengedQuestionId);
        Task<ChallengedQuestion> InsertChallengedQuestion(ChallengedQuestion challengedQuestion);
        Task DeleteChallengedQuestion(Guid challengedQuestionId);
        Task UpdateChallengedQuestion(ChallengedQuestion challengedQuestion);
        Task<IEnumerable<ChallengedQuestion>> GetChallengedQuestionsByChallengedAuditId(Guid challengedAuditId);
    }
}
