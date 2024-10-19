using Ecolab.AuditChallenge.Database.CdmCloud.Models;
using Microsoft.EntityFrameworkCore;

namespace Ecolab.AuditChallenge.Database.CdmCloud
{
    public partial class CdmSnapshotContext : DbContext
    {
        public CdmSnapshotContext()
        {
        }

        public CdmSnapshotContext(DbContextOptions<CdmSnapshotContext> options)
            : base(options)
        {
        }

        public virtual DbSet<ConnectAccount> ConnectAccounts { get; set; } = null!;
        public virtual DbSet<ConnectAccountStage> ConnectAccountStages { get; set; } = null!;
        public virtual DbSet<ConnectUserAccount> ConnectUserAccounts { get; set; } = null!;
        public virtual DbSet<ConnectUserAccountStage> ConnectUserAccountStages { get; set; } = null!;
        public virtual DbSet<CustomerSiteCvocFlat> CustomerSiteCvocFlats { get; set; } = null!;
        public virtual DbSet<CustomerSiteCvocFlatStage> CustomerSiteCvocFlatStages { get; set; } = null!;
        public virtual DbSet<EcolabEvocFlat> EcolabEvocFlats { get; set; } = null!;
        public virtual DbSet<EcolabEvocFlatStage> EcolabEvocFlatStages { get; set; } = null!;
        public virtual DbSet<Permission> Permissions { get; set; } = null!;
        public virtual DbSet<PermissionStage> PermissionStages { get; set; } = null!;
        public virtual DbSet<User> Users { get; set; } = null!;
        public virtual DbSet<UserContextPoint> UserContextPoints { get; set; } = null!;
        public virtual DbSet<UserContextPointStage> UserContextPointStages { get; set; } = null!;
        public virtual DbSet<UserPermission> UserPermissions { get; set; } = null!;
        public virtual DbSet<UserPermissionStage> UserPermissionStages { get; set; } = null!;
        public virtual DbSet<UserStage> UserStages { get; set; } = null!;
        public virtual DbSet<UserAccountDetail> UserAccountDetails { get; set; } = null!;
        public virtual DbSet<UserList> UserEmailLists { get; set; } = null!;

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer("data source=ecokaydws.database.windows.net;initial catalog=CdmSnapshot;user id=KayWarehouseAdmin;password=!nt3gr@te.Db0;");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<UserAccountDetail>(entity => {
                entity.HasNoKey();
            });

            modelBuilder.Entity<UserList>(entity => {
                entity.HasNoKey();
            });

