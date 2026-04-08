using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FilesManager.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProcesadoToArchivo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Procesado",
                table: "Archivos",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Procesado",
                table: "Archivos");
        }
    }
}
