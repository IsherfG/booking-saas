"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { format, isPast } from "date-fns";
import { Loader2, Lock, Calendar } from "lucide-react";

interface Appointment {
  id: string;
  customer_name: string;
  customer_email: string;
  start_time: string;
  service_id: string;
  booking_services: {
    name: string;
    price: number;
  };
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      const { data, error } = await supabase
        .from("booking_appointments")
        .select(
          `
          *,
          booking_services ( name, price )
        `
        )
        .order("start_time", { ascending: true });

      if (error) console.error("Error:", error);
      else setAppointments((data as any) || []);

      setLoading(false);
    };

    fetchData();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
    } else {
      alert("Wrong password!");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-2xl shadow-lg border border-zinc-100 w-full max-w-sm text-center"
        >
          <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-zinc-400" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900 mb-6">Admin Access</h1>
          <input
            type="password"
            placeholder="Enter Password"
            className="w-full p-3 border border-zinc-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-zinc-900"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-zinc-900 text-white py-3 rounded-xl font-medium hover:bg-zinc-800">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900">Dashboard</h1>
            <p className="text-zinc-500">Manage your upcoming bookings.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-full border border-zinc-200 text-sm font-medium text-zinc-600">
            {appointments.length} Total Bookings
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="text-center py-20 text-zinc-400 bg-white rounded-2xl border border-dashed border-zinc-200">
                No bookings found.
              </div>
            ) : (
              appointments.map((apt) => {
                const date = new Date(apt.start_time);
                const isFinished = isPast(date);

                return (
                  <div
                    key={apt.id}
                    className={`
                        bg-white p-6 rounded-xl border border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all
                        ${
                          isFinished
                            ? "opacity-60 grayscale"
                            : "hover:shadow-md"
                        }
                      `}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`
                          w-12 h-12 rounded-full flex items-center justify-center shrink-0
                          ${
                            isFinished
                              ? "bg-zinc-100 text-zinc-400"
                              : "bg-blue-50 text-blue-600"
                          }
                        `}
                      >
                        <Calendar className="w-6 h-6" />
                      </div>

                      <div>
                        <h3 className="font-bold text-zinc-900 text-lg">
                          {apt.booking_services?.name || "Unknown Service"}
                        </h3>
                        <div className="flex items-center gap-2 text-zinc-500 text-sm mt-1">
                          <span className="font-medium text-zinc-700">
                            {format(date, "MMMM d, yyyy")}
                          </span>
                          <span>•</span>
                          <span className="font-medium text-zinc-700">
                            {format(date, "h:mm aa")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-1 pl-16 md:pl-0">
                      <div className="font-medium text-zinc-900">
                        {apt.customer_name}
                      </div>
                      <div className="text-sm text-zinc-400">
                        {apt.customer_email}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
