namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class Subdivision
    {
        public string SubdivisionCode { get; set; } = null!;
        public string CountryCode { get; set; } = null!;
        public string Name { get; set; } = null!;
        public DateTime ChangeDate { get; set; }
        public bool IsActive { get; set; }
    }
}
