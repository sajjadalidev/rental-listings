"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "tenant@example.com", password: "password123" });
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    try {
      const user = await login(form.email, form.password);
      router.push(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="auth-page">
      <form className="card card-body" onSubmit={submit}>
        <h1>Login</h1>
        {error && <p className="message">{error}</p>}
        <div className="field">
          <label>Email</label>
          <input className="input" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </div>
        <div className="field">
          <label>Password</label>
          <input className="input" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        </div>
        <button className="btn" type="submit">Sign in</button>
        <Link className="meta" href="/register">Create a tenant account</Link>
      </form>
    </main>
  );
}
