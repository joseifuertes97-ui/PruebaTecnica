using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using PruebaTecnica.Models;

namespace PruebaTecnica.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration config;

    public AuthController(IConfiguration config)
    {
        this.config = config;
    }

    [HttpPost("login")]
    public IActionResult Login(LoginRequest request)
    {
        // Cuenta de demostración local. No existe una tabla de usuarios en el examen.
        if (request.Usuario != config["Demo:Usuario"] || request.Password != config["Demo:Password"])
            return Unauthorized(new { mensaje = "Usuario o contraseña incorrectos." });

        var ahora = DateTime.UtcNow;
        var vence = ahora.AddMinutes(1);
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, request.Usuario),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var clave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var firma = new SigningCredentials(clave, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            notBefore: ahora,
            expires: vence,
            signingCredentials: firma);

        return Ok(new
        {
            token = new JwtSecurityTokenHandler().WriteToken(token),
            expira = vence
        });
    }
}
