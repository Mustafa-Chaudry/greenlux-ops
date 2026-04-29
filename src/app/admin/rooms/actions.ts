"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { managementRoles } from "@/lib/auth/roles";
import { roomStatusOptions } from "@/lib/check-in/options";

const updateRoomSchema = z.object({
  id: z.uuid(),
  base_price_pkr: z.coerce.number().min(0),
  status: z.enum(roomStatusOptions.map((option) => option.value)),
});

export async function updateRoomOperationalFields(formData: FormData) {
  const { supabase } = await requireRole(managementRoles);
  const parsed = updateRoomSchema.safeParse({
    id: formData.get("id"),
    base_price_pkr: formData.get("base_price_pkr"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    redirect(`/admin/rooms?message=${encodeURIComponent("Invalid room update.")}`);
  }

  const { id, base_price_pkr, status } = parsed.data;
  const { error } = await supabase.from("rooms").update({ base_price_pkr, status }).eq("id", id);

  if (error) {
    redirect(`/admin/rooms?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/rooms");
  redirect(`/admin/rooms?message=${encodeURIComponent("Room updated.")}`);
}

