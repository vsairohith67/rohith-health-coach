import os
from hashlib import sha256

os.environ["FIT_INTERNAL_TOKEN"] = "unit-fixture-not-a-secret"  # noqa: S105

from fastapi.testclient import TestClient

from app.fit_validation import crc16
from app.main import app


def fit_fixture() -> bytes:
    header_without_crc = bytes([14, 0x20, 0xB8, 0x08]) + (0).to_bytes(4, "little") + b".FIT"
    header = header_without_crc + crc16(header_without_crc).to_bytes(2, "little")
    return header + crc16(header).to_bytes(2, "little")


client = TestClient(app)
headers = {"Authorization": "Bearer unit-fixture-not-a-secret"}  # noqa: S105


def test_health_is_public_and_minimal() -> None:
    assert client.get("/health").json() == {"status": "ok"}


def test_validate_rejects_missing_auth() -> None:
    response = client.post("/validate", files={"file": ("sample.fit", fit_fixture())})
    assert response.status_code == 401


def test_validate_checks_signature_crc_and_hash() -> None:
    fixture = fit_fixture()
    response = client.post("/validate", headers=headers, files={"file": ("sample.fit", fixture)})
    assert response.status_code == 200
    body = response.json()
    assert body["integrity"]["sha256"] == sha256(fixture).hexdigest()
    assert body["integrity"]["file_crc_valid"] is True
    assert body["integrity"]["header_crc_valid"] is True


def test_validate_rejects_extension_only_spoof() -> None:
    response = client.post("/validate", headers=headers, files={"file": ("spoof.fit", b"not-fit")})
    assert response.status_code == 422


def test_parse_fails_closed_without_official_sdk() -> None:
    response = client.post("/parse", headers=headers, files={"file": ("sample.fit", fit_fixture())})
    assert response.status_code == 503
    assert response.json()["detail"] == "official_fit_sdk_not_configured"
