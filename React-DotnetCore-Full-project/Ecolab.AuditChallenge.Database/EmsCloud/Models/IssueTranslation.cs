namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class IssueTranslation
    {
        public string CultureCode { get; set; } = null!;
        public Guid IssueId { get; set; }
        public string IssueText { get; set; } = null!;
        public string? LongTermResolutionText { get; set; }
        public string? ResolutionText { get; set; }
        public DateTime ChangeDate { get; set; }
        public bool? IsActive { get; set; }
        public string? QrCodeImageRelativePath { get; set; }

        public virtual Culture CultureCodeNavigation { get; set; } = null!;
        public virtual Issue Issue { get; set; } = null!;
    }
}
