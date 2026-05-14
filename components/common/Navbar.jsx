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
import { useLanguage } from "@/utils/LanguageContext";

const navLinks = [
  { href: "/", labelKey: "dashboard", icon: Map },
  { href: "/complaints", labelKey: "complaints", icon: AlertTriangle },
  { href: "/ev-stations", labelKey: "evStations", icon: Zap },
  { href: "/events", labelKey: "events", icon: Calendar },
  { href: "/tolls", labelKey: "tolls", icon: Landmark },
  { href: "/traffic-dashboard", labelKey: "liveTraffic", icon: Activity },
  { href: "/insights", labelKey: "insights", icon: BarChart3 },
];

export default function Navbar({ onRefresh }) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { language, setLanguage, t } = useLanguage();

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
            <span className="brand-title">urbanSense</span>
            <span className="brand-tagline">Urban Intelligence</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="nav-links">
          {navLinks.map(({ href, labelKey, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${pathname === href ? "nav-link-active" : ""}`}
            >
              <Icon size={16} />
              <span>{t(labelKey)}</span>
            </Link>
          ))}
        </div>

        {/* Right Controls */}
        <div className="nav-controls">
          {/* Language Selector */}
          <select 
            className="filter-select" 
            style={{ width: "auto", background: "transparent", border: "1px solid rgba(255,255,255,0.1)" }}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="ta">தமிழ்</option>
            <option value="hi">हिन्दी</option>
            <option value="te">తెలుగు</option>
            <option value="ml">മലയാളം</option>
            <option value="kn">ಕನ್ನಡ</option>
          </select>

          <div className="search-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder={t("search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button
            onClick={handleRefresh}
            className={`refresh-btn ${isRefreshing ? "refreshing" : ""}`}
            title={t("refresh")}
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