            modelBuilder.Entity<ConnectAccount>(entity =>
            {
                entity.HasKey(e => e.AccountKey);

                entity.ToTable("ConnectAccount");

                entity.HasIndex(e => e.AccountName, "ConnectAccount_AccountName");

                entity.HasIndex(e => e.AccountNumber, "ConnectAccount_AccountNumber");

                entity.HasIndex(e => e.BusinessUnitCode, "ConnectAccount_BusinessUnitCode");

                entity.HasIndex(e => e.CustomerAccountName, "ConnectAccount_CustomerAccountName");

                entity.HasIndex(e => e.CustomerKey, "ConnectAccount_CustomerKey");

                entity.HasIndex(e => e.ParentAccountKey, "ConnectAccount_ParentAccountKey");

                entity.HasIndex(e => e.ParentAccountNumber, "ConnectAccount_ParentAccountNumber");

                entity.Property(e => e.AccountKey).ValueGeneratedNever();

                entity.Property(e => e.AccountName).HasMaxLength(100);

                entity.Property(e => e.AccountName2).HasMaxLength(100);

                entity.Property(e => e.AccountName3).HasMaxLength(100);

                entity.Property(e => e.AccountName4).HasMaxLength(100);

                entity.Property(e => e.AccountNameEnglish).HasMaxLength(100);

                entity.Property(e => e.AccountNumber).HasMaxLength(255);

                entity.Property(e => e.AccountStatusCode).HasMaxLength(1);

                entity.Property(e => e.AccountTypeCode).HasMaxLength(10);

                entity.Property(e => e.AddressLine1).HasMaxLength(100);

                entity.Property(e => e.AddressLine2).HasMaxLength(100);

                entity.Property(e => e.AddressLine3).HasMaxLength(100);

                entity.Property(e => e.AddressLine4).HasMaxLength(100);

                entity.Property(e => e.AgreementCode).HasMaxLength(100);

                entity.Property(e => e.AgreementDesc).HasMaxLength(100);

                entity.Property(e => e.BusinessUnitCode).HasMaxLength(10);

                entity.Property(e => e.BusinessUnitName).HasMaxLength(100);

                entity.Property(e => e.City).HasMaxLength(100);

                entity.Property(e => e.CountryIso3Code).HasMaxLength(3);

                entity.Property(e => e.CreatedBy).HasMaxLength(100);

                entity.Property(e => e.CustomerAccountName).HasMaxLength(255);

                entity.Property(e => e.DivisionalBusinessUnitCode).HasMaxLength(10);

                entity.Property(e => e.DivisionalBusinessUnitName).HasMaxLength(100);

                entity.Property(e => e.GlobalBusinessUnitCode).HasMaxLength(10);

                entity.Property(e => e.GlobalBusinessUnitName).HasMaxLength(100);

                entity.Property(e => e.MarketSegmentCode).HasMaxLength(100);

                entity.Property(e => e.MarketSegmentDescription).HasMaxLength(100);

                entity.Property(e => e.ModifiedBy).HasMaxLength(100);

                entity.Property(e => e.OriginationAccountSystemCode).HasMaxLength(50);

                entity.Property(e => e.ParentAccountNumber).HasMaxLength(255);

                entity.Property(e => e.PartnerFunction).HasMaxLength(100);

                entity.Property(e => e.PostalCode).HasMaxLength(100);

                entity.Property(e => e.SalesOrg).HasMaxLength(4);

                entity.Property(e => e.SincCode).HasMaxLength(50);

                entity.Property(e => e.SoldToAccountNumber).HasMaxLength(255);

                entity.Property(e => e.SourceSystemCode).HasMaxLength(50);

                entity.Property(e => e.StateProvince).HasMaxLength(100);

                entity.Property(e => e.StateProvinceCode).HasMaxLength(10);

                entity.Property(e => e.UnitNumber).HasMaxLength(100);
            });

            modelBuilder.Entity<ConnectAccountStage>(entity =>
            {
                entity.HasKey(e => e.AccountKey);

                entity.ToTable("ConnectAccountStage");

                entity.HasIndex(e => e.AccountName, "ConnectAccountStage_AccountName");

                entity.HasIndex(e => e.AccountNumber, "ConnectAccountStage_AccountNumber");

                entity.HasIndex(e => e.BusinessUnitCode, "ConnectAccountStage_BusinessUnitCode");

                entity.HasIndex(e => e.CustomerAccountName, "ConnectAccountStage_CustomerAccountName");

                entity.HasIndex(e => e.CustomerKey, "ConnectAccountStage_CustomerKey");

                entity.HasIndex(e => e.ParentAccountKey, "ConnectAccountStage_ParentAccountKey");

                entity.HasIndex(e => e.ParentAccountNumber, "ConnectAccountStage_ParentAccountNumber");

                entity.Property(e => e.AccountKey).ValueGeneratedNever();

                entity.Property(e => e.AccountName).HasMaxLength(100);

                entity.Property(e => e.AccountName2).HasMaxLength(100);

                entity.Property(e => e.AccountName3).HasMaxLength(100);

                entity.Property(e => e.AccountName4).HasMaxLength(100);

                entity.Property(e => e.AccountNameEnglish).HasMaxLength(100);

                entity.Property(e => e.AccountNumber).HasMaxLength(255);

                entity.Property(e => e.AccountStatusCode).HasMaxLength(1);

                entity.Property(e => e.AccountTypeCode).HasMaxLength(10);

                entity.Property(e => e.AddressLine1).HasMaxLength(100);

                entity.Property(e => e.AddressLine2).HasMaxLength(100);

                entity.Property(e => e.AddressLine3).HasMaxLength(100);

                entity.Property(e => e.AddressLine4).HasMaxLength(100);

                entity.Property(e => e.AgreementCode).HasMaxLength(100);

                entity.Property(e => e.AgreementDesc).HasMaxLength(100);

                entity.Property(e => e.BusinessUnitCode).HasMaxLength(10);

                entity.Property(e => e.BusinessUnitName).HasMaxLength(100);

                entity.Property(e => e.City).HasMaxLength(100);

                entity.Property(e => e.CountryIso3Code).HasMaxLength(3);

                entity.Property(e => e.CreatedBy).HasMaxLength(100);

                entity.Property(e => e.CustomerAccountName).HasMaxLength(255);

                entity.Property(e => e.DivisionalBusinessUnitCode).HasMaxLength(10);

                entity.Property(e => e.DivisionalBusinessUnitName).HasMaxLength(100);

                entity.Property(e => e.GlobalBusinessUnitCode).HasMaxLength(10);

                entity.Property(e => e.GlobalBusinessUnitName).HasMaxLength(100);

                entity.Property(e => e.MarketSegmentCode).HasMaxLength(100);

                entity.Property(e => e.MarketSegmentDescription).HasMaxLength(100);

                entity.Property(e => e.ModifiedBy).HasMaxLength(100);

                entity.Property(e => e.OriginationAccountSystemCode).HasMaxLength(50);

                entity.Property(e => e.ParentAccountNumber).HasMaxLength(255);

                entity.Property(e => e.PartnerFunction).HasMaxLength(100);

                entity.Property(e => e.PostalCode).HasMaxLength(100);

                entity.Property(e => e.SalesOrg).HasMaxLength(4);

                entity.Property(e => e.SincCode).HasMaxLength(50);

                entity.Property(e => e.SoldToAccountNumber).HasMaxLength(255);

                entity.Property(e => e.SourceSystemCode).HasMaxLength(50);

                entity.Property(e => e.StateProvince).HasMaxLength(100);

                entity.Property(e => e.StateProvinceCode).HasMaxLength(10);

                entity.Property(e => e.UnitNumber).HasMaxLength(100);
            });

