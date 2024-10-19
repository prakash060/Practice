namespace Ecolab.AuditChallenge.Database.CdmCloud.Models
{
    public partial class ConnectAccountStage
    {
        public int AccountKey { get; set; }
        public int? ParentAccountKey { get; set; }
        public int CustomerKey { get; set; }
        public string? AccountNumber { get; set; }
        public string? AccountName { get; set; }
        public string? AccountNameEnglish { get; set; }
        public string? CustomerAccountName { get; set; }
        public string? ParentAccountNumber { get; set; }
        public string? SoldToAccountNumber { get; set; }
        public string? PartnerFunction { get; set; }
        public string AccountStatusCode { get; set; } = null!;
        public string AccountTypeCode { get; set; } = null!;
        public bool IsDemo { get; set; }
        public string? SalesOrg { get; set; }
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? AddressLine3 { get; set; }
        public string? AddressLine4 { get; set; }
        public string? City { get; set; }
        public string? StateProvince { get; set; }
        public string? PostalCode { get; set; }
        public string? CountryIso3Code { get; set; }
        public string? BusinessUnitCode { get; set; }
        public string SourceSystemCode { get; set; } = null!;
        public string CreatedBy { get; set; } = null!;
        public DateTime CreatedOn { get; set; }
        public string ModifiedBy { get; set; } = null!;
        public DateTime ModifiedOn { get; set; }
        public int? DataIntgExecId { get; set; }
        public string? BusinessUnitName { get; set; }
        public string? StateProvinceCode { get; set; }
        public string? OriginationAccountSystemCode { get; set; }
        public string? DivisionalBusinessUnitCode { get; set; }
        public string? DivisionalBusinessUnitName { get; set; }
        public string? GlobalBusinessUnitCode { get; set; }
        public string? GlobalBusinessUnitName { get; set; }
        public string? AccountName2 { get; set; }
        public string? AccountName3 { get; set; }
        public string? AccountName4 { get; set; }
        public string? MarketSegmentCode { get; set; }
        public string? MarketSegmentDescription { get; set; }
        public string? SincCode { get; set; }
        public string? AgreementCode { get; set; }
        public string? AgreementDesc { get; set; }
        public string? UnitNumber { get; set; }
    }
}
