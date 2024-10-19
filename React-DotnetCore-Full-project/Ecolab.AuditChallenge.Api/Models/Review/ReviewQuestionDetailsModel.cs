namespace Ecolab.AuditChallenge.Api.Models.Review
{
    public class ReviewQuestionDetailsModel
    {
        public Guid Id { get; set; }
        public Guid ChallengedQuestionId { get; set; }
        public string ChallengedBy { get; set; }
        public DateTime ChallengedDate { get; set; }
        public string ChallengeNotes { get; set; }
        public string? ReviewedBy { get; set; }
        public DateTime? ReviewedDate { get; set; }
        public string? ReviewNotes { get; set; }
        public int Status { get; set; }
        public DateTime ChangedDate { get; set; }
        public bool IsActive { get; set; }
        public string DepartmentName { get; set; }
    }
}
