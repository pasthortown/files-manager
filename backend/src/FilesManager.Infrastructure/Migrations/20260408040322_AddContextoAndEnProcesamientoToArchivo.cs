using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FilesManager.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddContextoAndEnProcesamientoToArchivo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Contexto",
                table: "Archivos",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "EnProcesamiento",
                table: "Archivos",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Contexto",
                table: "Archivos");

            migrationBuilder.DropColumn(
                name: "EnProcesamiento",
                table: "Archivos");
        }
    }
}
