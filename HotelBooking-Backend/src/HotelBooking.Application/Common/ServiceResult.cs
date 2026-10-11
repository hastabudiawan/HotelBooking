namespace HotelBooking.Application.Common;

public class ServiceResult<T>
{
    public bool Succeeded { get; private init; }
    public T? Data { get; private init; }
    public IReadOnlyList<string> Errors { get; private init; } = [];

    public static ServiceResult<T> Ok(T data) => new() { Succeeded = true, Data = data };

    public static ServiceResult<T> Fail(params string[] errors) => new() { Errors = errors };
}