using HotelBooking.Application.Common;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.Api.Controllers;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    // Berhasil: 200 dengan data. Gagal: ProblemDetails sesuai status.
    protected ActionResult<T> ToActionResult<T>(ServiceResult<T> result)
    {
        if (result.Succeeded)
            return Ok(result.Data);

        return ProblemFor(result);
    }

    // Untuk operasi tanpa data (hapus): 204 jika berhasil.
    protected IActionResult ToNoContent(ServiceResult result)
    {
        if (result.Succeeded)
            return NoContent();

        return ProblemFor(result);
    }

    private ObjectResult ProblemFor(ServiceResult result)
    {
        var (status, title) = result.Status switch
        {
            ResultStatus.NotFound => (StatusCodes.Status404NotFound, "Data tidak ditemukan"),
            ResultStatus.Conflict => (StatusCodes.Status409Conflict, "Konflik data"),
            _ => (StatusCodes.Status400BadRequest, "Permintaan tidak valid")
        };

        return Problem(title: title, detail: string.Join(" ", result.Errors), statusCode: status);
    }
}