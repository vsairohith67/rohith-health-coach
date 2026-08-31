"use client";

import { useActionState } from "react";
import {
  createIphoneIngestionCredential,
  revokeIphoneIngestionDevice,
  rotateIphoneIngestionCredential,
  type CredentialIssueState,
  type CredentialMutationState,
} from "../app/settings/ingestion/actions";

export type IngestionDeviceSummary = {
  deviceId: string;
  deviceName: string;
  tokenHint: string;
  credentialCreatedAt: string;
  expiresAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

const EMPTY_ISSUE_STATE: CredentialIssueState = { status: "idle", message: "" };
const EMPTY_MUTATION_STATE: CredentialMutationState = {
  status: "idle",
  message: "",
};

function OneTimeCredential({
  state,
}: Readonly<{ state: CredentialIssueState }>) {
  if (state.status !== "issued") return null;
  return (
    <section className="one-time-credential" aria-labelledby="credential-ready">
      <p className="section-label">One-time display</p>
      <h2 id="credential-ready">Copy both values to the iPhone now</h2>
      <label htmlFor={`device-${state.deviceId}`}>Device ID</label>
      <textarea
        id={`device-${state.deviceId}`}
        readOnly
        rows={2}
        spellCheck={false}
        value={state.deviceId}
      />
      <label htmlFor={`token-${state.deviceId}`}>Device ingestion token</label>
      <textarea
        id={`token-${state.deviceId}`}
        readOnly
        rows={3}
        spellCheck={false}
        value={state.token}
      />
      <p>
        Hint {state.tokenHint} · expires{" "}
        {new Date(state.expiresAt).toLocaleString("en-IN")}
      </p>
      <strong>
        Do not paste the token into Git, notes, email, logs, or this project.
      </strong>
    </section>
  );
}

function DeviceCard({ device }: Readonly<{ device: IngestionDeviceSummary }>) {
  const [rotateState, rotateAction, rotatePending] = useActionState(
    rotateIphoneIngestionCredential,
    EMPTY_ISSUE_STATE,
  );
  const [revokeState, revokeAction, revokePending] = useActionState(
    revokeIphoneIngestionDevice,
    EMPTY_MUTATION_STATE,
  );
  const revoked = device.revokedAt !== null;

  return (
    <article className="ingestion-device-card">
      <div>
        <span className={`status-pill ${revoked ? "off" : "active"}`}>
          {revoked ? "Revoked" : "Active"}
        </span>
        <h3>{device.deviceName}</h3>
        <p>
          Device ID <code>{device.deviceId}</code>
        </p>
        <p>
          Token hint {device.tokenHint} · expires{" "}
          {new Date(device.expiresAt).toLocaleString("en-IN")}
        </p>
        <p>
          Last used:{" "}
          {device.lastUsedAt
            ? new Date(device.lastUsedAt).toLocaleString("en-IN")
            : "never"}
        </p>
      </div>
      {!revoked ? (
        <div className="credential-actions">
          <form action={rotateAction}>
            <input type="hidden" name="device_id" value={device.deviceId} />
            <button type="submit" disabled={rotatePending}>
              {rotatePending ? "Rotating…" : "Rotate credential"}
            </button>
          </form>
          <form action={revokeAction}>
            <input type="hidden" name="device_id" value={device.deviceId} />
            <button
              className="danger-button"
              type="submit"
              disabled={revokePending}
            >
              {revokePending ? "Revoking…" : "Revoke device"}
            </button>
          </form>
        </div>
      ) : null}
      <p className="auth-message" aria-live="polite">
        {rotateState.message || revokeState.message}
      </p>
      <OneTimeCredential state={rotateState} />
    </article>
  );
}

export function IngestionCredentialManager({
  devices,
}: Readonly<{ devices: IngestionDeviceSummary[] }>) {
  const [createState, createAction, createPending] = useActionState(
    createIphoneIngestionCredential,
    EMPTY_ISSUE_STATE,
  );

  return (
    <>
      <section
        className="credential-panel"
        aria-labelledby="create-credential-heading"
      >
        <p className="section-label">Private device access</p>
        <h2 id="create-credential-heading">
          Create iPhone ingestion credential
        </h2>
        <p>
          The database generates a 256-bit, ingestion-only credential. It
          expires after seven days and is shown once.
        </p>
        <form action={createAction}>
          <label htmlFor="device_name">Device name</label>
          <input
            id="device_name"
            name="device_name"
            type="text"
            defaultValue="Rohith iPhone"
            minLength={1}
            maxLength={80}
            autoComplete="off"
            required
          />
          <button type="submit" disabled={createPending}>
            {createPending ? "Creating…" : "Create one-time credential"}
          </button>
        </form>
        <p className="auth-message" aria-live="polite">
          {createState.message}
        </p>
      </section>
      <OneTimeCredential state={createState} />
      <section
        className="credential-panel"
        aria-labelledby="existing-devices-heading"
      >
        <p className="section-label">Credential inventory</p>
        <h2 id="existing-devices-heading">iPhone ingestion devices</h2>
        {devices.length ? (
          <div className="ingestion-device-list">
            {devices.map((device) => (
              <DeviceCard key={device.deviceId} device={device} />
            ))}
          </div>
        ) : (
          <p>No ingestion device exists yet.</p>
        )}
      </section>
    </>
  );
}
