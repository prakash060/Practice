namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class ImageCapture
    {
        public ImageCapture()
        {
            ObservationImageCaptures = new HashSet<ObservationImageCapture>();
            ObservationIssueImageCaptures = new HashSet<ObservationIssueImageCapture>();
            ServiceResponseImageCaptures = new HashSet<ServiceResponseImageCapture>();
        }

        public Guid ImageCaptureId { get; set; }
        public string ImagePath { get; set; } = null!;
        public bool IsActive { get; set; }
        public DateTime ChangeDate { get; set; }

        public virtual ICollection<ObservationImageCapture> ObservationImageCaptures { get; set; }
        public virtual ICollection<ObservationIssueImageCapture> ObservationIssueImageCaptures { get; set; }
        public virtual ICollection<ServiceResponseImageCapture> ServiceResponseImageCaptures { get; set; }
    }
}
