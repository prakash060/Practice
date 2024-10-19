using Ecolab.AuditChallenge.Database.EmsCloud.Models;
using Microsoft.EntityFrameworkCore;
namespace Ecolab.AuditChallenge.Database.EmsCloud
{
    public partial class EmsCloudContext : DbContext
    {
        public EmsCloudContext()
        {
        }

        public EmsCloudContext(DbContextOptions<EmsCloudContext> options)
            : base(options)
        {
        }

        public virtual DbSet<ToBeChallengedAuditModel> ToBeChallengedAudits { get; set; } = null!;
        public virtual DbSet<Account> Accounts { get; set; } = null!;
        public virtual DbSet<Address> Addresses { get; set; } = null!;
        public virtual DbSet<Culture> Cultures { get; set; } = null!;
        public virtual DbSet<CustomerAlignment> CustomerAlignments { get; set; } = null!;
        public virtual DbSet<CustomerAlignmentLevel> CustomerAlignmentLevels { get; set; } = null!;
        public virtual DbSet<CustomerAlignmentLevelEmail> CustomerAlignmentLevelEmails { get; set; } = null!;
        public virtual DbSet<Employee> Employees { get; set; } = null!;
        public virtual DbSet<EmployeeAccessClaim> EmployeeAccessClaims { get; set; } = null!;
        public virtual DbSet<ImageCapture> ImageCaptures { get; set; } = null!;
        public virtual DbSet<Issue> Issues { get; set; } = null!;
        public virtual DbSet<IssueTranslation> IssueTranslations { get; set; } = null!;
        public virtual DbSet<IssueTranslationView> IssueTranslationViews { get; set; } = null!;
        public virtual DbSet<Location> Locations { get; set; } = null!;
        public virtual DbSet<LocationAlignment> LocationAlignments { get; set; } = null!;
        public virtual DbSet<LocationLastSurveyVisit> LocationLastSurveyVisits { get; set; } = null!;
        public virtual DbSet<LocationVisit> LocationVisits { get; set; } = null!;
        public virtual DbSet<Observation> Observations { get; set; } = null!;
        public virtual DbSet<ObservationImageCapture> ObservationImageCaptures { get; set; } = null!;
        public virtual DbSet<ObservationIssue> ObservationIssues { get; set; } = null!;
        public virtual DbSet<ObservationIssueImageCapture> ObservationIssueImageCaptures { get; set; } = null!;
        public virtual DbSet<RepeatViolation> RepeatViolations { get; set; } = null!;
        public virtual DbSet<RepeatViolationPreviousVisit> RepeatViolationPreviousVisits { get; set; } = null!;
        public virtual DbSet<RepeatViolationScoringGroup> RepeatViolationScoringGroups { get; set; } = null!;
        public virtual DbSet<ScoringCategory> ScoringCategories { get; set; } = null!;
        public virtual DbSet<ScoringCategoryTranslation> ScoringCategoryTranslations { get; set; } = null!;
        public virtual DbSet<ScoringCategoryTranslationView> ScoringCategoryTranslationViews { get; set; } = null!;
        public virtual DbSet<ScoringGrade> ScoringGrades { get; set; } = null!;
        public virtual DbSet<ScoringGradeTranslation> ScoringGradeTranslations { get; set; } = null!;
        public virtual DbSet<ScoringGradeTranslationView> ScoringGradeTranslationViews { get; set; } = null!;
        public virtual DbSet<ScoringGroup> ScoringGroups { get; set; } = null!;
        public virtual DbSet<ScoringGroupTranslation> ScoringGroupTranslations { get; set; } = null!;
        public virtual DbSet<ScoringGroupTranslationView> ScoringGroupTranslationViews { get; set; } = null!;
        public virtual DbSet<ServiceReport> ServiceReports { get; set; } = null!;
        public virtual DbSet<ServiceResponse> ServiceResponses { get; set; } = null!;
        public virtual DbSet<ServiceResponseImageCapture> ServiceResponseImageCaptures { get; set; } = null!;
        public virtual DbSet<ServiceResponseSurveyPoint> ServiceResponseSurveyPoints { get; set; } = null!;
        public virtual DbSet<ServiceType> ServiceTypes { get; set; } = null!;
        public virtual DbSet<ServiceTypeTranslation> ServiceTypeTranslations { get; set; } = null!;
        public virtual DbSet<Subdivision> Subdivisions { get; set; } = null!;
        public virtual DbSet<Survey> Surveys { get; set; } = null!;
        public virtual DbSet<SurveyConfiguration> SurveyConfigurations { get; set; } = null!;
        public virtual DbSet<SurveyQuestion> SurveyQuestions { get; set; } = null!;
        public virtual DbSet<SurveyQuestionDetail> SurveyQuestionDetails { get; set; } = null!;
        public virtual DbSet<SurveyQuestionScoringRule> SurveyQuestionScoringRules { get; set; } = null!;
        public virtual DbSet<SurveyQuestionTranslation> SurveyQuestionTranslations { get; set; } = null!;
        public virtual DbSet<SurveyQuestionTranslationView> SurveyQuestionTranslationViews { get; set; } = null!;
        public virtual DbSet<SurveyResponseDetail> SurveyResponseDetails { get; set; } = null!;
        public virtual DbSet<SurveyResponseZoneSectionCategoryCount> SurveyResponseZoneSectionCategoryCounts { get; set; } = null!;
        public virtual DbSet<SurveyResponseZoneSectionSummary> SurveyResponseZoneSectionSummaries { get; set; } = null!;
        public virtual DbSet<SurveySurveyType> SurveySurveyTypes { get; set; } = null!;
        public virtual DbSet<SurveyTranslation> SurveyTranslations { get; set; } = null!;
        public virtual DbSet<SurveyTranslationView> SurveyTranslationViews { get; set; } = null!;
        public virtual DbSet<SurveyType> SurveyTypes { get; set; } = null!;
        public virtual DbSet<SurveyTypeTranslation> SurveyTypeTranslations { get; set; } = null!;
        public virtual DbSet<SurveyTypeTranslationView> SurveyTypeTranslationViews { get; set; } = null!;
        public virtual DbSet<SurveyZoneSectionScore> SurveyZoneSectionScores { get; set; } = null!;
        public virtual DbSet<VisitService> VisitServices { get; set; } = null!;
        public virtual DbSet<Zone> Zones { get; set; } = null!;
        public virtual DbSet<ZoneTranslation> ZoneTranslations { get; set; } = null!;
        public virtual DbSet<ZoneTranslationView> ZoneTranslationViews { get; set; } = null!;

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer("server = 172.18.16.91; database = EMS_GSO; User ID = EMSGSO_RW; password =$mS#9s0Rw;");
                
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.Entity<ToBeChallengedAuditModel>(entity => {
                entity.HasNoKey();
            });

