"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

export default function TenantDashboardPage() {
  const [data, setData] = useState({ visits: [], moveIns: [], requests: [], shortlist: [] });
  const [extensionForm, setExtensionForm] = useState({ listingId: "", requestedUntil: "", reason: "" });
  const [error, setError] = useState("");

  async function load() {
    try {
      const [visits, moveIns, requests, shortlist] = await Promise.all([
        apiFetch("/visits"),
        apiFetch("/move-ins"),
        apiFetch("/extensions"),
        apiFetch("/shortlist")
      ]);
      setData({ visits: visits.visits, moveIns: moveIns.moveIns, requests: requests.requests, shortlist: shortlist.items });
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createMoveIn(listingId) {
    await apiFetch("/move-ins", {
      method: "POST",
      body: JSON.stringify({ listingId, moveInDate: new Date().toISOString() })
    });
    load();
  }

  async function updateMoveIn(moveIn, patch) {
    await apiFetch(`/move-ins/${moveIn._id}`, { method: "PATCH", body: JSON.stringify(patch) });
    load();
  }

  async function requestExtension(event) {
    event.preventDefault();
    await apiFetch("/extensions", { method: "POST", body: JSON.stringify(extensionForm) });
    setExtensionForm({ listingId: "", requestedUntil: "", reason: "" });
    load();
  }

  return (
    <main className="page grid">
      <h1>Tenant dashboard</h1>
      {error && <p className="message">{error}</p>}
      <section className="card card-body">
        <h2 className="section-title">Visit status pipeline</h2>
        <table className="table">
          <thead><tr><th>Property</th><th>Preferred</th><th>Scheduled</th><th>Status</th><th>Decision</th></tr></thead>
          <tbody>
            {data.visits.map((visit) => (
              <tr key={visit._id}>
                <td>{visit.listing?.title}</td>
                <td>{new Date(visit.preferredDate).toLocaleString()}</td>
                <td>{visit.scheduledAt ? new Date(visit.scheduledAt).toLocaleString() : "Pending"}</td>
                <td><StatusBadge value={visit.status} /></td>
                <td>{visit.decision}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid cards">
        <div className="card card-body">
          <h2 className="section-title">Shortlist</h2>
          <ul className="list">
            {data.shortlist.map((item) => (
              <li key={item._id} className="row">
                <span>{item.listing?.title}</span>
                <Link className="btn secondary" href={`/listings/${item.listing?._id}`}>Open</Link>
              </li>
            ))}
          </ul>
          <Link className="btn" href="/compare">Compare shortlisted homes</Link>
        </div>

        <div className="card card-body">
          <h2 className="section-title">Stay extension requests</h2>
          <ul className="list">
            {data.requests.map((request) => (
              <li key={request._id}>
                <strong>{request.listing?.title}</strong>
                <div className="row">
                  <span className="meta">Until {new Date(request.requestedUntil).toLocaleDateString()}</span>
                  <StatusBadge value={request.status} />
                </div>
              </li>
            ))}
          </ul>
          <form className="grid" onSubmit={requestExtension}>
            <div className="field">
              <label>Property</label>
              <select className="select" value={extensionForm.listingId} onChange={(event) => setExtensionForm({ ...extensionForm, listingId: event.target.value })}>
                <option value="">Select property</option>
                {data.shortlist.map((item) => <option key={item._id} value={item.listing?._id}>{item.listing?.title}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Requested until</label>
              <input className="input" type="date" value={extensionForm.requestedUntil} onChange={(event) => setExtensionForm({ ...extensionForm, requestedUntil: event.target.value })} />
            </div>
            <div className="field">
              <label>Reason</label>
              <textarea className="textarea" value={extensionForm.reason} onChange={(event) => setExtensionForm({ ...extensionForm, reason: event.target.value })} />
            </div>
            <button className="btn secondary" type="submit">Request extension</button>
          </form>
        </div>
      </section>

      <section className="card card-body">
        <h2 className="section-title">Move-in checklist</h2>
        {data.moveIns.map((moveIn) => (
          <div key={moveIn._id} className="grid">
            <div className="row">
              <div>
                <strong>{moveIn.listing?.title}</strong>
                <p className="meta">Move-in date {new Date(moveIn.moveInDate).toLocaleDateString()}</p>
              </div>
              <StatusBadge value={moveIn.status} />
            </div>
            <ul className="list">
              {moveIn.checklist.map((item, index) => (
                <li key={item.item} className="row">
                  <span>{item.item}</span>
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={(event) => {
                      const checklist = moveIn.checklist.map((row, rowIndex) => rowIndex === index ? { ...row, completed: event.target.checked } : row);
                      updateMoveIn(moveIn, { checklist });
                    }}
                  />
                </li>
              ))}
              <li className="row">
                <span>Agreement confirmed</span>
                <input type="checkbox" checked={moveIn.agreementConfirmed} onChange={(event) => updateMoveIn(moveIn, { agreementConfirmed: event.target.checked })} />
              </li>
              <li className="row">
                <span>Inventory accepted</span>
                <input type="checkbox" checked={moveIn.inventoryAccepted} onChange={(event) => updateMoveIn(moveIn, { inventoryAccepted: event.target.checked })} />
              </li>
            </ul>
            <DocumentUpload moveInId={moveIn._id} onUploaded={load} />
            {moveIn.documents?.length > 0 && (
              <ul className="list">
                {moveIn.documents.map((document) => (
                  <li key={document._id || document.filename} className="row">
                    <span>{document.label}</span>
                    <span className="meta">{document.verified ? "Verified" : "Uploaded"}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {!data.moveIns.length && data.shortlist[0] && (
          <button className="btn" type="button" onClick={() => createMoveIn(data.shortlist[0].listing._id)}>Start move-in for shortlisted property</button>
        )}
      </section>
    </main>
  );
}

function DocumentUpload({ moveInId, onUploaded }) {
  const [label, setLabel] = useState("Identity document");
  const [file, setFile] = useState(null);

  async function submit(event) {
    event.preventDefault();
    if (!file) return;
    const body = new FormData();
    body.append("label", label);
    body.append("document", file);
    await apiFetch(`/move-ins/${moveInId}/documents`, { method: "POST", body });
    setFile(null);
    onUploaded();
  }

  return (
    <form className="row" onSubmit={submit}>
      <input className="input" value={label} onChange={(event) => setLabel(event.target.value)} />
      <input className="input" type="file" onChange={(event) => setFile(event.target.files?.[0])} />
      <button className="btn secondary" type="submit">Upload document</button>
    </form>
  );
}
