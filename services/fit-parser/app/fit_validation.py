from dataclasses import dataclass
from hashlib import sha256

FIT_PROTOCOL_MIN_HEADER = 12
FIT_PROTOCOL_MAX_HEADER = 64


@dataclass(frozen=True)
class FitIntegrity:
    sha256: str
    size_bytes: int
    header_size: int
    protocol_version: str
    profile_version: str
    data_size: int
    header_crc_valid: bool | None
    file_crc_valid: bool


def crc16(data: bytes, initial: int = 0) -> int:
    crc = initial
    for byte in data:
        for bit in range(8):
            next_bit = (crc >> 15) & 1
            crc = (crc << 1) & 0xFFFF
            if ((byte >> (7 - bit)) & 1) != next_bit:
                crc ^= 0x8005
    return crc


def validate_fit_bytes(payload: bytes, max_bytes: int) -> FitIntegrity:
    if len(payload) > max_bytes:
        raise ValueError("file_too_large")
    if len(payload) < FIT_PROTOCOL_MIN_HEADER + 2:
        raise ValueError("fit_file_too_short")

    header_size = payload[0]
    if header_size < FIT_PROTOCOL_MIN_HEADER or header_size > FIT_PROTOCOL_MAX_HEADER:
        raise ValueError("invalid_fit_header_size")
    if len(payload) < header_size + 2:
        raise ValueError("truncated_fit_header")
    if payload[8:12] != b".FIT":
        raise ValueError("invalid_fit_signature")

    data_size = int.from_bytes(payload[4:8], "little")
    expected_size = header_size + data_size + 2
    if expected_size != len(payload):
        raise ValueError("fit_size_mismatch")

    stored_file_crc = int.from_bytes(payload[-2:], "little")
    calculated_file_crc = crc16(payload[:-2])
    file_crc_valid = stored_file_crc == calculated_file_crc
    if not file_crc_valid:
        raise ValueError("invalid_fit_file_crc")

    header_crc_valid: bool | None = None
    if header_size >= 14:
        stored_header_crc = int.from_bytes(payload[header_size - 2 : header_size], "little")
        header_crc_valid = stored_header_crc == crc16(payload[: header_size - 2])
        if not header_crc_valid:
            raise ValueError("invalid_fit_header_crc")

    protocol = payload[1]
    profile = int.from_bytes(payload[2:4], "little")
    return FitIntegrity(
        sha256=sha256(payload).hexdigest(),
        size_bytes=len(payload),
        header_size=header_size,
        protocol_version=f"{protocol >> 4}.{protocol & 0x0F}",
        profile_version=f"{profile // 100}.{profile % 100:02d}",
        data_size=data_size,
        header_crc_valid=header_crc_valid,
        file_crc_valid=file_crc_valid,
    )
