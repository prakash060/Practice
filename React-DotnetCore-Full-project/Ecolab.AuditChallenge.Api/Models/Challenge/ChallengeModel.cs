namespace Ecolab.AuditChallenge.Api.Models.Challenge
{
    public class ChallengeModel
    {
        public ChallengeAuditModel ChallengeAudit { get; set; }
        public List<ChallengeQuestionModel> ChallengeQuestions { get; set; }
        public string UserName { get; set; }
    }
}
