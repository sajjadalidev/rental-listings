"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

export default function TicketsPage() {
  return (
    <Suspense fallback={<main className="page">Loading tickets...</main>}>
      <TicketsContent />
    </Suspense>
  );
}

function TicketsContent() {
  const params = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ subject: "", category: "Other", message: "" });

  async function load() {
    const data = await apiFetch("/tickets");
    setTickets(data.tickets);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(event) {
    event.preventDefault();
    await apiFetch("/tickets", {
      method: "POST",
      body: JSON.stringify({ ...form, listingId: params.get("listing") || undefined })
    });
    setForm({ subject: "", category: "Other", message: "" });
    load();
  }

  async function reply(ticketId, body) {
    await apiFetch(`/tickets/${ticketId}/messages`, { method: "POST", body: JSON.stringify({ body }) });
    load();
  }

  return (
    <main className="page split">
      <section className="grid">
        <h1>Support tickets</h1>
        {tickets.map((ticket) => (
          <article className="card card-body" key={ticket._id}>
            <div className="row">
              <strong>{ticket.subject}</strong>
              <StatusBadge value={ticket.status} />
            </div>
            <p className="meta">{ticket.category} · {ticket.priority}</p>
            <ul className="list">
              {ticket.messages.map((message) => (
                <li key={message._id}>
                  <strong>{message.sender?.name}</strong>
                  <p>{message.body}</p>
                </li>
              ))}
            </ul>
            <ReplyBox onSubmit={(body) => reply(ticket._id, body)} />
          </article>
        ))}
      </section>
      <form className="card card-body" onSubmit={submit}>
        <h2>Open a ticket</h2>
        <div className="field">
          <label>Subject</label>
          <input className="input" value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} />
        </div>
        <div className="field">
          <label>Category</label>
          <select className="select" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
            {["Visit", "Move-in", "Maintenance", "Billing", "Other"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Message</label>
          <textarea className="textarea" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
        </div>
        <button className="btn" type="submit">Create ticket</button>
      </form>
    </main>
  );
}

function ReplyBox({ onSubmit }) {
  const [body, setBody] = useState("");
  return (
    <form
      className="row"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(body);
        setBody("");
      }}
    >
      <input className="input" value={body} onChange={(event) => setBody(event.target.value)} placeholder="Reply..." />
      <button className="btn secondary" type="submit">Send</button>
    </form>
  );
}
