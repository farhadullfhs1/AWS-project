import React from 'react';
import { Coffee } from 'lucide-react';

export const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) => {
  const baseStyle = "px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    // Primary, outline, and danger stay the same as they work beautifully on both backgrounds
    primary: "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20",
    secondary: "bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 dark:border-neutral-700",
    outline: "border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white",
    danger: "bg-red-600 hover:bg-red-500 text-white",
    ghost: "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/5"
  };
  return <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} disabled={disabled}>{children}</button>;
};

export const Input = ({ label, type = "text", placeholder, value, onChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-3 text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors placeholder-neutral-400 dark:placeholder-neutral-600 shadow-sm dark:shadow-none"
    />
  </div>
);

export const Badge = ({ children, color = "amber" }) => {
  const colors = {
    // The colored badges use opacity (/10, /20), so they adapt perfectly to both light and dark!
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20",
    green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20",
    red: "bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20",
    neutral: "bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700"
  };
  return <span className={`px-2 py-1 rounded text-xs font-medium border ${colors[color] || colors.neutral}`}>{children}</span>;
};

export const PageIntro = ({ eyebrow, title, subtitle, actions }) => (
  <div className="mb-8 md:mb-10">
    {eyebrow && <Badge color="blue">{eyebrow}</Badge>}
    <h1 className="mt-4 text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">{title}</h1>
    {subtitle && <p className="mt-3 max-w-2xl text-sm md:text-base text-neutral-600 dark:text-neutral-400">{subtitle}</p>}
    {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
  </div>
);

export const SkeletonCard = () => (
  <div className="animate-pulse rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm dark:shadow-none">
    <div className="aspect-square rounded-xl bg-neutral-200 dark:bg-neutral-800 mb-4" />
    <div className="h-4 w-3/5 rounded bg-neutral-200 dark:bg-neutral-800 mb-3" />
    <div className="h-3 w-4/5 rounded bg-neutral-200 dark:bg-neutral-800 mb-2" />
    <div className="h-3 w-2/5 rounded bg-neutral-200 dark:bg-neutral-800 mb-5" />
    <div className="h-11 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
  </div>
);

export const EmptyState = ({ icon, title, message, action }) => {
  const Icon = icon || Coffee;
  return (
    <div className="min-h-[55vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 p-8 text-center shadow-xl shadow-black/5 dark:shadow-2xl dark:shadow-black/20 backdrop-blur-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-500">
          <Icon size={28} />
        </div>
        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{title}</h3>
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">{message}</p>
        {action && <div className="mt-6 flex justify-center">{action}</div>}
      </div>
    </div>
  );
};