            modelBuilder.Entity<ConnectUserAccount>(entity =>
            {
                entity.HasKey(e => e.ConnectUserAccountStageId)
                    .HasName("PK_ConnectUserAccountStage");

                entity.ToTable("ConnectUserAccount");

                entity.HasIndex(e => e.AlignmentType, "ConnectUserAccount_AlignmentType");

                entity.Property(e => e.AlignmentType).HasMaxLength(255);

                entity.Property(e => e.CreatedBy).HasMaxLength(100);

                entity.Property(e => e.DivisionalBusinessUnitCode).HasMaxLength(10);

                entity.Property(e => e.ModifiedBy).HasMaxLength(100);

                entity.Property(e => e.PartnerFunction).HasMaxLength(100);
            });

            modelBuilder.Entity<ConnectUserAccountStage>(entity =>
            {
                entity.HasKey(e => e.ConnectUserAccountId)
                    .HasName("PK_ConnectUserAccount");

                entity.ToTable("ConnectUserAccountStage");

                entity.HasIndex(e => e.AlignmentType, "ConnectUserAccountStage_AlignmentType");

                entity.Property(e => e.AlignmentType).HasMaxLength(255);

                entity.Property(e => e.CreatedBy).HasMaxLength(100);

                entity.Property(e => e.DivisionalBusinessUnitCode).HasMaxLength(10);

                entity.Property(e => e.ModifiedBy).HasMaxLength(100);

                entity.Property(e => e.PartnerFunction).HasMaxLength(100);
            });

