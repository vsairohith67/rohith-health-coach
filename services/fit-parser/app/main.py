import logging
from contextlib import asynccontextmanager
from typing import Annotated, Any

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile

from .config import Settings, get_settings
from .fit_validation import FitIntegrity, validate_fit_bytes
from .models import IntegrityResponse, ParseResponse, ValidationResponse
from .official_adapter import OfficialDecoderUnavailable, decode_with_official_tool
from .security import require_internal_auth

logger = logging.getLogger("fit-parser")


@asynccontextmanager
async def lifespan(_: FastAPI):
    logging.basicConfig(format="%(levelname)s %(name)s %(message)s", level=logging.INFO)
    logger.info("service_started")
    yield
    logger.info("service_stopped")


app = FastAPI(
    title="Rohith Health Coach FIT parser",
    version="1.0.0-rc5",
    docs_url=None,
    redoc_url=None,
    lifespan=lifespan,
)


def public_integrity(value: FitIntegrity) -> IntegrityResponse:
    return IntegrityResponse(
        sha256=value.sha256,
        size_bytes=value.size_bytes,
        header_size=value.header_size,
        protocol_version=value.protocol_version,
        profile_version=value.profile_version,
        header_crc_valid=value.header_crc_valid,
        file_crc_valid=value.file_crc_valid,
    )


async def read_valid_file(file: UploadFile, settings: Settings) -> tuple[bytes, FitIntegrity]:
    original_name = file.filename or "unnamed"
    if not original_name.lower().endswith(".fit"):
        raise HTTPException(status_code=422, detail="fit_extension_required")
    payload = await file.read(settings.max_upload_bytes + 1)
    await file.close()
    try:
        return payload, validate_fit_bytes(payload, settings.max_upload_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/version", dependencies=[Depends(require_internal_auth)])
async def version(settings: Annotated[Settings, Depends(get_settings)]) -> dict[str, str]:
    return {
        "parser_version": settings.parser_version,
        "profile_version": settings.profile_version,
        "decoder": "configured" if settings.official_decoder_path else "not_configured",
    }


@app.post(
    "/validate",
    response_model=ValidationResponse,
    dependencies=[Depends(require_internal_auth)],
)
async def validate(
    file: Annotated[UploadFile, File()],
    settings: Annotated[Settings, Depends(get_settings)],
) -> ValidationResponse:
    _, integrity = await read_valid_file(file, settings)
    logger.info(
        "fit_validated sha256_prefix=%s size_bytes=%d",
        integrity.sha256[:12],
        integrity.size_bytes,
    )
    return ValidationResponse(integrity=public_integrity(integrity))


@app.post("/parse", response_model=ParseResponse, dependencies=[Depends(require_internal_auth)])
async def parse(
    file: Annotated[UploadFile, File()],
    settings: Annotated[Settings, Depends(get_settings)],
) -> ParseResponse:
    payload, integrity = await read_valid_file(file, settings)
    try:
        decoded = await decode_with_official_tool(payload, settings)
    except (OfficialDecoderUnavailable, FileNotFoundError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    def list_field(name: str) -> list[dict[str, Any]]:
        value = decoded.get(name, [])
        return value if isinstance(value, list) else []

    logger.info(
        "fit_parsed sha256_prefix=%s size_bytes=%d",
        integrity.sha256[:12],
        integrity.size_bytes,
    )
    return ParseResponse(
        integrity=public_integrity(integrity),
        sessions=list_field("sessions"),
        laps=list_field("laps"),
        records=list_field("records"),
        developer_fields=list_field("developer_fields"),
        warnings=[str(item) for item in decoded.get("warnings", [])],
        unsupported_content=[str(item) for item in decoded.get("unsupported_content", [])],
        parser_version=settings.parser_version,
        profile_version=integrity.profile_version,
    )
