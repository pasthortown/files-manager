using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FilesManager.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProcesamientoTimestamps : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ProcesamientoFin",
                table: "Archivos",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ProcesamientoInicio",
                table: "Archivos",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProcesamientoFin",
                table: "Archivos");

            migrationBuilder.DropColumn(
                name: "ProcesamientoInicio",
                table: "Archivos");
        }
    }
}