            modelBuilder.Entity<CustomerSiteCvocFlat>(entity =>
            {
                entity.HasNoKey();

                entity.ToTable("CustomerSiteCvocFlat");

                entity.HasIndex(e => e.CustomerName, "CustomerSiteCvocFlat_CustomerName");

                entity.HasIndex(e => e.HierarchyModifiedDate, "CustomerSiteCvocFlat_HierarchyModifiedDate");

                entity.HasIndex(e => e.SiteKey, "CustomerSiteCvocFlat_SiteKey");

                entity.Property(e => e.CustomerName).HasMaxLength(255);

                entity.Property(e => e.CustomerSiteCvocFlatId).ValueGeneratedOnAdd();

                entity.Property(e => e.CustsiteContextPointDescription).HasMaxLength(10);

                entity.Property(e => e.CustsiteContextPointName).HasMaxLength(255);

                entity.Property(e => e.HierarchyReferenceNodeDescription).HasMaxLength(100);

                entity.Property(e => e.HierarchyReferenceNodeName).HasMaxLength(255);

                entity.Property(e => e.Level10ContextPointDescription).HasMaxLength(750);

                entity.Property(e => e.Level10ContextPointKey).HasMaxLength(750);

                entity.Property(e => e.Level10ContextPointName).HasMaxLength(750);

                entity.Property(e => e.Level1ContextPointDescription).HasMaxLength(750);

                entity.Property(e => e.Level1ContextPointKey).HasMaxLength(750);

                entity.Property(e => e.Level1ContextPointName).HasMaxLength(750);

                entity.Property(e => e.Level2ContextPointDescription).HasMaxLength(750);

                entity.Property(e => e.Level2ContextPointKey).HasMaxLength(750);

                entity.Property(e => e.Level2ContextPointName).HasMaxLength(750);

                entity.Property(e => e.Level3ContextPointDescription).HasMaxLength(750);

                entity.Property(e => e.Level3ContextPointKey).HasMaxLength(750);

                entity.Property(e => e.Level3ContextPointName).HasMaxLength(750);

                entity.Property(e => e.Level4ContextPointDescription).HasMaxLength(750);

                entity.Property(e => e.Level4ContextPointKey).HasMaxLength(750);

                entity.Property(e => e.Level4ContextPointName).HasMaxLength(750);

                entity.Property(e => e.Level5ContextPointDescription).HasMaxLength(750);

                entity.Property(e => e.Level5ContextPointKey).HasMaxLength(750);

                entity.Property(e => e.Level5ContextPointName).HasMaxLength(750);

                entity.Property(e => e.Level6ContextPointDescription).HasMaxLength(750);

                entity.Property(e => e.Level6ContextPointKey).HasMaxLength(750);

                entity.Property(e => e.Level6ContextPointName).HasMaxLength(750);

                entity.Property(e => e.Level7ContextPointDescription).HasMaxLength(750);

                entity.Property(e => e.Level7ContextPointKey).HasMaxLength(750);

                entity.Property(e => e.Level7ContextPointName).HasMaxLength(750);

                entity.Property(e => e.Level8ContextPointDescription).HasMaxLength(750);

                entity.Property(e => e.Level8ContextPointKey).HasMaxLength(750);

                entity.Property(e => e.Level8ContextPointName).HasMaxLength(750);

                entity.Property(e => e.Level9ContextPointDescription).HasMaxLength(750);

                entity.Property(e => e.Level9ContextPointKey).HasMaxLength(750);

                entity.Property(e => e.Level9ContextPointName).HasMaxLength(750);

                entity.Property(e => e.SourceSystemCode).HasMaxLength(50);
            });

            modelBuilder.Entity<CustomerSiteCvocFlatStage>(entity =>
            {
                entity.HasNoKey();

                entity.ToTable("CustomerSiteCvocFlatStage");

                entity.HasIndex(e => e.CustomerName, "CustomerSiteCvocFlatStage_CustomerName");

                entity.HasIndex(e => e.HierarchyModifiedDate, "CustomerSiteCvocFlatStage_HierarchyModifiedDate");

                entity.HasIndex(e => e.SiteKey, "CustomerSiteCvocFlatStage_SiteKey");

                entity.Property(e => e.CustomerName).HasMaxLength(255);

                entity.Property(e => e.CustomerSiteCvocFlatStageId).ValueGeneratedOnAdd();

                entity.Property(e => e.CustsiteContextPointDescription).HasMaxLength(10);

                entity.Property(e => e.CustsiteContextPointName).HasMaxLength(255);

                entity.Property(e => e.HierarchyReferenceNodeDescription).HasMaxLength(100);

                entity.Property(e => e.HierarchyReferenceNodeName).HasMaxLength(255);

                entity.Property(e => e.Level10ContextPointDescription).HasMaxLength(750);

                entity.Property(e => e.Level10ContextPointKey).HasMaxLength(750);

                entity.Property(e => e.Level10ContextPointName).HasMaxLength(750);

                entity.Property(e => e.Level1ContextPointDescription).HasMaxLength(750);

                entity.Property(e => e.Level1ContextPointKey).HasMaxLength(750);

                entity.Property(e => e.Level1ContextPointName).HasMaxLength(750);

                entity.Property(e => e.Level2ContextPointDescription).HasMaxLength(750);

                entity.Property(e => e.Level2ContextPointKey).HasMaxLength(750);

                entity.Property(e => e.Level2ContextPointName).HasMaxLength(750);

                entity.Property(e => e.Level3ContextPointDescription).HasMaxLength(750);

                entity.Property(e => e.Level3ContextPointKey).HasMaxLength(750);

                entity.Property(e => e.Level3ContextPointName).HasMaxLength(750);

                entity.Property(e => e.Level4ContextPointDescription).HasMaxLength(750);

                entity.Property(e => e.Level4ContextPointKey).HasMaxLength(750);

                entity.Property(e => e.Level4ContextPointName).HasMaxLength(750);

                entity.Property(e => e.Level5ContextPointDescription).HasMaxLength(750);

                entity.Property(e => e.Level5ContextPointKey).HasMaxLength(750);

                entity.Property(e => e.Level5ContextPointName).HasMaxLength(750);

                entity.Property(e => e.Level6ContextPointDescription).HasMaxLength(750);

                entity.Property(e => e.Level6ContextPointKey).HasMaxLength(750);

                entity.Property(e => e.Level6ContextPointName).HasMaxLength(750);

                entity.Property(e => e.Level7ContextPointDescription).HasMaxLength(750);

                entity.Property(e => e.Level7ContextPointKey).HasMaxLength(750);

                entity.Property(e => e.Level7ContextPointName).HasMaxLength(750);

                entity.Property(e => e.Level8ContextPointDescription).HasMaxLength(750);

                entity.Property(e => e.Level8ContextPointKey).HasMaxLength(750);

                entity.Property(e => e.Level8ContextPointName).HasMaxLength(750);

                entity.Property(e => e.Level9ContextPointDescription).HasMaxLength(750);

                entity.Property(e => e.Level9ContextPointKey).HasMaxLength(750);

                entity.Property(e => e.Level9ContextPointName).HasMaxLength(750);

                entity.Property(e => e.SourceSystemCode).HasMaxLength(50);
            });

