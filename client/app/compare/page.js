"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function ComparePage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    apiFetch("/shortlist").then((data) => setItems(data.items.slice(0, 3)));
  }, []);

  const rows = [
    ["Rent", (listing) => `PKR ${listing.rent.toLocaleString()}`],
    ["Location", (listing) => `${listing.location?.neighborhood}, ${listing.location?.city}`],
    ["Bedrooms", (listing) => listing.bedrooms],
    ["Bathrooms", (listing) => listing.bathrooms],
    ["Available", (listing) => new Date(listing.availableFrom).toLocaleDateString()],
    ["Amenities", (listing) => listing.amenities?.join(", ")]
  ];

  return (
    <main className="page grid">
      <h1>Compare shortlisted properties</h1>
      <p className="meta">The first three shortlisted homes are compared side-by-side.</p>
      <table className="table">
        <thead>
          <tr>
            <th>Criteria</th>
            {items.map((item) => <th key={item._id}>{item.listing?.title}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, render]) => (
            <tr key={label}>
              <td><strong>{label}</strong></td>
              {items.map((item) => <td key={`${item._id}-${label}`}>{render(item.listing)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
