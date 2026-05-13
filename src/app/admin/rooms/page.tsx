import type { Metadata } from "next";
import Link from "next/link";
import { updateRoomCleaningStatus, updateRoomOperationalFields } from "@/app/admin/rooms/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { requireRole } from "@/lib/auth/guards";
import { managementRoles } from "@/lib/auth/roles";
import {
  formatEnumLabel,
  formatPkr,
  formatUnitRoomLabel,
  roomCleaningStatusLabels,
  roomCleaningStatusOptions,
  roomStatusOptions,
  type RoomCleaningStatus,
} from "@/lib/check-in/options";

export const metadata: Metadata = {
  title: "Units Admin",
};

type PageProps = {
  searchParams: Promise<{ message?: string }>;
};

function statusTone(status: string) {
  if (status === "active") {
    return "success";
  }
  if (status === "maintenance") {
    return "warning";
  }
  return "neutral";
}

function cleaningTone(status: RoomCleaningStatus) {
  if (status === "ready") {
    return "success";
  }

  if (status === "maintenance_blocked") {
    return "danger";
  }

  return "warning";
}

function cleaningActionLabel(status: RoomCleaningStatus) {
  if (status === "ready") {
    return "Mark Ready";
  }

  if (status === "cleaning_required") {
    return "Mark Cleaning Required";
  }

  if (status === "cleaning_in_progress") {
    return "Mark Cleaning In Progress";
  }

  return "Mark Maintenance Blocked";
}

export default async function AdminRoomsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { supabase } = await requireRole(managementRoles);
  const { data: rooms, error } = await supabase.from("rooms").select("*").order("unit_number", { nullsFirst: false });

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-xl border border-brand-sage bg-white/85 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-fresh">Operations</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold text-brand-deep">Units</h1>
            <p className="mt-2 text-sm text-slate-600">Edit operational status and base price for the 11 unit inventory.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin">Back to admin</Link>
          </Button>
        </header>

        {params.message ? (
          <div className="rounded-lg border border-brand-sage bg-brand-ivory p-4 text-sm text-brand-deep">{params.message}</div>
        ) : null}

        {error ? (
          <Card>
            <CardContent className="p-5 text-sm text-red-700">{error.message}</CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {(rooms ?? []).map((room) => (
              <Card key={room.id}>
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle>{formatUnitRoomLabel(room)}</CardTitle>
                      <CardDescription>
                        {formatEnumLabel(room.type)} - up to {room.max_guests} guests - {formatPkr(room.base_price_pkr)}
                        {room.unit_number === 8 ? " - Temporary mapping" : ""}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={statusTone(room.status)}>{formatEnumLabel(room.status)}</Badge>
                      <Badge tone={cleaningTone(room.cleaning_status)}>{roomCleaningStatusLabels[room.cleaning_status]}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((amenity) => (
                      <span key={amenity} className="rounded-lg bg-brand-sage/55 px-2.5 py-1 text-xs font-medium text-brand-deep">
                        {amenity}
                      </span>
                    ))}
                  </div>

                  <form action={updateRoomOperationalFields} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                    <input type="hidden" name="id" value={room.id} />
                    <div>
                      <label htmlFor={`base_price_${room.id}`} className="mb-2 block text-sm font-medium text-brand-deep">
                        Base price PKR
                      </label>
                      <Input id={`base_price_${room.id}`} name="base_price_pkr" type="number" min={0} defaultValue={room.base_price_pkr} />
                    </div>
                    <div>
                      <label htmlFor={`status_${room.id}`} className="mb-2 block text-sm font-medium text-brand-deep">
                        Status
                      </label>
                      <Select id={`status_${room.id}`} name="status" defaultValue={room.status}>
                        {roomStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <Button type="submit">Save</Button>
                  </form>

                  <div className="rounded-lg border border-brand-sage bg-brand-ivory p-4">
                    <p className="text-sm font-semibold text-brand-deep">Cleaning readiness</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Manual readiness state used by the Room Reality Board. This does not block room assignment.
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {roomCleaningStatusOptions.map((option) => (
                        <form key={option.value} action={updateRoomCleaningStatus}>
                          <input type="hidden" name="id" value={room.id} />
                          <input type="hidden" name="cleaning_status" value={option.value} />
                          <input type="hidden" name="return_to" value="/admin/rooms" />
                          <Button type="submit" size="sm" variant={option.value === room.cleaning_status ? "secondary" : "outline"} className="w-full justify-start">
                            {cleaningActionLabel(option.value)}
                          </Button>
                        </form>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