            modelBuilder.Entity<EcolabEvocFlat>(entity =>
            {
                entity.ToTable("EcolabEvocFlat");

                entity.HasIndex(e => e.SldtoAcctContextPointName, "EcolabEvocFlat_SLDToAcctContextPointName");

                entity.HasIndex(e => e.SlsacctContextPointName, "EcolabEvocFlat_SLSAcctContextPointName");

                entity.Property(e => e.HierarchyReferenceNodeDescription).HasMaxLength(100);

                entity.Property(e => e.HierarchyReferenceNodeName).HasMaxLength(255);

                entity.Property(e => e.HierarchyReferenceNodeStatus)
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength();

                entity.Property(e => e.Level10ContextPointDescription).HasMaxLength(4000);

                entity.Property(e => e.Level10ContextPointKey).HasMaxLength(4000);

                entity.Property(e => e.Level10ContextPointName).HasMaxLength(4000);

                entity.Property(e => e.Level1ContextPointDescription).HasMaxLength(4000);

                entity.Property(e => e.Level1ContextPointKey).HasMaxLength(4000);

                entity.Property(e => e.Level1ContextPointName).HasMaxLength(4000);

                entity.Property(e => e.Level2ContextPointDescription).HasMaxLength(4000);

                entity.Property(e => e.Level2ContextPointKey).HasMaxLength(4000);

                entity.Property(e => e.Level2ContextPointName).HasMaxLength(4000);

                entity.Property(e => e.Level3ContextPointDescription).HasMaxLength(4000);

                entity.Property(e => e.Level3ContextPointKey).HasMaxLength(4000);

                entity.Property(e => e.Level3ContextPointName).HasMaxLength(4000);

                entity.Property(e => e.Level4ContextPointDescription).HasMaxLength(4000);

                entity.Property(e => e.Level4ContextPointKey).HasMaxLength(4000);

                entity.Property(e => e.Level4ContextPointName).HasMaxLength(4000);

                entity.Property(e => e.Level5ContextPointDescription).HasMaxLength(4000);

                entity.Property(e => e.Level5ContextPointKey).HasMaxLength(4000);

                entity.Property(e => e.Level5ContextPointName).HasMaxLength(4000);

                entity.Property(e => e.Level6ContextPointDescription).HasMaxLength(4000);

                entity.Property(e => e.Level6ContextPointKey).HasMaxLength(4000);

                entity.Property(e => e.Level6ContextPointName).HasMaxLength(4000);

                entity.Property(e => e.Level7ContextPointDescription).HasMaxLength(4000);

                entity.Property(e => e.Level7ContextPointKey).HasMaxLength(4000);

                entity.Property(e => e.Level7ContextPointName).HasMaxLength(4000);

                entity.Property(e => e.Level8ContextPointDescription).HasMaxLength(4000);

                entity.Property(e => e.Level8ContextPointKey).HasMaxLength(4000);

                entity.Property(e => e.Level8ContextPointName).HasMaxLength(4000);

                entity.Property(e => e.Level9ContextPointDescription).HasMaxLength(4000);

                entity.Property(e => e.Level9ContextPointKey).HasMaxLength(4000);

                entity.Property(e => e.Level9ContextPointName).HasMaxLength(4000);

                entity.Property(e => e.SldacctContextPointDescription)
                    .HasMaxLength(10)
                    .HasColumnName("SLDAcctContextPointDescription");

                entity.Property(e => e.SldtoAcctContextPointEdgeStatus)
                    .HasMaxLength(1)
                    .HasColumnName("SLDToAcctContextPointEdgeStatus");

                entity.Property(e => e.SldtoAcctContextPointKey).HasColumnName("SLDToAcctContextPointKey");

                entity.Property(e => e.SldtoAcctContextPointName)
                    .HasMaxLength(255)
                    .HasColumnName("SLDToAcctContextPointName");

                entity.Property(e => e.SlsacctContextPointDescription)
                    .HasMaxLength(10)
                    .HasColumnName("SLSAcctContextPointDescription");

                entity.Property(e => e.SlsacctContextPointEdgeStatus)
                    .HasMaxLength(1)
                    .HasColumnName("SLSAcctContextPointEdgeStatus");

                entity.Property(e => e.SlsacctContextPointKey).HasColumnName("SLSAcctContextPointKey");

                entity.Property(e => e.SlsacctContextPointName)
                    .HasMaxLength(255)
                    .HasColumnName("SLSAcctContextPointName");
            });

