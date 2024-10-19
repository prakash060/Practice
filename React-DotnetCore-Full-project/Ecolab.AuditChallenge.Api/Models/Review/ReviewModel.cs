namespace Ecolab.AuditChallenge.Api.Models.Review
{
    public class ReviewModel
    {
        public ReviewAuditModel ReviewAudit { get; set; }
        public List<ReviewQuestionModel> ReviewQuestions { get; set; }
    }
}
