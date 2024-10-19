namespace Ecolab.AuditChallenge.Api.Models.Challenge
{
    public class ChallengeQuestionModel
    {
        public Guid Id { get; set; }
        public Guid ChallengedAuditId { get; set; }
        public Guid ServiceResponseId { get; set; }
        public Guid SurveyQuestionId { get; set; }
        public int QuestionNumber { get; set; }
        public string QuestionText { get; set; }
        public string Notes { get; set; }
        public string PickLists { get; set; }
        public bool IsChallenged { get; set; }
        public bool IsReviewed { get; set; }
        public string? ReviewedBy { get; set; }
        public DateTime? ReviewedDate { get; set; }
        public DateTime? ChangedDate { get; set; }
        public bool IsActive { get; set; }
        public string? ChallengeNotes { get; set; }
        public string? ReviewNotes { get; set; }
        public string? DepartmentName { get; set; }
    }
}
