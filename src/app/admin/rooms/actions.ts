"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { managementRoles } from "@/lib/auth/roles";
import { roomCleaningStatusLabels, roomCleaningStatusOptions, roomStatusOptions } from "@/lib/check-in/options";

const updateRoomSchema = z.object({
  id: z.uuid(),
  base_price_pkr: z.coerce.number().min(0),
  status: z.enum(roomStatusOptions.map((option) => option.value)),
});

const updateRoomCleaningStatusSchema = z.object({
  id: z.uuid(),
  cleaning_status: z.enum(roomCleaningStatusOptions.map((option) => option.value)),
  return_to: z.string().optional(),
});

function safeReturnTo(value: string | undefined) {
  if (value === "/admin/occupancy" || value === "/admin/rooms") {
    return value;
  }

  return "/admin/rooms";
}

function withMessage(path: string, message: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}message=${encodeURIComponent(message)}`;
}

export async function updateRoomOperationalFields(formData: FormData) {
  const { supabase } = await requireRole(managementRoles);
  const parsed = updateRoomSchema.safeParse({
    id: formData.get("id"),
    base_price_pkr: formData.get("base_price_pkr"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    redirect(`/admin/rooms?message=${encodeURIComponent("Invalid unit update.")}`);
  }

  const { id, base_price_pkr, status } = parsed.data;
  const { error } = await supabase.from("rooms").update({ base_price_pkr, status }).eq("id", id);

  if (error) {
    redirect(`/admin/rooms?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/rooms");
  redirect(`/admin/rooms?message=${encodeURIComponent("Unit updated.")}`);
}

export async function updateRoomCleaningStatus(formData: FormData) {
  const { supabase, profile } = await requireRole(managementRoles);
  const parsed = updateRoomCleaningStatusSchema.safeParse({
    id: formData.get("id"),
    cleaning_status: formData.get("cleaning_status"),
    return_to: formData.get("return_to")?.toString(),
  });

  if (!parsed.success) {
    redirect(`/admin/rooms?message=${encodeURIComponent("Invalid cleaning status update.")}`);
  }

  const { id, cleaning_status } = parsed.data;
  const returnTo = safeReturnTo(parsed.data.return_to);
  const { data: currentRoom, error: currentRoomError } = await supabase
    .from("rooms")
    .select("id,unit_number,name,cleaning_status")
    .eq("id", id)
    .single();

  if (currentRoomError || !currentRoom) {
    redirect(withMessage(returnTo, currentRoomError?.message ?? "Unit not found."));
  }

  const { error } = await supabase
    .from("rooms")
    .update({
      cleaning_status,
      cleaning_status_updated_at: new Date().toISOString(),
      cleaning_status_updated_by: profile.id,
    })
    .eq("id", id);

  if (error) {
    redirect(withMessage(returnTo, error.message));
  }

  await supabase.from("audit_logs").insert({
    actor_user_id: profile.id,
    action: "room_cleaning_status_updated",
    entity_type: "rooms",
    entity_id: id,
    metadata: {
      unit_number: currentRoom.unit_number,
      room_name: currentRoom.name,
      previous_cleaning_status: currentRoom.cleaning_status,
      cleaning_status,
    },
  });

  revalidatePath("/admin/rooms");
  revalidatePath("/admin/occupancy");
  revalidatePath("/admin");
  redirect(withMessage(returnTo, `Unit marked ${roomCleaningStatusLabels[cleaning_status]}.`));
}
