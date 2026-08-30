import asyncio
import json
from hashlib import sha256
from pathlib import Path
from tempfile import TemporaryDirectory
from typing import Any

from .config import Settings


class OfficialDecoderUnavailable(RuntimeError):
    pass


async def decode_with_official_tool(payload: bytes, settings: Settings) -> dict[str, Any]:
    if not settings.official_decoder_path:
        raise OfficialDecoderUnavailable("official_fit_sdk_not_configured")

    executable = Path(settings.official_decoder_path).resolve(strict=True)
    if executable.is_dir():
        raise OfficialDecoderUnavailable("official_decoder_path_is_not_a_file")
    if settings.official_decoder_sha256:
        actual = sha256(executable.read_bytes()).hexdigest()
        if actual.lower() != settings.official_decoder_sha256.lower():
            raise OfficialDecoderUnavailable("official_decoder_checksum_mismatch")

    with TemporaryDirectory(prefix="rhc-fit-") as directory:
        source = Path(directory) / "upload.fit"
        output = Path(directory) / "decoded.json"
        source.write_bytes(payload)
        process = await asyncio.create_subprocess_exec(
            str(executable),
            "--input",
            str(source),
            "--output-json",
            str(output),
            stdout=asyncio.subprocess.DEVNULL,
            stderr=asyncio.subprocess.PIPE,
        )
        try:
            _, stderr = await asyncio.wait_for(process.communicate(), timeout=30)
        except TimeoutError as exc:
            process.kill()
            await process.wait()
            raise OfficialDecoderUnavailable("official_decoder_timeout") from exc
        if process.returncode != 0 or not output.is_file():
            safe_code = process.returncode if process.returncode is not None else -1
            raise OfficialDecoderUnavailable(f"official_decoder_failed:{safe_code}")
        try:
            decoded = json.loads(output.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError) as exc:
            raise OfficialDecoderUnavailable("official_decoder_invalid_output") from exc
        if not isinstance(decoded, dict):
            raise OfficialDecoderUnavailable("official_decoder_invalid_output")
        return decoded
