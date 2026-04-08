namespace FilesManager.Application.Common;

/// <summary>
/// Standard API response wrapper for all API endpoints.
/// </summary>
/// <typeparam name="T">The type of the response data.</typeparam>
public class ApiResponse<T>
{
    /// <summary>
    /// Indicates whether the request was successful.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// The response message.
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// The response data payload.
    /// </summary>
    public T? Data { get; set; }

    /// <summary>
    /// List of errors if the request failed.
    /// </summary>
    public List<string> Errors { get; set; } = new();

    /// <summary>
    /// Creates a successful response with data.
    /// </summary>
    /// <param name="data">The data to return.</param>
    /// <param name="message">An optional success message.</param>
    /// <returns>A successful <see cref="ApiResponse{T}"/>.</returns>
    public static ApiResponse<T> SuccessResponse(T data, string message = "Operacion exitosa")
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Data = data
        };
    }

    /// <summary>
    /// Creates a failure response with errors.
    /// </summary>
    /// <param name="message">The error message.</param>
    /// <param name="errors">An optional list of detailed errors.</param>
    /// <returns>A failed <see cref="ApiResponse{T}"/>.</returns>
    public static ApiResponse<T> FailureResponse(string message, List<string>? errors = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Errors = errors ?? new List<string>()
        };
    }
}
