namespace Ecolab.AuditChallenge.Database.EmsCloud.Models
{
    public partial class Location
    {
        public Location()
        {
            LocationAlignments = new HashSet<LocationAlignment>();
        }

        public Guid LocationId { get; set; }
        public Guid AccountId { get; set; }
        public Guid AddressId { get; set; }
        public string Name { get; set; } = null!;
        public string PrimaryTelephoneNumber { get; set; } = null!;
        public string TerritoryNumber { get; set; } = null!;
        public Guid? AccountGroupId { get; set; }
        public string? CrmIntegrationId { get; set; }
        public string? LocationIdentifier { get; set; }
        public bool IsActive { get; set; }
        public string? ContractName { get; set; }
        public string? ContractNumber { get; set; }
        public string? CustomerAccountNumber { get; set; }
        public DateTime ChangeDate { get; set; }
        public bool IsNew { get; set; }
        public bool IsDirty { get; set; }
        public bool IsServiceable { get; set; }
        public Guid? LocationFormatId { get; set; }
        public string? LocationIdentifierNumeric { get; set; }
        public string? PreviousTerritoryNumber { get; set; }
        public string? AlternateEmailAddress { get; set; }
        public Guid? LocationVisitFrequencyId { get; set; }
        public DateTime? VisitFrequencyStartDate { get; set; }
        public int? ServiceLocationId { get; set; }

        public virtual Account Account { get; set; } = null!;
        public virtual Address Address { get; set; } = null!;
        public virtual LocationLastSurveyVisit? LocationLastSurveyVisit { get; set; }
        public virtual ICollection<LocationAlignment> LocationAlignments { get; set; }
    }
}
