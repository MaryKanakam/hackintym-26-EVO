"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Map,
  AlertTriangle,
  Zap,
  Calendar,
  BarChart3,
  RefreshCw,
  Search,
  Activity,
  Landmark,
} from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Dashboard", icon: Map },
  { href: "/complaints", label: "Complaints", icon: AlertTriangle },
  { href: "/ev-stations", label: "EV Stations", icon: Zap },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/tolls", label: "Tolls", icon: Landmark },
  { href: "/insights", label: "Insights", icon: BarChart3 },
];

export default function Navbar({ onRefresh }) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link href="/" className="navbar-brand">
          <div className="brand-icon">
            <Activity size={20} />
          </div>
          <div>
            <span className="brand-title">City One</span>
            <span className="brand-tagline">Urban Intelligence</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="nav-links">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${pathname === href ? "nav-link-active" : ""}`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          ))}
        </div>

        {/* Right Controls */}
        <div className="nav-controls">
          <div className="search-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search city data..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button
            onClick={handleRefresh}
            className={`refresh-btn ${isRefreshing ? "refreshing" : ""}`}
            title="Refresh data"
          >
            <RefreshCw size={16} />
          </button>
          <div className="live-indicator">
            <span className="live-dot"></span>
            <span className="live-text">LIVE</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
