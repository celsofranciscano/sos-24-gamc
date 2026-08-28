"use client";

import { use } from "react";
import { PrivilegeFormPage } from "@/components/dashboard/privilege-form-page";

// /privileges/[PK_privilege]/edit → edición dentro del parámetro dinámico exacto.
export default function EditPrivilegesPage({
  params,
}: {
  params: Promise<{ PK_privilege: string }>;
}) {
  const { PK_privilege } = use(params);
  return <PrivilegeFormPage privilegeId={Number(PK_privilege)} />;
}
