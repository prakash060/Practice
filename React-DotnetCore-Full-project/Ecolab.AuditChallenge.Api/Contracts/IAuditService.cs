using Ecolab.AuditChallenge.Api.Models;
using Ecolab.AuditChallenge.Api.Models.Challenge;
using Ecolab.AuditChallenge.Api.Models.Review;

namespace Ecolab.AuditChallenge.Api.Contracts
{
    public interface IAuditService
    {
        Task<IEnumerable<ChallengeAuditModel>> GetChallengeAudits(string email);
        Task<IEnumerable<ReviewAuditModel>> GetReviewAudits(string email);
        Task<List<ChallengeQuestionModel>> GetChallengeQuestions(Guid serviceResponseId);
        Task<List<ReviewQuestionModel>> GetReviewQuestions(Guid serviceResponseId);
        Task SaveChallenge(ChallengeModel challenge);
        Task SaveReview(ReviewModel review);
        Task<FileDownloadResponse> GetServiceReport(Guid serviceResponseId);
        Task<string> GetServiceReportPath(Guid serviceResponseId);
    }
}
