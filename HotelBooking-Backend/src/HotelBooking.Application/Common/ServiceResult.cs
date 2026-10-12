namespace HotelBooking.Application.Common;

public enum ResultStatus
{
    Success,
    Invalid,
    NotFound,
    Conflict
}

public class ServiceResult
{
    public ResultStatus Status { get; protected init; } = ResultStatus.Success;
    public bool Succeeded => Status == ResultStatus.Success;
    public IReadOnlyList<string> Errors { get; protected init; } = [];

    public static ServiceResult Ok() => new();

    public static ServiceResult Fail(params string[] errors) =>
        new() { Status = ResultStatus.Invalid, Errors = errors };

    public static ServiceResult NotFound(string error) =>
        new() { Status = ResultStatus.NotFound, Errors = [error] };

    public static ServiceResult Conflict(string error) =>
        new() { Status = ResultStatus.Conflict, Errors = [error] };
}

public class ServiceResult<T> : ServiceResult
{
    public T? Data { get; private init; }

    public static ServiceResult<T> Ok(T data) => new() { Data = data };

    public new static ServiceResult<T> Fail(params string[] errors) =>
        new() { Status = ResultStatus.Invalid, Errors = errors };

    public new static ServiceResult<T> NotFound(string error) =>
        new() { Status = ResultStatus.NotFound, Errors = [error] };

    public new static ServiceResult<T> Conflict(string error) =>
        new() { Status = ResultStatus.Conflict, Errors = [error] };
}