"use client";

interface ServiceProps {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
  onBook: () => void;
}

export default function ServiceCard({ name, duration, price, description, onBook }: ServiceProps) {
  return (
    <div className="border border-zinc-200 rounded-xl p-6 hover:shadow-lg transition-all bg-white group">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-xl text-zinc-900 group-hover:text-blue-600 transition-colors">{name}</h3>
        <span className="bg-zinc-100 text-zinc-600 text-xs font-bold px-2 py-1 rounded-full">
          {duration} min
        </span>
      </div>
      
      <p className="text-zinc-500 text-sm mb-6 min-h-[40px]">{description}</p>
      
      <div className="flex items-center justify-between mt-auto">
        <span className="font-semibold text-zinc-900">
          {price === 0 ? "Free" : `$${price}`}
        </span>
        
        <button 
          onClick={onBook}
          className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}