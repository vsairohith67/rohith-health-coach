from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="FIT_", extra="ignore")

    environment: str = "development"
    internal_token: str | None = None
    max_upload_bytes: int = Field(default=25 * 1024 * 1024, ge=1024, le=100 * 1024 * 1024)
    official_decoder_path: str | None = None
    official_decoder_sha256: str | None = None
    parser_version: str = "1.0.0-rc4"
    profile_version: str = "unavailable"
    requests_per_minute: int = Field(default=20, ge=1, le=300)


@lru_cache
def get_settings() -> Settings:
    return Settings()