            modelBuilder.Entity<EcolabEvocFlatStage>(entity =>
            {
                entity.HasKey(e => e.EcolabEvocFlatId);

                entity.ToTable("EcolabEvocFlatStage");

                entity.HasIndex(e => e.SldtoAcctContextPointName, "EcolabEvocFlatStage_SLDToAcctContextPointName");

                entity.HasIndex(e => e.SlsacctContextPointName, "EcolabEvocFlatStage_SLSAcctContextPointName");

                entity.Property(e => e.HierarchyReferenceNodeDescription).HasMaxLength(100);

                entity.Property(e => e.HierarchyReferenceNodeName).HasMaxLength(255);

                entity.Property(e => e.HierarchyReferenceNodeStatus)
                    .HasMaxLength(1)
                    .IsUnicode(false)
                    .IsFixedLength();

                entity.Property(e => e.Level10ContextPointDescription).HasMaxLength(4000);

                entity.Property(e => e.Level10ContextPointKey).HasMaxLength(4000);

                entity.Property(e => e.Level10ContextPointName).HasMaxLength(4000);

                entity.Property(e => e.Level1ContextPointDescription).HasMaxLength(4000);

                entity.Property(e => e.Level1ContextPointKey).HasMaxLength(4000);

                entity.Property(e => e.Level1ContextPointName).HasMaxLength(4000);

                entity.Property(e => e.Level2ContextPointDescription).HasMaxLength(4000);

                entity.Property(e => e.Level2ContextPointKey).HasMaxLength(4000);

                entity.Property(e => e.Level2ContextPointName).HasMaxLength(4000);

                entity.Property(e => e.Level3ContextPointDescription).HasMaxLength(4000);

                entity.Property(e => e.Level3ContextPointKey).HasMaxLength(4000);

                entity.Property(e => e.Level3ContextPointName).HasMaxLength(4000);

                entity.Property(e => e.Level4ContextPointDescription).HasMaxLength(4000);

                entity.Property(e => e.Level4ContextPointKey).HasMaxLength(4000);

                entity.Property(e => e.Level4ContextPointName).HasMaxLength(4000);

                entity.Property(e => e.Level5ContextPointDescription).HasMaxLength(4000);

                entity.Property(e => e.Level5ContextPointKey).HasMaxLength(4000);

                entity.Property(e => e.Level5ContextPointName).HasMaxLength(4000);

                entity.Property(e => e.Level6ContextPointDescription).HasMaxLength(4000);

                entity.Property(e => e.Level6ContextPointKey).HasMaxLength(4000);

                entity.Property(e => e.Level6ContextPointName).HasMaxLength(4000);

                entity.Property(e => e.Level7ContextPointDescription).HasMaxLength(4000);

                entity.Property(e => e.Level7ContextPointKey).HasMaxLength(4000);

                entity.Property(e => e.Level7ContextPointName).HasMaxLength(4000);

                entity.Property(e => e.Level8ContextPointDescription).HasMaxLength(4000);

                entity.Property(e => e.Level8ContextPointKey).HasMaxLength(4000);

                entity.Property(e => e.Level8ContextPointName).HasMaxLength(4000);

                entity.Property(e => e.Level9ContextPointDescription).HasMaxLength(4000);

                entity.Property(e => e.Level9ContextPointKey).HasMaxLength(4000);

                entity.Property(e => e.Level9ContextPointName).HasMaxLength(4000);

                entity.Property(e => e.SldacctContextPointDescription)
                    .HasMaxLength(10)
                    .HasColumnName("SLDAcctContextPointDescription");

                entity.Property(e => e.SldtoAcctContextPointEdgeStatus)
                    .HasMaxLength(1)
                    .HasColumnName("SLDToAcctContextPointEdgeStatus");

                entity.Property(e => e.SldtoAcctContextPointKey).HasColumnName("SLDToAcctContextPointKey");

                entity.Property(e => e.SldtoAcctContextPointName)
                    .HasMaxLength(255)
                    .HasColumnName("SLDToAcctContextPointName");

                entity.Property(e => e.SlsacctContextPointDescription)
                    .HasMaxLength(10)
                    .HasColumnName("SLSAcctContextPointDescription");

                entity.Property(e => e.SlsacctContextPointEdgeStatus)
                    .HasMaxLength(1)
                    .HasColumnName("SLSAcctContextPointEdgeStatus");

                entity.Property(e => e.SlsacctContextPointKey).HasColumnName("SLSAcctContextPointKey");

                entity.Property(e => e.SlsacctContextPointName)
                    .HasMaxLength(255)
                    .HasColumnName("SLSAcctContextPointName");
            });

