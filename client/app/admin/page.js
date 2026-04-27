"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

const emptyListing = {
  title: "",
  location: { address: "", city: "", neighborhood: "" },
  rent: 0,
  bedrooms: 1,
  bathrooms: 1,
  availableFrom: "",
  status: "Draft",
  summary: "",
  description: "",
  gallery: [{ url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80", alt: "Rental home" }],
  amenities: ["Security", "Parking"],
  rules: ["No smoking indoors"],
  inventory: [{ item: "Keys", condition: "Ready" }]
};

export default function AdminPage() {
  const [listings, setListings] = useState([]);
  const [visits, setVisits] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [extensions, setExtensions] = useState([]);
  const [form, setForm] = useState(emptyListing);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [listingData, visitData, ticketData, extensionData] = await Promise.all([
        apiFetch("/listings/admin"),
        apiFetch("/visits"),
        apiFetch("/tickets"),
        apiFetch("/extensions")
      ]);
      setListings(listingData.listings);
      setVisits(visitData.visits);
      setTickets(ticketData.tickets);
      setExtensions(extensionData.requests);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateListingStatus(id, status) {
    await apiFetch(`/listings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    load();
  }

  async function updateVisit(id, status) {
    await apiFetch(`/visits/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status, scheduledAt: status === "Scheduled" ? new Date().toISOString() : undefined })
    });
    load();
  }

  async function updateExtension(id, status) {
    await apiFetch(`/extensions/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    load();
  }

  async function updateTicket(id, status) {
    await apiFetch(`/tickets/${id}/messages`, { method: "POST", body: JSON.stringify({ body: `Status changed to ${status}`, status }) });
    load();
  }

  async function createListing(event) {
    event.preventDefault();
    await apiFetch("/listings", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        rent: Number(form.rent),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        amenities: String(form.amenities).split(",").map((item) => item.trim()).filter(Boolean),
        rules: String(form.rules).split(",").map((item) => item.trim()).filter(Boolean),
        availableFrom: form.availableFrom || new Date().toISOString()
      })
    });
    setForm(emptyListing);
    load();
  }

  return (
    <main className="page grid">
      <h1>Admin operations dashboard</h1>
      {error && <p className="message">{error}</p>}
      <section className="card card-body">
        <h2 className="section-title">Review and publish listings</h2>
        <table className="table">
          <thead><tr><th>Listing</th><th>City</th><th>Rent</th><th>Status</th><th>Change status</th></tr></thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing._id}>
                <td>{listing.title}</td>
                <td>{listing.location?.city}</td>
                <td>PKR {listing.rent.toLocaleString()}</td>
                <td><StatusBadge value={listing.status} /></td>
                <td>
                  <select className="select" value={listing.status} onChange={(event) => updateListingStatus(listing._id, event.target.value)}>
                    {["Draft", "Review", "Published"].map((status) => <option key={status}>{status}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="split">
        <form className="card card-body" onSubmit={createListing}>
          <h2>Create listing</h2>
          <div className="field"><label>Title</label><input className="input" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></div>
          <div className="field"><label>City</label><input className="input" value={form.location.city} onChange={(event) => setForm({ ...form, location: { ...form.location, city: event.target.value } })} /></div>
          <div className="field"><label>Neighborhood</label><input className="input" value={form.location.neighborhood} onChange={(event) => setForm({ ...form, location: { ...form.location, neighborhood: event.target.value } })} /></div>
          <div className="field"><label>Rent</label><input className="input" type="number" value={form.rent} onChange={(event) => setForm({ ...form, rent: event.target.value })} /></div>
          <div className="field"><label>Available from</label><input className="input" type="date" value={form.availableFrom} onChange={(event) => setForm({ ...form, availableFrom: event.target.value })} /></div>
          <div className="field"><label>Summary</label><input className="input" value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} /></div>
          <div className="field"><label>Description</label><textarea className="textarea" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></div>
          <div className="field"><label>Amenities comma separated</label><input className="input" value={form.amenities} onChange={(event) => setForm({ ...form, amenities: event.target.value })} /></div>
          <div className="field"><label>Rules comma separated</label><input className="input" value={form.rules} onChange={(event) => setForm({ ...form, rules: event.target.value })} /></div>
          <button className="btn" type="submit">Save listing</button>
        </form>

        <section className="grid">
          <div className="card card-body">
            <h2 className="section-title">Visit scheduling</h2>
            <ul className="list">
              {visits.map((visit) => (
                <li key={visit._id}>
                  <div className="row"><strong>{visit.listing?.title}</strong><StatusBadge value={visit.status} /></div>
                  <p className="meta">{visit.tenant?.name} requested {new Date(visit.preferredDate).toLocaleString()}</p>
                  <select className="select" value={visit.status} onChange={(event) => updateVisit(visit._id, event.target.value)}>
                    {["Requested", "Scheduled", "Visited", "Decision"].map((status) => <option key={status}>{status}</option>)}
                  </select>
                </li>
              ))}
            </ul>
          </div>
          <div className="card card-body">
            <h2 className="section-title">Stay extensions</h2>
            <ul className="list">
              {extensions.map((request) => (
                <li key={request._id}>
                  <div className="row"><strong>{request.listing?.title}</strong><StatusBadge value={request.status} /></div>
                  <p className="meta">{request.tenant?.name} until {new Date(request.requestedUntil).toLocaleDateString()}</p>
                  <div className="row">
                    <button className="btn secondary" type="button" onClick={() => updateExtension(request._id, "Approved")}>Approve</button>
                    <button className="btn secondary" type="button" onClick={() => updateExtension(request._id, "Rejected")}>Reject</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </section>

      <section className="card card-body">
        <h2 className="section-title">Support ticket management</h2>
        <table className="table">
          <thead><tr><th>Subject</th><th>Tenant</th><th>Category</th><th>Status</th><th>Change status</th></tr></thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket._id}>
                <td>{ticket.subject}</td>
                <td>{ticket.tenant?.name}</td>
                <td>{ticket.category}</td>
                <td><StatusBadge value={ticket.status} /></td>
                <td>
                  <select className="select" value={ticket.status} onChange={(event) => updateTicket(ticket._id, event.target.value)}>
                    {["Open", "Waiting on Tenant", "Waiting on Ops", "Resolved"].map((status) => <option key={status}>{status}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
