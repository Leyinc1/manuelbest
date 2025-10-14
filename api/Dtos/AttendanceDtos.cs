
using System.Text.Json.Serialization;

namespace ManuelBestApi.Dtos;

public class SaveAttendanceRecordDto
{
    [JsonPropertyName("team")]
    public string? Team { get; set; }

    [JsonPropertyName("student_id")]
    public string? StudentId { get; set; }

    [JsonPropertyName("present")]
    public bool Present { get; set; }
}

public class SaveAttendancePayloadDto
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = null!;

    [JsonPropertyName("key")]
    public string Key { get; set; } = null!;

    [JsonPropertyName("records")]
    public List<SaveAttendanceRecordDto> Records { get; set; } = new();
}