            modelBuilder.Entity<Permission>(entity =>
            {
                entity.ToTable("Permission");

                entity.Property(e => e.ApplicationCode).HasMaxLength(10);

                entity.Property(e => e.CreatedBy).HasMaxLength(100);

                entity.Property(e => e.ModifiedBy).HasMaxLength(100);

                entity.Property(e => e.PermissionCode).HasMaxLength(10);

                entity.Property(e => e.PermissionName).HasMaxLength(200);
            });

            modelBuilder.Entity<PermissionStage>(entity =>
            {
                entity.ToTable("PermissionStage");

                entity.Property(e => e.ApplicationCode).HasMaxLength(10);

                entity.Property(e => e.CreatedBy).HasMaxLength(100);

                entity.Property(e => e.ModifiedBy).HasMaxLength(100);

                entity.Property(e => e.PermissionCode).HasMaxLength(10);

                entity.Property(e => e.PermissionName).HasMaxLength(200);
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.UserKey);

                entity.ToTable("User");

                entity.HasIndex(e => e.EmployeeNumber, "User_EmployeeNumber");

                entity.HasIndex(e => e.UserStatusCode, "User_UserStatusCode");

                entity.Property(e => e.UserKey).ValueGeneratedNever();

                entity.Property(e => e.B2bAzureObjectId).HasMaxLength(100);

                entity.Property(e => e.B2cAzureObjectId).HasMaxLength(100);

                entity.Property(e => e.CompletionUrl).HasMaxLength(500);

                entity.Property(e => e.Createdby).HasMaxLength(100);

                entity.Property(e => e.Culture).HasMaxLength(50);

                entity.Property(e => e.Currency).HasMaxLength(10);

                entity.Property(e => e.Email).HasMaxLength(255);

                entity.Property(e => e.EmployeeNumber).HasMaxLength(255);

                entity.Property(e => e.FederationIdentifier).HasMaxLength(255);

                entity.Property(e => e.FirstName).HasMaxLength(255);

                entity.Property(e => e.Language).HasMaxLength(100);

                entity.Property(e => e.LastName).HasMaxLength(255);

                entity.Property(e => e.Locale).HasMaxLength(100);

                entity.Property(e => e.MiddleName).HasMaxLength(255);

                entity.Property(e => e.ModifiedBy).HasMaxLength(100);

                entity.Property(e => e.RedemptionUrl).HasMaxLength(1000);

                entity.Property(e => e.TimeZoneId).HasMaxLength(255);

                entity.Property(e => e.Title).HasMaxLength(255);

                entity.Property(e => e.UserStatusCode).HasMaxLength(1);

                entity.Property(e => e.UserType).HasMaxLength(10);
            });

