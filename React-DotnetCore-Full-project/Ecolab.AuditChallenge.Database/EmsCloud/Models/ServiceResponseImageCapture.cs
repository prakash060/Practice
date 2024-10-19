namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class ServiceResponseImageCapture
    {
        public Guid ServiceResponseImageCaptureId { get; set; }
        public Guid ServiceResponseId { get; set; }
        public Guid ImageCaptureId { get; set; }
        public bool? IsActive { get; set; }
        public DateTime ChangeDate { get; set; }

        public virtual ImageCapture ImageCapture { get; set; } = null!;
    }
}
