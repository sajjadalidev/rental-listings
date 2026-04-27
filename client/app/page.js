"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { ListingCard } from "@/components/ListingCard";

export default function ListingsPage() {
  const [filters, setFilters] = useState({ location: "", minBudget: "", maxBudget: "", moveInDate: "" });
  const [listings, setListings] = useState([]);
  const [error, setError] = useState("");

  async function loadListings(nextFilters = filters) {
    const params = new URLSearchParams();
    Object.entries(nextFilters).forEach(([key, value]) => value && params.set(key, value));
    try {
      const data = await apiFetch(`/listings?${params.toString()}`);
      setListings(data.listings);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadListings();
  }, []);

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <>
      <section className="hero">
        <div>
          <h1>Find, visit, and move into a verified rental.</h1>
          <p>Browse published homes, schedule visits, shortlist options, compare side-by-side, and keep move-in operations organized in one place.</p>
        </div>
      </section>
      <form
        className="toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          loadListings();
        }}
      >
        <div className="field">
          <label>Location</label>
          <input className="input" value={filters.location} onChange={(event) => updateFilter("location", event.target.value)} placeholder="City or neighborhood" />
        </div>
        <div className="field">
          <label>Min budget</label>
          <input className="input" type="number" value={filters.minBudget} onChange={(event) => updateFilter("minBudget", event.target.value)} placeholder="80000" />
        </div>
        <div className="field">
          <label>Max budget</label>
          <input className="input" type="number" value={filters.maxBudget} onChange={(event) => updateFilter("maxBudget", event.target.value)} placeholder="180000" />
        </div>
        <div className="field">
          <label>Move-in by</label>
          <input className="input" type="date" value={filters.moveInDate} onChange={(event) => updateFilter("moveInDate", event.target.value)} />
        </div>
        <button className="btn" type="submit"><Search size={17} /> Search listings</button>
      </form>
      <main className="page">
        {error && <p className="message">{error}</p>}
        <div className="grid cards">
          {listings.map((listing) => <ListingCard key={listing._id} listing={listing} />)}
        </div>
      </main>
    </>
  );
}
