import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type UnitAssignmentConflict = {
  id: string;
  full_name: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
};

export async function findUnitAssignmentConflict(
  supabase: SupabaseServerClient,
  {
    assignedRoomId,
    checkInDate,
    checkOutDate,
    excludeCheckinId,
  }: {
    assignedRoomId: string;
    checkInDate: string;
    checkOutDate: string;
    excludeCheckinId?: string;
  },
) {
  let query = supabase
    .from("guest_checkins")
    .select("id,full_name,check_in_date,check_out_date,status")
    .eq("assigned_room_id", assignedRoomId)
    .neq("status", "checked_out")
    .lt("check_in_date", checkOutDate)
    .gt("check_out_date", checkInDate)
    .limit(1);

  if (excludeCheckinId) {
    query = query.neq("id", excludeCheckinId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as UnitAssignmentConflict | null;
}

export function formatUnitConflictMessage(conflict: UnitAssignmentConflict) {
  return `Unit is already assigned to ${conflict.full_name} from ${conflict.check_in_date} to ${conflict.check_out_date}.`;
}
