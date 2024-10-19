namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class IssueTranslationView
    {
        public Guid IssueId { get; set; }
        public string CultureCode { get; set; } = null!;
        public string? IssueText { get; set; }
        public string? LongTermResolutionText { get; set; }
        public string? ResolutionText { get; set; }
        public string? QrCodeImageRelativePath { get; set; }
    }
}
