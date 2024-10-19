namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class ObservationImageCapture
    {
        public Guid ObservationImageCaptureId { get; set; }
        public Guid ObservationId { get; set; }
        public Guid ImageCaptureId { get; set; }
        public bool? IsActive { get; set; }
        public DateTime ChangeDate { get; set; }

        public virtual ImageCapture ImageCapture { get; set; } = null!;
    }
}
