using Ecolab.AuditChallenge.Api.Models.Challenge;
using Ecolab.AuditChallenge.Api.Models.Review;

namespace Ecolab.AuditChallenge.Api.Contracts
{
    public interface IChallengeService
    {
        
        Task<IEnumerable<ChallengeAuditModel>> GetChallengeAudits(IEnumerable<Guid> locations);
        Task<IEnumerable<ReviewAuditModel>> GetReviewAudits(IEnumerable<Guid> locations);
        Task<IEnumerable<ChallengeQuestionModel>> GetChallengeQuestions(Guid serviceResponseId);
        Task<IEnumerable<ReviewQuestionModel>> GetReviewQuestions(Guid serviceResponseId);
        Task SaveChallenge(ChallengeModel challenge);
        Task SaveReview(ReviewModel reviewModel);
    }
}
