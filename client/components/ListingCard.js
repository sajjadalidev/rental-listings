"use client";

import Link from "next/link";
import { CalendarDays, Heart, MapPin } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

export function ListingCard({ listing, onShortlisted }) {
  const { user } = useAuth();
  const image = listing.gallery?.[0]?.url;

  async function shortlist() {
    await apiFetch(`/shortlist/${listing._id}`, { method: "POST" });
    onShortlisted?.();
  }

  return (
    <article className="card">
      {image && <img src={image} alt={listing.gallery?.[0]?.alt || listing.title} />}
      <div className="card-body">
        <div className="row">
          <strong>{listing.title}</strong>
          <span className="pill">PKR {listing.rent.toLocaleString()}</span>
        </div>
        <div className="meta row">
          <span><MapPin size={15} /> {listing.location?.neighborhood}, {listing.location?.city}</span>
          <span><CalendarDays size={15} /> {new Date(listing.availableFrom).toLocaleDateString()}</span>
        </div>
        <p className="meta">{listing.summary}</p>
        <div className="row">
          <Link className="btn secondary" href={`/listings/${listing._id}`}>View details</Link>
          {user?.role === "tenant" && (
            <button className="btn" type="button" onClick={shortlist}><Heart size={16} /> Shortlist</button>
          )}
        </div>
      </div>
    </article>
  );
}
