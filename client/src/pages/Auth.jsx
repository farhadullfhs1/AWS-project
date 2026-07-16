import React, { useState } from 'react';
import { Coffee, Loader2 } from 'lucide-react';
import { API_URL, ALLOW_MOCK_AUTH } from '../lib/brewhaven';
import { Button, Input } from '../components/ui';

export default function Auth({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const passwordHints = ["At least 8 characters", "Include upper and lower case letters", "Include a number or symbol"];
  const passwordRules = [
    { label: "8+ chars", met: password.length >= 8 },
    { label: "Uppercase", met: /[A-Z]/.test(password) },
    { label: "Lowercase", met: /[a-z]/.test(password) },
    { label: "Number/symbol", met: /[0-9\W_]/.test(password) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint = isRegistering ? "/auth/register/" : "/auth/login/";
      const payload = isRegistering ? { email, password, username: identifier.trim() || email.trim() } : { username: identifier || email, password };
      const res = await fetch(`${API_URL}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.status === 401 || res.status === 400) {
        let data = {};
        try { data = await res.json(); } catch {}
        setError(data.detail || data.error || "Invalid credentials or account already exists.");
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error("API Failed");
      const data = await res.json();
      if (isRegistering) {
        setIsRegistering(false);
      }
      onLogin(data.access, data.refresh, {
        username: data.username || identifier || email,
        email: data.email || (isRegistering ? email : ''),
        is_staff: !!data.is_staff,
        staff_branch: data.staff_branch || '',
        employee_id: data.employee_id || '',
      });
    } catch (error) {
      console.warn("Network error or Backend down:", error);
      if (ALLOW_MOCK_AUTH) {
        setTimeout(() => { onLogin("mock-token-123", "mock-refresh-token-123", { username: identifier || email || "Guest User", email: email || "", is_staff: false, staff_branch: "", employee_id: "" }); }, 1000);
      } else {
        setError("Unable to reach the authentication server.");
      }
    } finally {
      if (!isRegistering) setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-6 flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-md rounded-[28px] border border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 p-8 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
            <Coffee size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{isRegistering ? 'Create Account' : 'Welcome Back'}</h1>
          <p className="text-neutral-400 text-sm">{isRegistering ? 'Create an account with your email to get order updates later.' : 'Use your email or username to log in.'}</p>
        </div>
        {error && (
          <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${error.toLowerCase().includes('created') ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-red-500/20 bg-red-500/10 text-red-300'}`}>
            <div className="font-medium mb-1">{error.toLowerCase().includes('created') ? 'Success' : 'Something needs attention'}</div>
            <div className="leading-relaxed">{error}</div>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {isRegistering ? (
            <>
              <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
              <Input label="Display Name" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="optional" />
            </>
          ) : (
            <Input label="Email or Username" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="name@example.com" />
          )}
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          {isRegistering && (
            <div className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4 text-xs text-neutral-400">
              <div className="mb-3 font-medium text-neutral-300">Password must:</div>
              <div className="grid grid-cols-2 gap-2">
                {passwordRules.map(rule => (
                  <div key={rule.label} className={`rounded-xl border px-3 py-2 text-[11px] transition-colors ${rule.met ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-neutral-800 bg-neutral-900 text-neutral-500'}`}>
                    {rule.met ? '✓ ' : '• '}{rule.label}
                  </div>
                ))}
              </div>
              <ul className="mt-3 space-y-1 list-disc pl-4 text-neutral-500">
                {passwordHints.map(hint => <li key={hint}>{hint}</li>)}
              </ul>
            </div>
          )}
          <Button type="submit" className="w-full mt-6" disabled={loading}>{loading ? <Loader2 className="animate-spin"/> : (isRegistering ? 'Sign Up' : 'Log In')}</Button>
        </form>
        <div className="mt-6 flex flex-col gap-3 text-center text-sm text-neutral-500">
          <div>
            {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={() => { setIsRegistering(!isRegistering); setError(""); }} className="text-amber-500 hover:underline font-medium">{isRegistering ? 'Log In' : 'Sign Up'}</button>
          </div>
          <p className="text-[11px] leading-relaxed text-neutral-600">
            We’ll use your email later for order updates and, eventually, SNS notifications.
          </p>
        </div>
      </div>
    </div>
  );
}

