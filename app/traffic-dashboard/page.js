"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/common/Navbar";
import { getTrafficHotspots } from "@/services/trafficService";
import { getComplaints } from "@/services/complaintsService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/SimpleCard";
import { useLanguage } from "@/utils/LanguageContext";

const TrafficMap = dynamic(() => import("@/components/dashboard/TrafficMap"), {
  ssr: false,
  loading: () => <LoadingSpinner text="Initializing Traffic Map..." />
});

export default function TrafficDashboard() {
  const [traffic, setTraffic] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [trafficData, complaintsData] = await Promise.all([
        getTrafficHotspots(),
        getComplaints()
      ]);
      setTraffic(trafficData);
      setComplaints(complaintsData);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar onRefresh={fetchData} />
      
      <main className="pt-20 px-6 h-[calc(100vh-80px)] grid grid-cols-4 gap-6">
        {/* Statistics Panel */}
        <div className="col-span-1 flex flex-col gap-6 overflow-y-auto pr-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("liveTraffic")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Hotspots</span>
                  <span className="text-2xl font-bold text-red-500">{traffic.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Severe Congestion</span>
                  <span className="text-2xl font-bold text-orange-500">
                    {traffic.filter(t => t.congestion_level === 'severe').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("civicIssues")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {complaints.slice(0, 5).map(c => (
                  <div key={c.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-sm font-medium mb-1">{c.title}</div>
                    <div className="flex justify-between text-[10px] uppercase tracking-wider text-gray-500">
                      <span>{c.issue_type}</span>
                      <span className={c.severity === 'high' ? 'text-red-500' : 'text-gray-400'}>{t(c.severity?.toLowerCase()) || c.severity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Map */}
        <div className="col-span-3 h-full rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <LoadingSpinner text={t("syncing")} />
            </div>
          ) : (
            <TrafficMap 
              traffic={traffic} 
              incidents={complaints}
              activeLayers={new Set(["traffic", "incidents"])}
              mapMode="Live"
            />
          )}

          {/* Map Overlay Info */}
          <div className="absolute bottom-6 left-6 pointer-events-none">
            <div className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-bold tracking-widest text-green-500">{t("realTimeTraffic")}</span>
              </div>
              <p className="text-[10px] text-gray-400 max-w-[200px]">
                {t("trafficUpdate")}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
