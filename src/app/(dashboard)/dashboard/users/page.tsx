"use client";

import { UsersList } from "@/components/dashboard/users-list";

// Usuarios del sistema: operadores de la Central y de instituciones.
// Solo la Central GAMC los administra; toda acción exige su contraseña.
export default function UsersPage() {
  return <UsersList />;
}
