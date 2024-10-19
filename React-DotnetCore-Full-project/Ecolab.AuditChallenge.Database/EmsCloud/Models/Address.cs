namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class Address
    {
        public Address()
        {
            Locations = new HashSet<Location>();
        }

        public Guid AddressId { get; set; }
        public string Address1 { get; set; } = null!;
        public string CityName { get; set; } = null!;
        public string CountryCode { get; set; } = null!;
        public string? Address2 { get; set; }
        public string? Address3 { get; set; }
        public string? PostalCode { get; set; }
        public string? SubdivisionCode { get; set; }
        public DateTime ChangeDate { get; set; }
        public bool IsActive { get; set; }

        public virtual ICollection<Location> Locations { get; set; }
    }
}