            modelBuilder.Entity<Account>(entity =>
            {
                entity.ToTable("Account");

                entity.Property(e => e.AccountId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.CrmIntegrationId).HasMaxLength(32);

                entity.Property(e => e.LogoImagePath).HasMaxLength(256);

                entity.Property(e => e.MajorAccount).HasMaxLength(3);

                entity.Property(e => e.Name).HasMaxLength(100);

                entity.Property(e => e.SalesForceIntegrationId).HasMaxLength(18);
            });

            modelBuilder.Entity<Address>(entity =>
            {
                entity.ToTable("Address");

                entity.Property(e => e.AddressId).ValueGeneratedNever();

                entity.Property(e => e.Address1).HasMaxLength(100);

                entity.Property(e => e.Address2).HasMaxLength(100);

                entity.Property(e => e.Address3).HasMaxLength(50);

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.CityName).HasMaxLength(50);

                entity.Property(e => e.CountryCode)
                    .HasMaxLength(2)
                    .IsFixedLength();

                entity.Property(e => e.PostalCode).HasMaxLength(10);

                entity.Property(e => e.SubdivisionCode)
                    .HasMaxLength(6)
                    .IsFixedLength();
            });

            modelBuilder.Entity<Culture>(entity =>
            {
                entity.HasKey(e => e.CultureCode)
                    .HasName("Culture_PK");

                entity.ToTable("Culture");

                entity.Property(e => e.CultureCode).HasMaxLength(10);

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.CountryCode)
                    .HasMaxLength(2)
                    .IsFixedLength();

                entity.Property(e => e.FallbackCultureCode).HasMaxLength(10);

                entity.Property(e => e.LanguageCode).HasMaxLength(5);

                entity.Property(e => e.Name).HasMaxLength(100);

                entity.Property(e => e.NativeName).HasMaxLength(100);
            });

            modelBuilder.Entity<CustomerAlignment>(entity =>
            {
                entity.ToTable("CustomerAlignment");

                entity.Property(e => e.CustomerAlignmentId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.CustomerAlignmentReferenceId).HasMaxLength(60);

                entity.Property(e => e.EndDate).HasColumnType("datetime");

                entity.Property(e => e.IsCurrentlyActive).HasComputedColumnSql("(isnull(CONVERT([bit],case when [StartDate]<=getutcdate() AND ([EndDate] IS NULL OR [EndDate]>=getutcdate()) then (1) else (0) end,(0)),(0)))", false);

                entity.Property(e => e.StartDate).HasColumnType("datetime");

                entity.HasOne(d => d.Account)
                    .WithMany(p => p.CustomerAlignments)
                    .HasForeignKey(d => d.AccountId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_CustomerAlignment_Account");
            });

            modelBuilder.Entity<CustomerAlignmentLevel>(entity =>
            {
                entity.ToTable("CustomerAlignmentLevel");

                entity.Property(e => e.CustomerAlignmentLevelId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.Code).HasMaxLength(256);

                entity.Property(e => e.EmployeeName).HasMaxLength(60);

                entity.Property(e => e.EmployeeNumber).HasMaxLength(60);

                entity.Property(e => e.LevelType).HasMaxLength(60);

                entity.Property(e => e.Name).HasMaxLength(256);

                entity.Property(e => e.Role).HasMaxLength(60);

                entity.HasOne(d => d.CustomerAlignment)
                    .WithMany(p => p.CustomerAlignmentLevels)
                    .HasForeignKey(d => d.CustomerAlignmentId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_CustomerAlignmentLevel_CustomerAlignment");
            });

            modelBuilder.Entity<CustomerAlignmentLevelEmail>(entity =>
            {
                entity.ToTable("CustomerAlignmentLevelEmail");

                entity.Property(e => e.CustomerAlignmentLevelEmailId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.EcosureNodeId).HasMaxLength(60);

                entity.Property(e => e.EmailAddress).HasMaxLength(256);

                entity.Property(e => e.RecipientName).HasMaxLength(256);

                entity.HasOne(d => d.CustomerAlignmentLevel)
                    .WithMany(p => p.CustomerAlignmentLevelEmails)
                    .HasForeignKey(d => d.CustomerAlignmentLevelId)
                    .HasConstraintName("FK_CustomerAlignmentLevelEmail_CustomerAlignmentLevel");
            });

            modelBuilder.Entity<Employee>(entity =>
            {
                entity.ToTable("Employee");

                entity.Property(e => e.EmployeeId).ValueGeneratedNever();

                entity.Property(e => e.Birthdate).HasColumnType("datetime");

                entity.Property(e => e.BusinessTelephoneNumber).HasMaxLength(30);

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.DomainLogin).HasMaxLength(7);

                entity.Property(e => e.EmailAddress).HasMaxLength(128);

                entity.Property(e => e.EmployeeNumber).HasMaxLength(20);

                entity.Property(e => e.EmploymentStartDate).HasColumnType("datetime");

                entity.Property(e => e.FamilyName).HasMaxLength(50);

                entity.Property(e => e.GivenName).HasMaxLength(50);

                entity.Property(e => e.HomeTelephoneNumber).HasMaxLength(30);

                entity.Property(e => e.SalesForceIntegrationId).HasMaxLength(18);

                entity.Property(e => e.Title).HasMaxLength(30);
            });

            modelBuilder.Entity<EmployeeAccessClaim>(entity =>
            {
                entity.ToTable("EmployeeAccessClaim");

                entity.Property(e => e.EmployeeAccessClaimId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.HasOne(d => d.Employee)
                    .WithMany(p => p.EmployeeAccessClaims)
                    .HasForeignKey(d => d.EmployeeId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_EmployeeAccessClaim_Employee");
            });

            modelBuilder.Entity<ImageCapture>(entity =>
            {
                entity.ToTable("ImageCapture");

                entity.Property(e => e.ImageCaptureId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.ImagePath).HasMaxLength(256);
            });

            modelBuilder.Entity<Issue>(entity =>
            {
                entity.ToTable("Issue");

                entity.Property(e => e.IssueId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.EndDate).HasColumnType("datetime");

                entity.Property(e => e.IsCurrentlyActive).HasComputedColumnSql("(isnull(CONVERT([bit],case when [StartDate]<=getutcdate() AND ([EndDate] IS NULL OR [EndDate]>=getutcdate()) then (1) else (0) end,(0)),(0)))", false);

                entity.Property(e => e.StartDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");
            });

            modelBuilder.Entity<IssueTranslation>(entity =>
            {
                entity.HasKey(e => new { e.IssueId, e.CultureCode })
                    .HasName("IssueTranslation_PK");

                entity.ToTable("IssueTranslation");

                entity.Property(e => e.CultureCode).HasMaxLength(10);

                entity.Property(e => e.ChangeDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.IsActive)
                    .IsRequired()
                    .HasDefaultValueSql("((1))");

                entity.Property(e => e.IssueText).HasMaxLength(1000);

                entity.Property(e => e.LongTermResolutionText).HasMaxLength(2000);

                entity.Property(e => e.QrCodeImageRelativePath).HasMaxLength(200);

                entity.Property(e => e.ResolutionText).HasMaxLength(2000);

                entity.HasOne(d => d.CultureCodeNavigation)
                    .WithMany(p => p.IssueTranslations)
                    .HasForeignKey(d => d.CultureCode)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_IssueTranslation_Culture");

                entity.HasOne(d => d.Issue)
                    .WithMany(p => p.IssueTranslations)
                    .HasForeignKey(d => d.IssueId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_IssueTranslation_Issue");
            });

            modelBuilder.Entity<IssueTranslationView>(entity =>
            {
                entity.HasNoKey();

                entity.ToView("IssueTranslationView");

                entity.Property(e => e.CultureCode).HasMaxLength(10);

                entity.Property(e => e.IssueText).HasMaxLength(1000);

                entity.Property(e => e.LongTermResolutionText).HasMaxLength(2000);

                entity.Property(e => e.QrCodeImageRelativePath).HasMaxLength(200);

                entity.Property(e => e.ResolutionText).HasMaxLength(2000);
            });

            modelBuilder.Entity<Location>(entity =>
            {
                entity.ToTable("Location");

                entity.Property(e => e.LocationId).ValueGeneratedNever();

                entity.Property(e => e.AlternateEmailAddress).HasMaxLength(256);

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.ContractName).HasMaxLength(60);

                entity.Property(e => e.ContractNumber).HasMaxLength(60);

                entity.Property(e => e.CrmIntegrationId).HasMaxLength(32);

                entity.Property(e => e.CustomerAccountNumber).HasMaxLength(10);

                entity.Property(e => e.LocationIdentifier).HasMaxLength(50);

                entity.Property(e => e.LocationIdentifierNumeric).HasMaxLength(50);

                entity.Property(e => e.Name).HasMaxLength(100);

                entity.Property(e => e.PreviousTerritoryNumber).HasMaxLength(16);

                entity.Property(e => e.PrimaryTelephoneNumber).HasMaxLength(30);

                entity.Property(e => e.TerritoryNumber).HasMaxLength(16);

                entity.Property(e => e.VisitFrequencyStartDate).HasColumnType("datetime");

                entity.HasOne(d => d.Account)
                    .WithMany(p => p.Locations)
                    .HasForeignKey(d => d.AccountId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Location_Account");

                entity.HasOne(d => d.Address)
                    .WithMany(p => p.Locations)
                    .HasForeignKey(d => d.AddressId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Location_Address");
            });

            modelBuilder.Entity<LocationAlignment>(entity =>
            {
                entity.ToTable("LocationAlignment");

                entity.Property(e => e.LocationAlignmentId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.HasOne(d => d.CustomerAlignment)
                    .WithMany(p => p.LocationAlignments)
                    .HasForeignKey(d => d.CustomerAlignmentId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_LocationAlignment_CustomerAlignment");

                entity.HasOne(d => d.Location)
                    .WithMany(p => p.LocationAlignments)
                    .HasForeignKey(d => d.LocationId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_LocationAlignment_Location");
            });

            modelBuilder.Entity<LocationLastSurveyVisit>(entity =>
            {
                entity.HasKey(e => e.LocationId)
                    .HasName("LocationLastSurveyVisit_PK");

                entity.ToTable("LocationLastSurveyVisit");

                entity.Property(e => e.LocationId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.HasOne(d => d.Account)
                    .WithMany(p => p.LocationLastSurveyVisits)
                    .HasForeignKey(d => d.AccountId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_LocationLastSurveyVisit_Account");

                entity.HasOne(d => d.Location)
                    .WithOne(p => p.LocationLastSurveyVisit)
                    .HasForeignKey<LocationLastSurveyVisit>(d => d.LocationId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_LocationLastSurveyVisit_Location");

                entity.HasOne(d => d.LocationVisit)
                    .WithMany(p => p.LocationLastSurveyVisits)
                    .HasForeignKey(d => d.LocationVisitId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_LocationLastSurveyVisit_LocationVisit");
            });

            modelBuilder.Entity<LocationVisit>(entity =>
            {
                entity.ToTable("LocationVisit");

                entity.HasIndex(e => e.LocationId, "NonClusturedIndex_LocationVisit_LocationID");

                entity.Property(e => e.LocationVisitId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.CultureCode).HasMaxLength(10);

                entity.Property(e => e.CustomTimeZone).HasMaxLength(100);

                entity.Property(e => e.InternalComment).HasMaxLength(3000);

                entity.Property(e => e.LocationRepSignaturePath).HasMaxLength(256);

                entity.Property(e => e.TerritoryRepSignaturePath).HasMaxLength(256);

                entity.Property(e => e.VisitComment).HasMaxLength(3000);
            });

            modelBuilder.Entity<Observation>(entity =>
            {
                entity.ToTable("Observation");

                entity.Property(e => e.ObservationId).ValueGeneratedNever();

                entity.Property(e => e.CalendarCaptureDate).HasColumnType("datetime");

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.EarnedPoints).HasColumnType("decimal(9, 2)");

                entity.Property(e => e.ObservationComment).HasMaxLength(1000);

                entity.Property(e => e.Product).HasMaxLength(100);

                entity.Property(e => e.Response).HasMaxLength(100);

                entity.Property(e => e.UnableToObserveComment).HasMaxLength(1000);

                entity.HasOne(d => d.ScoringCategory)
                    .WithMany(p => p.Observations)
                    .HasForeignKey(d => d.ScoringCategoryId)
                    .HasConstraintName("FK_Observation_ScoringCatgeory");

                entity.HasOne(d => d.SurveyResponseDetail)
                    .WithMany(p => p.Observations)
                    .HasForeignKey(d => d.SurveyResponseDetailId)
                    .HasConstraintName("FK_Observation_SurveyResponseDetail");
            });

            modelBuilder.Entity<ObservationImageCapture>(entity =>
            {
                entity.ToTable("ObservationImageCapture");

                entity.HasIndex(e => e.ObservationId, "ObservationImageCapture_Observation");

                entity.Property(e => e.ObservationImageCaptureId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.IsActive)
                    .IsRequired()
                    .HasDefaultValueSql("((1))");

                entity.HasOne(d => d.ImageCapture)
                    .WithMany(p => p.ObservationImageCaptures)
                    .HasForeignKey(d => d.ImageCaptureId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_ObservationImageCapture_ImageCapture");
            });

            modelBuilder.Entity<ObservationIssue>(entity =>
            {
                entity.ToTable("ObservationIssue");

                entity.Property(e => e.ObservationIssueId).ValueGeneratedNever();

                entity.Property(e => e.AdditionalComments).HasMaxLength(1000);

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.HasOne(d => d.Issue)
                    .WithMany(p => p.ObservationIssues)
                    .HasForeignKey(d => d.IssueId)
                    .HasConstraintName("FK_ObservationIssue_Issue");

                entity.HasOne(d => d.Observation)
                    .WithMany(p => p.ObservationIssues)
                    .HasForeignKey(d => d.ObservationId)
                    .HasConstraintName("FK_ObservationIssue_Observation");

                entity.HasOne(d => d.ScoringCategory)
                    .WithMany(p => p.ObservationIssues)
                    .HasForeignKey(d => d.ScoringCategoryId)
                    .HasConstraintName("FK_ObservationIssue_ScoringCatgeory");
            });

            modelBuilder.Entity<ObservationIssueImageCapture>(entity =>
            {
                entity.ToTable("ObservationIssueImageCapture");

                entity.HasIndex(e => e.ObservationIssueId, "ObservationIssueImageCapture_ObservationIssue");

                entity.Property(e => e.ObservationIssueImageCaptureId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.IsActive)
                    .IsRequired()
                    .HasDefaultValueSql("((1))");

                entity.HasOne(d => d.ImageCapture)
                    .WithMany(p => p.ObservationIssueImageCaptures)
                    .HasForeignKey(d => d.ImageCaptureId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_ObservationIssueImageCapture_ImageCapture");
            });

            modelBuilder.Entity<RepeatViolation>(entity =>
            {
                entity.ToTable("RepeatViolation");

                entity.Property(e => e.RepeatViolationId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.Comment).HasMaxLength(1000);

                entity.HasOne(d => d.LocationVisit)
                    .WithMany(p => p.RepeatViolations)
                    .HasForeignKey(d => d.LocationVisitId)
                    .HasConstraintName("FK_RepeatViolation_LocationVisit");

                entity.HasOne(d => d.Observation)
                    .WithMany(p => p.RepeatViolations)
                    .HasForeignKey(d => d.ObservationId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_RepeatViolation_Observation");

                entity.HasOne(d => d.ScoringCategory)
                    .WithMany(p => p.RepeatViolations)
                    .HasForeignKey(d => d.ScoringCategoryId)
                    .HasConstraintName("FK_RepeatViolation_ScoringCategory");

                entity.HasOne(d => d.ServiceResponse)
                    .WithMany(p => p.RepeatViolations)
                    .HasForeignKey(d => d.ServiceResponseId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_RepeatViolation_ServiceResponse");

                entity.HasOne(d => d.Zone)
                    .WithMany(p => p.RepeatViolations)
                    .HasForeignKey(d => d.ZoneId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_RepeatViolation_Zone");
            });

            modelBuilder.Entity<RepeatViolationPreviousVisit>(entity =>
            {
                entity.ToTable("RepeatViolationPreviousVisit");

                entity.Property(e => e.RepeatViolationPreviousVisitId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.HasOne(d => d.LocationVisit)
                    .WithMany(p => p.RepeatViolationPreviousVisits)
                    .HasForeignKey(d => d.LocationVisitId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_RepeatViolationPreviousVisit_LocationVisit");

                entity.HasOne(d => d.RepeatViolation)
                    .WithMany(p => p.RepeatViolationPreviousVisits)
                    .HasForeignKey(d => d.RepeatViolationId)
                    .HasConstraintName("FK_RepeatViolationPreviousVisit_RepeatViolation");
            });

            modelBuilder.Entity<RepeatViolationScoringGroup>(entity =>
            {
                entity.ToTable("RepeatViolationScoringGroup");

                entity.Property(e => e.RepeatViolationScoringGroupId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.HasOne(d => d.RepeatViolation)
                    .WithMany(p => p.RepeatViolationScoringGroups)
                    .HasForeignKey(d => d.RepeatViolationId)
                    .HasConstraintName("FK_RepeatViolationScoringGroup_RepeatViolation");

                entity.HasOne(d => d.ScoringGroup)
                    .WithMany(p => p.RepeatViolationScoringGroups)
                    .HasForeignKey(d => d.ScoringGroupId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_RepeatViolationScoringGroup_ScoringGroup");
            });

            modelBuilder.Entity<ScoringCategory>(entity =>
            {
                entity.ToTable("ScoringCategory");

                entity.Property(e => e.ScoringCategoryId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");
            });

            modelBuilder.Entity<ScoringCategoryTranslation>(entity =>
            {
                entity.HasKey(e => new { e.ScoringCategoryId, e.CultureCode })
                    .HasName("ScoringCategoryTranslation_PK");

                entity.ToTable("ScoringCategoryTranslation");

                entity.Property(e => e.CultureCode).HasMaxLength(10);

                entity.Property(e => e.Abbreviation).HasMaxLength(5);

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.DisplayName)
                    .HasMaxLength(100)
                    .HasComputedColumnSql("(coalesce([OverrideName],[Name]))", false);

                entity.Property(e => e.Name).HasMaxLength(100);

                entity.Property(e => e.OverrideName).HasMaxLength(100);

                entity.HasOne(d => d.CultureCodeNavigation)
                    .WithMany(p => p.ScoringCategoryTranslations)
                    .HasForeignKey(d => d.CultureCode)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_ScoringCategoryTranslation_Culture");

                entity.HasOne(d => d.ScoringCategory)
                    .WithMany(p => p.ScoringCategoryTranslations)
                    .HasForeignKey(d => d.ScoringCategoryId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_ScoringCategoryTranslation_ScoringCategory");
            });

            modelBuilder.Entity<ScoringCategoryTranslationView>(entity =>
            {
                entity.HasNoKey();

                entity.ToView("ScoringCategoryTranslationView");

                entity.Property(e => e.Abbreviation).HasMaxLength(5);

                entity.Property(e => e.CultureCode).HasMaxLength(10);

                entity.Property(e => e.DisplayName).HasMaxLength(100);

                entity.Property(e => e.Name).HasMaxLength(100);
            });

            modelBuilder.Entity<ScoringGrade>(entity =>
            {
                entity.ToTable("ScoringGrade");

                entity.Property(e => e.ScoringGradeId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");
            });

            modelBuilder.Entity<ScoringGradeTranslation>(entity =>
            {
                entity.HasKey(e => new { e.ScoringGradeId, e.CultureCode })
                    .HasName("ScoringGradeTranslation_PK");

                entity.ToTable("ScoringGradeTranslation");

                entity.Property(e => e.CultureCode).HasMaxLength(10);

                entity.Property(e => e.Abbreviation).HasMaxLength(5);

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.ColorBallPath).HasMaxLength(100);

                entity.Property(e => e.HtmlColorCode).HasMaxLength(8);

                entity.Property(e => e.Name).HasMaxLength(100);

                entity.HasOne(d => d.CultureCodeNavigation)
                    .WithMany(p => p.ScoringGradeTranslations)
                    .HasForeignKey(d => d.CultureCode)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_ScoringGradeTranslation_Culture");

                entity.HasOne(d => d.ScoringGrade)
                    .WithMany(p => p.ScoringGradeTranslations)
                    .HasForeignKey(d => d.ScoringGradeId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_ScoringGradeTranslation_ScoringGrade");
            });

            modelBuilder.Entity<ScoringGradeTranslationView>(entity =>
            {
                entity.HasNoKey();

                entity.ToView("ScoringGradeTranslationView");

                entity.Property(e => e.Abbreviation).HasMaxLength(5);

                entity.Property(e => e.ColorBallPath).HasMaxLength(100);

                entity.Property(e => e.CultureCode).HasMaxLength(10);

                entity.Property(e => e.HtmlColorCode).HasMaxLength(8);

                entity.Property(e => e.Name).HasMaxLength(100);
            });

            modelBuilder.Entity<ScoringGroup>(entity =>
            {
                entity.ToTable("ScoringGroup");

                entity.Property(e => e.ScoringGroupId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");
            });

            modelBuilder.Entity<ScoringGroupTranslation>(entity =>
            {
                entity.HasKey(e => new { e.ScoringGroupId, e.CultureCode })
                    .HasName("ScoringGroupTranslation_PK");

                entity.ToTable("ScoringGroupTranslation");

                entity.Property(e => e.CultureCode).HasMaxLength(10);

                entity.Property(e => e.Abbreviation).HasMaxLength(5);

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.Name).HasMaxLength(100);

                entity.HasOne(d => d.CultureCodeNavigation)
                    .WithMany(p => p.ScoringGroupTranslations)
                    .HasForeignKey(d => d.CultureCode)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_ScoringGroupTranslation_Culture");

                entity.HasOne(d => d.ScoringGroup)
                    .WithMany(p => p.ScoringGroupTranslations)
                    .HasForeignKey(d => d.ScoringGroupId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_ScoringGradeTranslation_ScoringGroup");
            });

            modelBuilder.Entity<ScoringGroupTranslationView>(entity =>
            {
                entity.HasNoKey();

                entity.ToView("ScoringGroupTranslationView");

                entity.Property(e => e.Abbreviation).HasMaxLength(5);

                entity.Property(e => e.CultureCode).HasMaxLength(10);

                entity.Property(e => e.Name).HasMaxLength(100);
            });

            modelBuilder.Entity<ServiceReport>(entity =>
            {
                entity.HasKey(e => new { e.ServiceReportId, e.VersionNumber })
                    .HasName("ServiceReport_PK");

                entity.ToTable("ServiceReport");

                entity.HasIndex(e => e.LocationVisitId, "ServiceReport_LocationVisit");

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.CultureCode).HasMaxLength(10);

                entity.Property(e => e.ReportPath).HasMaxLength(256);

                entity.HasOne(d => d.LocationVisit)
                    .WithMany(p => p.ServiceReports)
                    .HasForeignKey(d => d.LocationVisitId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_ServiceReport_LocationVisit");
            });

            modelBuilder.Entity<ServiceResponse>(entity =>
            {
                entity.ToTable("ServiceResponse");

                entity.HasIndex(e => e.LocationVisitId, "NonClusturedIndex_ServiceResponse_LocationVisitID");

                entity.Property(e => e.ServiceResponseId).ValueGeneratedNever();

                entity.Property(e => e.CancelComment).HasMaxLength(1000);

                entity.Property(e => e.ForEsr).HasColumnName("ForESR");

                entity.Property(e => e.ServiceAppointmentNumber).HasMaxLength(18);

                entity.Property(e => e.ServiceComment).HasMaxLength(1000);

                entity.HasOne(d => d.LocationVisit)
                    .WithMany(p => p.ServiceResponses)
                    .HasForeignKey(d => d.LocationVisitId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("FK_ServiceResponse_LocationVisit");
            });

            modelBuilder.Entity<ServiceResponseImageCapture>(entity =>
            {
                entity.ToTable("ServiceResponseImageCapture");

                entity.HasIndex(e => e.ServiceResponseId, "ServiceResponseImageCapture_ServiceResponse");

                entity.Property(e => e.ServiceResponseImageCaptureId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.IsActive)
                    .IsRequired()
                    .HasDefaultValueSql("((1))");

                entity.HasOne(d => d.ImageCapture)
                    .WithMany(p => p.ServiceResponseImageCaptures)
                    .HasForeignKey(d => d.ImageCaptureId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_ServiceResponseImageCapture_ImageCapture");
            });

            modelBuilder.Entity<ServiceResponseSurveyPoint>(entity =>
            {
                entity.HasKey(e => e.ServiceResponseSurveyPointsId)
                    .HasName("ServiceResponseSurveyPoints_PK");

                entity.Property(e => e.ServiceResponseSurveyPointsId).ValueGeneratedNever();

                entity.Property(e => e.Score).HasColumnType("decimal(18, 2)");

                entity.Property(e => e.SurveyEarnedPoints).HasColumnType("decimal(9, 2)");

                entity.Property(e => e.SurveyPossiblePoints).HasColumnType("decimal(9, 2)");

                entity.Property(e => e.ThresholdXvalue).HasColumnName("ThresholdXValue");

                entity.Property(e => e.ThresholdYvalue).HasColumnName("ThresholdYValue");

                entity.HasOne(d => d.ScoringGrade)
                    .WithMany(p => p.ServiceResponseSurveyPoints)
                    .HasForeignKey(d => d.ScoringGradeId)
                    .HasConstraintName("FK_ServiceResponseSurveyPoints_ScoringGrade");

                entity.HasOne(d => d.ServiceResponseSurvey)
                    .WithMany(p => p.ServiceResponseSurveyPoints)
                    .HasForeignKey(d => d.ServiceResponseSurveyId)
                    .HasConstraintName("FK_ServiceResponseSurveyPoints_ServiceResponse");

                entity.HasOne(d => d.SurveyZoneSectionScore)
                    .WithMany(p => p.ServiceResponseSurveyPoints)
                    .HasForeignKey(d => d.SurveyZoneSectionScoreId)
                    .HasConstraintName("FK_ServiceResponseSurveyPoints_SurveyZoneSectionScoreId");
            });

            modelBuilder.Entity<ServiceType>(entity =>
            {
                entity.ToTable("ServiceType");

                entity.Property(e => e.ServiceTypeId).ValueGeneratedNever();

                entity.Property(e => e.EnumValue).HasMaxLength(100);
            });

            modelBuilder.Entity<ServiceTypeTranslation>(entity =>
            {
                entity.HasKey(e => new { e.ServiceTypeId, e.CultureCode })
                    .HasName("ServiceTypeTranslation_PK");

                entity.ToTable("ServiceTypeTranslation");

                entity.Property(e => e.CultureCode).HasMaxLength(10);

                entity.Property(e => e.ChangeDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.IsActive)
                    .IsRequired()
                    .HasDefaultValueSql("((1))");

                entity.Property(e => e.Name).HasMaxLength(100);

                entity.HasOne(d => d.CultureCodeNavigation)
                    .WithMany(p => p.ServiceTypeTranslations)
                    .HasForeignKey(d => d.CultureCode)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_ServiceTypeTranslation_Culture");

                entity.HasOne(d => d.ServiceType)
                    .WithMany(p => p.ServiceTypeTranslations)
                    .HasForeignKey(d => d.ServiceTypeId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("ServiceTypeTranslation_FK1");
            });

            modelBuilder.Entity<Subdivision>(entity =>
            {
                entity.HasKey(e => e.SubdivisionCode)
                    .HasName("Subdivision_PK");

                entity.ToTable("Subdivision");

                entity.Property(e => e.SubdivisionCode)
                    .HasMaxLength(6)
                    .IsFixedLength();

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.CountryCode)
                    .HasMaxLength(2)
                    .IsFixedLength();

                entity.Property(e => e.Name).HasMaxLength(100);
            });

            modelBuilder.Entity<Survey>(entity =>
            {
                entity.ToTable("Survey");

                entity.Property(e => e.SurveyId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.EndDate).HasColumnType("datetime");

                entity.Property(e => e.IsCurrentlyActive).HasComputedColumnSql("(isnull(CONVERT([bit],case when [StartDate]<=getutcdate() AND ([EndDate] IS NULL OR [EndDate]>=getutcdate()) then (1) else (0) end,(0)),(0)))", false);

                entity.Property(e => e.StartDate).HasColumnType("datetime");
            });

            modelBuilder.Entity<SurveyConfiguration>(entity =>
            {
                entity.HasKey(e => e.SurveyId)
                    .HasName("SurveyConfiguration_PK");

                entity.ToTable("SurveyConfiguration");

                entity.Property(e => e.SurveyId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.UnableToObserveComment).HasMaxLength(1000);

                entity.HasOne(d => d.Survey)
                    .WithOne(p => p.SurveyConfiguration)
                    .HasForeignKey<SurveyConfiguration>(d => d.SurveyId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_SurveyConfiguration_Survey");
            });

            modelBuilder.Entity<SurveyQuestion>(entity =>
            {
                entity.ToTable("SurveyQuestion");

                entity.Property(e => e.SurveyQuestionId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.EndDate).HasColumnType("datetime");

                entity.Property(e => e.IsCurrentlyActive).HasComputedColumnSql("(isnull(CONVERT([bit],case when [StartDate]<=getutcdate() AND ([EndDate] IS NULL OR [EndDate]>=getutcdate()) then (1) else (0) end,(0)),(0)))", false);

                entity.Property(e => e.StartDate).HasColumnType("datetime");

                entity.HasOne(d => d.Survey)
                    .WithMany(p => p.SurveyQuestions)
                    .HasForeignKey(d => d.SurveyId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_SurveyQuestion_Survey");
            });

            modelBuilder.Entity<SurveyQuestionDetail>(entity =>
            {
                entity.ToTable("SurveyQuestionDetail");

                entity.HasIndex(e => new { e.SurveyQuestionId, e.StartDate }, "SurveyQuestionDetail_UC")
                    .IsUnique();

                entity.Property(e => e.SurveyQuestionDetailId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.EndDate).HasColumnType("datetime");

                entity.Property(e => e.IsCurrentlyActive).HasComputedColumnSql("(isnull(CONVERT([bit],case when [StartDate]<=getutcdate() AND ([EndDate] IS NULL OR [EndDate]>=getutcdate()) then (1) else (0) end,(0)),(0)))", false);

                entity.Property(e => e.NumericQuestionMaxValue).HasColumnType("decimal(9, 2)");

                entity.Property(e => e.NumericQuestionMinValue).HasColumnType("decimal(9, 2)");

                entity.Property(e => e.QuestionNumberDotSuffix).HasMaxLength(20);

                entity.Property(e => e.QuestionNumberPrefix).HasMaxLength(20);

                entity.Property(e => e.QuestionNumberSuffix).HasMaxLength(5);

                entity.Property(e => e.StartDate).HasColumnType("datetime");

                entity.HasOne(d => d.DefaultScoringCategory)
                    .WithMany(p => p.SurveyQuestionDetails)
                    .HasForeignKey(d => d.DefaultScoringCategoryId)
                    .HasConstraintName("FK_SurveyQuestionDetail_ScoringCategory");

                entity.HasOne(d => d.SurveyQuestion)
                    .WithMany(p => p.SurveyQuestionDetails)
                    .HasForeignKey(d => d.SurveyQuestionId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_SurveyQuestionDetail_SurveyQuestion");
            });

            modelBuilder.Entity<SurveyQuestionScoringRule>(entity =>
            {
                entity.ToTable("SurveyQuestionScoringRule");

                entity.HasIndex(e => new { e.SurveyQuestionId, e.AccountId, e.ReasonId, e.IssueId, e.NumericComparisonRuleId, e.EqualityRuleId, e.CountryCode, e.StartDate }, "SurveyQuestionScoringRule_UC")
                    .IsUnique();

                entity.Property(e => e.SurveyQuestionScoringRuleId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("(getutcdate())");

                entity.Property(e => e.CountryCode).HasMaxLength(10);

                entity.Property(e => e.EndDate).HasColumnType("datetime");

                entity.Property(e => e.IsCurrentlyActive).HasComputedColumnSql("(isnull(CONVERT([bit],case when [StartDate]<=getutcdate() AND ([EndDate] IS NULL OR [EndDate]>=getutcdate()) then (1) else (0) end,(0)),(0)))", false);

                entity.Property(e => e.StartDate)
                    .HasColumnType("datetime")
                    .HasDefaultValueSql("('1/1/2000')");

                entity.HasOne(d => d.Account)
                    .WithMany(p => p.SurveyQuestionScoringRules)
                    .HasForeignKey(d => d.AccountId)
                    .HasConstraintName("FK_SurveyQuestionScoringRule_Account");

                entity.HasOne(d => d.Issue)
                    .WithMany(p => p.SurveyQuestionScoringRules)
                    .HasForeignKey(d => d.IssueId)
                    .HasConstraintName("FK_SurveyQuestionScoringRule_Issue");

                entity.HasOne(d => d.ScoringCategory)
                    .WithMany(p => p.SurveyQuestionScoringRules)
                    .HasForeignKey(d => d.ScoringCategoryId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_SurveyQuestionScoringRule_ScoringCategory");

                entity.HasOne(d => d.SurveyQuestion)
                    .WithMany(p => p.SurveyQuestionScoringRules)
                    .HasForeignKey(d => d.SurveyQuestionId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_SurveyQuestionScoringRule_SurveyQuestion");
            });

            modelBuilder.Entity<SurveyQuestionTranslation>(entity =>
            {
                entity.HasKey(e => new { e.SurveyQuestionId, e.CultureCode, e.StartDate })
                    .HasName("SurveyQuestionTranslation_PK");

                entity.ToTable("SurveyQuestionTranslation");

                entity.Property(e => e.CultureCode).HasMaxLength(10);

                entity.Property(e => e.StartDate).HasColumnType("datetime");

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.CollectionLocationName).HasMaxLength(50);

                entity.Property(e => e.EndDate).HasColumnType("datetime");

                entity.Property(e => e.IsCurrentlyActive).HasComputedColumnSql("(isnull(CONVERT([bit],case when [StartDate]<=getutcdate() AND ([EndDate] IS NULL OR [EndDate]>=getutcdate()) then (1) else (0) end,(0)),(0)))", false);

                entity.Property(e => e.QuestionHelpText).HasMaxLength(4000);

                entity.Property(e => e.QuestionText).HasMaxLength(1000);

                entity.HasOne(d => d.CultureCodeNavigation)
                    .WithMany(p => p.SurveyQuestionTranslations)
                    .HasForeignKey(d => d.CultureCode)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_SurveyQuestionTranslation_Culture");

                entity.HasOne(d => d.SurveyQuestion)
                    .WithMany(p => p.SurveyQuestionTranslations)
                    .HasForeignKey(d => d.SurveyQuestionId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_SurveyQuestionTranslation_SurveyQuestion");
            });

            modelBuilder.Entity<SurveyQuestionTranslationView>(entity =>
            {
                entity.HasNoKey();

                entity.ToView("SurveyQuestionTranslationView");

                entity.Property(e => e.CollectionLocationName).HasMaxLength(50);

                entity.Property(e => e.CultureCode).HasMaxLength(10);

                entity.Property(e => e.QuestionHelpText).HasMaxLength(4000);

                entity.Property(e => e.QuestionText).HasMaxLength(1000);
            });

            modelBuilder.Entity<SurveyResponseDetail>(entity =>
            {
                entity.ToTable("SurveyResponseDetail");

                entity.HasIndex(e => new { e.ServiceResponseSurveyId, e.ZoneId, e.SurveyQuestionId }, "SurveyResponseDetail_UC")
                    .IsUnique();

                entity.Property(e => e.SurveyResponseDetailId).ValueGeneratedNever();

                entity.HasOne(d => d.ServiceResponseSurvey)
                    .WithMany(p => p.SurveyResponseDetails)
                    .HasForeignKey(d => d.ServiceResponseSurveyId)
                    .HasConstraintName("FK_SurveyResponseDetail_ServiceResponse");

                entity.HasOne(d => d.Zone)
                    .WithMany(p => p.SurveyResponseDetails)
                    .HasForeignKey(d => d.ZoneId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_SurveyResponseDetail_Zone");
            });

            modelBuilder.Entity<SurveyResponseZoneSectionCategoryCount>(entity =>
            {
                entity.ToTable("SurveyResponseZoneSectionCategoryCount");

                entity.HasIndex(e => new { e.ServiceResponseZoneSectionSummaryId, e.ScoringCategoryId }, "SurveyResponseZoneSectionCategoryCount_UC")
                    .IsUnique();

                entity.Property(e => e.SurveyResponseZoneSectionCategoryCountId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.HasOne(d => d.ScoringCategory)
                    .WithMany(p => p.SurveyResponseZoneSectionCategoryCounts)
                    .HasForeignKey(d => d.ScoringCategoryId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_SurveyResponseZoneSectionCategoryCount_ScoringCategoryId");

                entity.HasOne(d => d.ServiceResponseZoneSectionSummary)
                    .WithMany(p => p.SurveyResponseZoneSectionCategoryCounts)
                    .HasForeignKey(d => d.ServiceResponseZoneSectionSummaryId)
                    .HasConstraintName("FK_SurveyResponseZoneSectionCategoryCount_ServiceResponseZoneSectionSummaryId");
            });

            modelBuilder.Entity<SurveyResponseZoneSectionSummary>(entity =>
            {
                entity.HasKey(e => e.ServiceResponseZoneSectionSummaryId)
                    .HasName("SurveyResponseZoneSectionSummary_PK");

                entity.ToTable("SurveyResponseZoneSectionSummary");

                entity.Property(e => e.ServiceResponseZoneSectionSummaryId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.EarnedPoints).HasColumnType("decimal(18, 2)");

                entity.Property(e => e.PointsAvailable).HasColumnType("decimal(18, 2)");

                entity.Property(e => e.Score).HasColumnType("decimal(18, 2)");

                entity.Property(e => e.ThresholdXvalue).HasColumnName("ThresholdXValue");

                entity.Property(e => e.ThresholdYvalue).HasColumnName("ThresholdYValue");

                entity.HasOne(d => d.ScoringGrade)
                    .WithMany(p => p.SurveyResponseZoneSectionSummaries)
                    .HasForeignKey(d => d.ScoringGradeId)
                    .HasConstraintName("FK_SurveyResponseZoneSectionSummary_[ScoringGradeId");

                entity.HasOne(d => d.ServiceResponseSurvey)
                    .WithMany(p => p.SurveyResponseZoneSectionSummaries)
                    .HasForeignKey(d => d.ServiceResponseSurveyId)
                    .HasConstraintName("FK_SurveyResponseZoneSectionSummary_ServiceResponse");

                entity.HasOne(d => d.SurveyZoneSectionScore)
                    .WithMany(p => p.SurveyResponseZoneSectionSummaries)
                    .HasForeignKey(d => d.SurveyZoneSectionScoreId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_SurveyResponseZoneSectionSummary_SurveyZoneSectionScoreId");

                entity.HasOne(d => d.Zone)
                    .WithMany(p => p.SurveyResponseZoneSectionSummaries)
                    .HasForeignKey(d => d.ZoneId)
                    .HasConstraintName("FK_SurveyResponseZoneSectionSummary_Zone");
            });

            modelBuilder.Entity<SurveySurveyType>(entity =>
            {
                entity.ToTable("SurveySurveyType");

                entity.Property(e => e.SurveySurveyTypeId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.EndDate).HasColumnType("datetime");

                entity.Property(e => e.StartDate).HasColumnType("datetime");

                entity.HasOne(d => d.Survey)
                    .WithMany(p => p.SurveySurveyTypes)
                    .HasForeignKey(d => d.SurveyId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_SurveySurveyType_Survey");
            });

            modelBuilder.Entity<SurveyTranslation>(entity =>
            {
                entity.HasKey(e => new { e.SurveyId, e.CultureCode })
                    .HasName("SurveyTranslation_PK");

                entity.ToTable("SurveyTranslation");

                entity.Property(e => e.CultureCode).HasMaxLength(10);

                entity.Property(e => e.Abbreviation).HasMaxLength(5);

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.Name).HasMaxLength(100);

                entity.Property(e => e.SurveyDescription).HasMaxLength(250);

                entity.HasOne(d => d.CultureCodeNavigation)
                    .WithMany(p => p.SurveyTranslations)
                    .HasForeignKey(d => d.CultureCode)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_SurveyTranslation_Culture");

                entity.HasOne(d => d.Survey)
                    .WithMany(p => p.SurveyTranslations)
                    .HasForeignKey(d => d.SurveyId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_SurveyTranslation_Survey");
            });

            modelBuilder.Entity<SurveyTranslationView>(entity =>
            {
                entity.HasNoKey();

                entity.ToView("SurveyTranslationView");

                entity.Property(e => e.Abbreviation).HasMaxLength(5);

                entity.Property(e => e.CultureCode).HasMaxLength(10);

                entity.Property(e => e.Name).HasMaxLength(100);

                entity.Property(e => e.SurveyDescription).HasMaxLength(250);
            });

            modelBuilder.Entity<SurveyType>(entity =>
            {
                entity.ToTable("SurveyType");

                entity.Property(e => e.SurveyTypeId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.EnumValue).HasMaxLength(64);
            });

            modelBuilder.Entity<SurveyTypeTranslation>(entity =>
            {
                entity.HasKey(e => new { e.CultureCode, e.SurveyTypeId })
                    .HasName("SurveyTypeTranslation_PK");

                entity.ToTable("SurveyTypeTranslation");

                entity.Property(e => e.CultureCode).HasMaxLength(10);

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.Name).HasMaxLength(64);

                entity.HasOne(d => d.CultureCodeNavigation)
                    .WithMany(p => p.SurveyTypeTranslations)
                    .HasForeignKey(d => d.CultureCode)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_SurveyTypeTranslation_Culture");

                entity.HasOne(d => d.SurveyType)
                    .WithMany(p => p.SurveyTypeTranslations)
                    .HasForeignKey(d => d.SurveyTypeId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_SurveyTypeTranslation_SurveyType");
            });

            modelBuilder.Entity<SurveyTypeTranslationView>(entity =>
            {
                entity.HasNoKey();

                entity.ToView("SurveyTypeTranslationView");

                entity.Property(e => e.CultureCode).HasMaxLength(10);

                entity.Property(e => e.Name).HasMaxLength(64);
            });

            modelBuilder.Entity<SurveyZoneSectionScore>(entity =>
            {
                entity.ToTable("SurveyZoneSectionScore");

                entity.Property(e => e.SurveyZoneSectionScoreId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.EndDate).HasColumnType("datetime");

                entity.Property(e => e.IsCurrentlyActive).HasComputedColumnSql("(isnull(CONVERT([bit],case when [StartDate]<=getutcdate() AND ([EndDate] IS NULL OR [EndDate]>=getutcdate()) then (1) else (0) end,(0)),(0)))", false);

                entity.Property(e => e.StartDate).HasColumnType("datetime");

                entity.HasOne(d => d.ScoringGroup)
                    .WithMany(p => p.SurveyZoneSectionScores)
                    .HasForeignKey(d => d.ScoringGroupId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_SurveyZoneSectionScore_ScoringGroupId");

                entity.HasOne(d => d.Survey)
                    .WithMany(p => p.SurveyZoneSectionScores)
                    .HasForeignKey(d => d.SurveyId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_SurveyZoneSectionScore_Survey");
            });

            modelBuilder.Entity<VisitService>(entity =>
            {
                entity.ToTable("VisitService");

                entity.Property(e => e.VisitServiceId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.HasOne(d => d.Survey)
                    .WithMany(p => p.VisitServices)
                    .HasForeignKey(d => d.SurveyId)
                    .HasConstraintName("FK_VisitService_Survey");
            });

            modelBuilder.Entity<Zone>(entity =>
            {
                entity.ToTable("Zone");

                entity.Property(e => e.ZoneId).ValueGeneratedNever();

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");
            });

            modelBuilder.Entity<ZoneTranslation>(entity =>
            {
                entity.HasKey(e => new { e.ZoneId, e.CultureCode })
                    .HasName("ZoneTranslation_PK");

                entity.ToTable("ZoneTranslation");

                entity.Property(e => e.CultureCode).HasMaxLength(10);

                entity.Property(e => e.ChangeDate).HasColumnType("datetime");

                entity.Property(e => e.Name).HasMaxLength(100);

                entity.HasOne(d => d.CultureCodeNavigation)
                    .WithMany(p => p.ZoneTranslations)
                    .HasForeignKey(d => d.CultureCode)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_ZoneTranslation_Culture");

                entity.HasOne(d => d.Zone)
                    .WithMany(p => p.ZoneTranslations)
                    .HasForeignKey(d => d.ZoneId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_ZoneTranslation_Zone");
            });

            modelBuilder.Entity<ZoneTranslationView>(entity =>
            {
                entity.HasNoKey();

                entity.ToView("ZoneTranslationView");

                entity.Property(e => e.CultureCode).HasMaxLength(10);

                entity.Property(e => e.Name).HasMaxLength(100);
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
