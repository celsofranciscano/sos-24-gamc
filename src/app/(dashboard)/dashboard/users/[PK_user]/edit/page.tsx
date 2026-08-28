"use client";

import { use } from "react";
import { UserFormPage } from "@/components/dashboard/user-form-page";

// /users/[PK_user]/edit → edición dentro del parámetro dinámico exacto.
export default function EditUsersPage({
  params,
}: {
  params: Promise<{ PK_user: string }>;
}) {
  const { PK_user } = use(params);
  return <UserFormPage userId={Number(PK_user)} />;
}
