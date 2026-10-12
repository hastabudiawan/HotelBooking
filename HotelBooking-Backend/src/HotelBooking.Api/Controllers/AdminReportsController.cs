using HotelBooking.Application.Operations;
using HotelBooking.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.Api.Controllers;

[ApiController]
[Route("api/admin/reports")]
[Authorize(Roles = AppRoles.Admin)]
public class AdminReportsController : ApiControllerBase
{
    private readonly IReportService _service;

    public AdminReportsController(IReportService service)
    {
        _service = service;
    }

    // "from" adalah kata kunci C#, jadi nama parameter di kode berbeda dari nama di URL.
    [HttpGet("occupancy")]
    public async Task<ActionResult<OccupancyReportDto>> Occupancy(
        [FromQuery(Name = "from")] DateOnly fromDate,
        [FromQuery(Name = "to")] DateOnly toDate,
        CancellationToken ct)
    {
        return ToActionResult(await _service.GetOccupancyAsync(fromDate, toDate, ct));
    }
}