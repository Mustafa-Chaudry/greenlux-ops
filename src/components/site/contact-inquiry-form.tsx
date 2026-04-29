"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getWhatsAppHref } from "@/lib/site/config";
import { rooms } from "@/lib/site/rooms";

export function ContactInquiryForm() {
  const [name, setName] = useState("");
  const [dates, setDates] = useState("");
  const [room, setRoom] = useState("Not sure yet");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const inquiry = [
      "Hello GreenLux Residency, I would like to check availability.",
      name ? `Name: ${name}` : null,
      dates ? `Dates: ${dates}` : null,
      room ? `Room preference: ${room}` : null,
      message ? `Notes: ${message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(getWhatsAppHref(inquiry), "_blank", "noreferrer");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dates">Dates</Label>
        <Input
          id="dates"
          value={dates}
          onChange={(event) => setDates(event.target.value)}
          placeholder="Example: 12 May to 16 May"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="room">Room preference</Label>
        <select
          id="room"
          value={room}
          onChange={(event) => setRoom(event.target.value)}
          className="flex h-10 w-full rounded-lg border border-brand-sage bg-white px-3 py-2 text-sm text-brand-charcoal shadow-sm outline-none transition-colors focus:border-brand-fresh focus:ring-2 focus:ring-brand-sage"
        >
          <option>Not sure yet</option>
          {rooms.map((roomOption) => (
            <option key={roomOption.slug}>{roomOption.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Notes</Label>
        <textarea
          id="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={4}
          className="w-full rounded-lg border border-brand-sage bg-white px-3 py-2 text-sm text-brand-charcoal shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-brand-fresh focus:ring-2 focus:ring-brand-sage"
          placeholder="Guests, arrival time, or any special request"
        />
      </div>
      <Button type="submit" className="w-full">
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        Send on WhatsApp
      </Button>
    </form>
  );
}