            modelBuilder.Entity<UserContextPoint>(entity =>
            {
                entity.HasKey(e => e.UserContextPointKey)
                    .HasName("PK_UserContextPointStage");

                entity.ToTable("UserContextPoint");

                entity.HasIndex(e => e.ContextPointKey, "UserContextPointStage_ContextPointKey");

                entity.HasIndex(e => e.IsActive, "UserContextPointStage_IsActive");

                entity.HasIndex(e => e.UserKey, "UserContextPointStage_UserKey");

                entity.Property(e => e.UserContextPointKey).ValueGeneratedNever();

                entity.Property(e => e.CreatedBy).HasMaxLength(100);

                entity.Property(e => e.ModifiedBy).HasMaxLength(100);
            });

            modelBuilder.Entity<UserContextPointStage>(entity =>
            {
                entity.HasKey(e => e.UserContextPointKey)
                    .HasName("PK_UserContextPoint");

                entity.ToTable("UserContextPointStage");

                entity.HasIndex(e => e.ContextPointKey, "UserContextPoint_ContextPointKey");

                entity.HasIndex(e => e.IsActive, "UserContextPoint_IsActive");

                entity.HasIndex(e => e.UserKey, "UserContextPoint_UserKey");

                entity.Property(e => e.UserContextPointKey).ValueGeneratedNever();

                entity.Property(e => e.CreatedBy).HasMaxLength(100);

                entity.Property(e => e.ModifiedBy).HasMaxLength(100);
            });

            modelBuilder.Entity<UserPermission>(entity =>
            {
                entity.HasKey(e => new { e.UserKey, e.PermissionCode })
                    .HasName("PK_UserPermissionStage");

                entity.ToTable("UserPermission");

                entity.Property(e => e.PermissionCode).HasMaxLength(10);

                entity.Property(e => e.ApplicationCode).HasMaxLength(10);

                entity.Property(e => e.CreatedBy).HasMaxLength(100);

                entity.Property(e => e.ModifiedBy).HasMaxLength(100);
            });

            modelBuilder.Entity<UserPermissionStage>(entity =>
            {
                entity.HasKey(e => new { e.UserKey, e.PermissionCode })
                    .HasName("PK_UserPermission");

                entity.ToTable("UserPermissionStage");

                entity.Property(e => e.PermissionCode).HasMaxLength(10);

                entity.Property(e => e.ApplicationCode).HasMaxLength(10);

                entity.Property(e => e.CreatedBy).HasMaxLength(100);

                entity.Property(e => e.ModifiedBy).HasMaxLength(100);
            });

            modelBuilder.Entity<UserStage>(entity =>
            {
                entity.HasKey(e => e.UserKey);

                entity.ToTable("UserStage");

                entity.HasIndex(e => e.EmployeeNumber, "UserStage_EmployeeNumber");

                entity.HasIndex(e => e.UserStatusCode, "UserStage_UserStatusCode");

                entity.Property(e => e.UserKey).ValueGeneratedNever();

                entity.Property(e => e.B2bAzureObjectId).HasMaxLength(100);

                entity.Property(e => e.B2cAzureObjectId).HasMaxLength(100);

                entity.Property(e => e.CompletionUrl).HasMaxLength(500);

                entity.Property(e => e.Createdby).HasMaxLength(100);

                entity.Property(e => e.Culture).HasMaxLength(50);

                entity.Property(e => e.Currency).HasMaxLength(10);

                entity.Property(e => e.Email).HasMaxLength(255);

                entity.Property(e => e.EmployeeNumber).HasMaxLength(255);

                entity.Property(e => e.FederationIdentifier).HasMaxLength(255);

                entity.Property(e => e.FirstName).HasMaxLength(255);

                entity.Property(e => e.Language).HasMaxLength(100);

                entity.Property(e => e.LastName).HasMaxLength(255);

                entity.Property(e => e.Locale).HasMaxLength(100);

                entity.Property(e => e.MiddleName).HasMaxLength(255);

                entity.Property(e => e.ModifiedBy).HasMaxLength(100);

                entity.Property(e => e.RedemptionUrl).HasMaxLength(1000);

                entity.Property(e => e.TimeZoneId).HasMaxLength(255);

                entity.Property(e => e.Title).HasMaxLength(255);

                entity.Property(e => e.UserStatusCode).HasMaxLength(1);

                entity.Property(e => e.UserType).HasMaxLength(10);
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
