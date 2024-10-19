using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ecolab.AuditChallenge.Database.Migrations
{
    public partial class AuditChallengeV100 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AccountConfiguration",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AccountId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AccountName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LimitToChallenge = table.Column<int>(type: "int", nullable: false),
                    LimitToReview = table.Column<int>(type: "int", nullable: false),
                    ChangedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AccountConfiguration", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ChallengedAudit",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ServiceResponseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AccountId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LocationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    SurveyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    UnitNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    VisitDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FindingsCount = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ChangedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChallengedAudit", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RoleConfiguration",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmailId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    ChangedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoleConfiguration", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ChallengedQuestion",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChallengedAuditId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SurveyQuestionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    QuestionNumber = table.Column<int>(type: "int", nullable: false),
                    QuestionText = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    PickLists = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    IsChallenged = table.Column<bool>(type: "bit", nullable: false),
                    IsReviewed = table.Column<bool>(type: "bit", nullable: false),
                    ChangedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChallengedQuestion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChallengedQuestion_ChallengedAudit_ChallengedAuditId",
                        column: x => x.ChallengedAuditId,
                        principalTable: "ChallengedAudit",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChallengedQuestionDetail",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChallengedQuestionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChallengedBy = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ChallengedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ChallengeNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    ReviewedBy = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ReviewedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReviewNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ChangedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChallengedQuestionDetail", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChallengedQuestionDetail_ChallengedQuestion_ChallengedQuestionId",
                        column: x => x.ChallengedQuestionId,
                        principalTable: "ChallengedQuestion",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChallengedQuestion_ChallengedAuditId",
                table: "ChallengedQuestion",
                column: "ChallengedAuditId");

            migrationBuilder.CreateIndex(
                name: "IX_ChallengedQuestionDetail_ChallengedQuestionId",
                table: "ChallengedQuestionDetail",
                column: "ChallengedQuestionId",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccountConfiguration");

            migrationBuilder.DropTable(
                name: "ChallengedQuestionDetail");

            migrationBuilder.DropTable(
                name: "RoleConfiguration");

            migrationBuilder.DropTable(
                name: "ChallengedQuestion");

            migrationBuilder.DropTable(
                name: "ChallengedAudit");
        }
    }
}
