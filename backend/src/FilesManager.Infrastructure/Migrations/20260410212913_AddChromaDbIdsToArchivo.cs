using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FilesManager.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddChromaDbIdsToArchivo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ChromaDbIds",
                table: "Archivos",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ChromaDbIds",
                table: "Archivos");
        }
    }
}
