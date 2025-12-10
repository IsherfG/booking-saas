"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ServiceCard from "./components/ServiceCard";
import DateSelector from "./components/DateSelector";
import TimeSlotSelector from "./components/TimeSlotSelector";
import { ChevronLeft, Loader2 } from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
}

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState<
    "idle" | "saving" | "success"
  >("idle");

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  const [bookedTimes, setBookedTimes] = useState<Date[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [formData, setFormData] = useState({ name: "", email: "" });

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from("booking_services")
        .select("*");
      if (error) console.error(error);
      else setServices(data || []);
      setLoading(false);
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDate) return;

      setLoadingSlots(true);
      setBookedTimes([]);

      const start = startOfDay(selectedDate).toISOString();
      const end = endOfDay(selectedDate).toISOString();

      const { data, error } = await supabase
        .from("booking_appointments")
        .select("start_time")
        .gte("start_time", start)
        .lte("start_time", end);

      if (error) {
        console.error("Error fetching slots:", error);
      } else {
        const times = data.map((booking) => new Date(booking.start_time));
        setBookedTimes(times);
      }
      setLoadingSlots(false);
    };

    fetchBookedSlots();
  }, [selectedDate]);

  const handleBook = async () => {
    if (!selectedService || !selectedTime || !formData.name || !formData.email)
      return;

    setBookingStatus("saving");

    const { error } = await supabase.from("booking_appointments").insert([
      {
        service_id: selectedService.id,
        customer_name: formData.name,
        customer_email: formData.email,
        start_time: selectedTime.toISOString(),
      },
    ]);

    if (error) {
      alert("Booking failed: " + error.message);
      setBookingStatus("idle");
    } else {
      setBookingStatus("success");
    }
  };

  const resetWizard = () => {
    setSelectedService(null);
    setSelectedDate(undefined);
    setSelectedTime(null);
    setBookingStatus("idle");
    setFormData({ name: "", email: "" });
  };

  if (bookingStatus === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full border border-zinc-100">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-zinc-500 mb-8">
            We have sent a confirmation email to {formData.email}.
          </p>
          <button
            onClick={resetWizard}
            className="w-full bg-zinc-900 text-white py-3 rounded-xl font-medium hover:bg-zinc-800"
          >
            Book Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <header className="mb-10 text-center">
          {selectedService ? (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={resetWizard}
                className="p-2 rounded-full hover:bg-zinc-200 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-zinc-600" />
              </button>
              <h1 className="text-3xl font-extrabold text-zinc-900">
                Book {selectedService.name}
              </h1>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight mb-2">
                Select a Service
              </h1>
              <p className="text-zinc-500">
                Choose a time slot to book an appointment with us.
              </p>
            </>
          )}
        </header>

        {selectedService ? (
          <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
            {/* 1. Date */}
            <DateSelector
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
            />

            {/* 2. Time */}
            {selectedDate && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                {loadingSlots ? (
                  <div className="text-center py-10 text-zinc-400 flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Checking availability...
                  </div>
                ) : (
                  <TimeSlotSelector
                    selectedDate={selectedDate}
                    bookedTimes={bookedTimes}
                    onSelect={setSelectedTime}
                  />
                )}
              </div>
            )}

            {/* 3. Final Summary & Inputs */}
            {selectedTime && (
              <div className="mt-8 pt-8 border-t border-zinc-100 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="font-semibold text-zinc-900 mb-4">
                  Your Details
                </h3>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {/* FIX: Added text-zinc-900 and bg-white to force visibility in Dark Mode */}
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full p-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 bg-white placeholder:text-zinc-400"
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full p-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-zinc-900 bg-white placeholder:text-zinc-400"
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="bg-zinc-50 p-4 rounded-xl flex justify-between items-center mb-6">
                  <div>
                    <p className="text-sm text-zinc-500">Appointment</p>
                    <p className="font-bold text-zinc-900">
                      {format(selectedTime, "MMMM d, h:mm aa")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-zinc-500">Price</p>
                    <p className="font-bold text-zinc-900">
                      ${selectedService.price}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleBook}
                  disabled={
                    bookingStatus === "saving" ||
                    !formData.name ||
                    !formData.email
                  }
                  className="w-full bg-zinc-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {bookingStatus === "saving" && (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  )}
                  {bookingStatus === "saving"
                    ? "Confirming..."
                    : "Confirm Booking"}
                </button>
              </div>
            )}
          </div>
        ) : loading ? (
          <div className="text-center text-zinc-400 py-20">
            Loading services...
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                {...service}
                onBook={() => setSelectedService(service)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
