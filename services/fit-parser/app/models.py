from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class IntegrityResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    sha256: str
    size_bytes: int
    header_size: int
    protocol_version: str
    profile_version: str
    header_crc_valid: bool | None
    file_crc_valid: bool


class ValidationResponse(BaseModel):
    status: Literal["valid"] = "valid"
    integrity: IntegrityResponse
    warnings: list[str] = Field(default_factory=list)


class ParseResponse(BaseModel):
    status: Literal["parsed"] = "parsed"
    integrity: IntegrityResponse
    sessions: list[dict[str, Any]] = Field(default_factory=list)
    laps: list[dict[str, Any]] = Field(default_factory=list)
    records: list[dict[str, Any]] = Field(default_factory=list)
    developer_fields: list[dict[str, Any]] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    unsupported_content: list[str] = Field(default_factory=list)
    parser_version: str
    profile_version: str
