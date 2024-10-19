namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class ObservationIssueImageCapture
    {
        public Guid ObservationIssueImageCaptureId { get; set; }
        public Guid ImageCaptureId { get; set; }
        public Guid ObservationIssueId { get; set; }
        public bool? IsActive { get; set; }
        public DateTime ChangeDate { get; set; }

        public virtual ImageCapture ImageCapture { get; set; } = null!;
    }
}
