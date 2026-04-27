"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CalendarCheck, Heart, Send } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

export default function ListingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [visitDate, setVisitDate] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiFetch(`/listings/${id}`).then((data) => setListing(data.listing));
  }, [id]);

  async function requestVisit() {
    if (!user) return router.push("/login");
    await apiFetch("/visits", { method: "POST", body: JSON.stringify({ listingId: id, preferredDate: visitDate }) });
    setMessage("Visit requested. Track status in your dashboard.");
  }

  async function shortlist() {
    if (!user) return router.push("/login");
    await apiFetch(`/shortlist/${id}`, { method: "POST" });
    setMessage("Added to shortlist.");
  }

  if (!listing) return <main className="page">Loading...</main>;

  return (
    <main className="page">
      <div className="split">
        <section className="grid">
          <div className="gallery">
            {listing.gallery?.slice(0, 3).map((image) => <img key={image.url} src={image.url} alt={image.alt} />)}
          </div>
          <div>
            <h1>{listing.title}</h1>
            <p className="meta">{listing.location.address}, {listing.location.neighborhood}, {listing.location.city}</p>
            <p>{listing.description}</p>
          </div>
          <section>
            <h2 className="section-title">Amenities</h2>
            <ul className="list">{listing.amenities?.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
          <section>
            <h2 className="section-title">Rules</h2>
            <ul className="list">{listing.rules?.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
          <section>
            <h2 className="section-title">Availability timeline</h2>
            <ul className="list">
              {listing.availabilityTimeline?.map((item) => (
                <li key={`${item.label}-${item.date}`}>
                  <strong>{item.label}</strong>
                  <div className="meta">{new Date(item.date).toLocaleDateString()} · {item.note}</div>
                </li>
              ))}
            </ul>
          </section>
        </section>
        <aside className="card card-body">
          <span className="pill">PKR {listing.rent.toLocaleString()} / month</span>
          <p>{listing.bedrooms} bedrooms · {listing.bathrooms} bathrooms</p>
          <p className="meta">Available from {new Date(listing.availableFrom).toLocaleDateString()}</p>
          {message && <p className="message">{message}</p>}
          <div className="field">
            <label>Preferred visit date</label>
            <input className="input" type="datetime-local" value={visitDate} onChange={(event) => setVisitDate(event.target.value)} />
          </div>
          <button className="btn" type="button" onClick={requestVisit}><CalendarCheck size={17} /> Request visit</button>
          <button className="btn secondary" type="button" onClick={shortlist}><Heart size={17} /> Shortlist property</button>
          <button className="btn warn" type="button" onClick={() => router.push(`/tickets?listing=${listing._id}`)}><Send size={17} /> Ask support</button>
        </aside>
      </div>
    </main>
  );
}
