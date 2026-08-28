"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AdminPasswordField } from "@/components/dashboard/admin-password-field";
import { apiDelete, apiPut } from "@/lib/api/client";

// ============================================================
// BAJA / REACTIVACIÓN DE USUARIO (COMPARTIDO)
// Los usuarios NUNCA se eliminan físicamente: la baja es lógica
// y exige la contraseña del administrador. Compartido entre el
// listado (/users) y el detalle (/users/[PK_user]).
// ============================================================

export type DeactivateTarget = {
  PK_user: number;
  firstName: string;
  lastName: string;
  status: boolean;
};

export function DeactivateUserDialog({
  target,
  onClose,
}: {
  target: DeactivateTarget | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isDeactivating = Boolean(target?.status);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!target) throw new Error("Sin usuario seleccionado.");
      if (isDeactivating) {
        return apiDelete(`/api/dashboard/users/${target.PK_user}`, { adminPassword });
      }
      return apiPut(`/api/dashboard/users/${target.PK_user}`, {
        status: true,
        adminPassword,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["catalog", "users"] });
      onClose();
    },
    onError: (err: Error) => setError(err.message),
  });

  return (
    <Dialog
      open={target != null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isDeactivating ? "Dar de baja usuario" : "Reactivar usuario"}</DialogTitle>
          <DialogDescription>
            {target &&
              (isDeactivating ? (
                <>
                  El usuario <strong>{target.firstName} {target.lastName}</strong> perderá el
                  acceso al sistema. No se elimina físicamente: conserva su historial y puede
                  reactivarse.
                </>
              ) : (
                <>
                  Se restablecerá el acceso de{" "}
                  <strong>
                    {target.firstName} {target.lastName}
                  </strong>
                  .
                </>
              ))}
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            mutation.mutate();
          }}
        >
          <AdminPasswordField value={adminPassword} onChange={setAdminPassword} error={error} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant={isDeactivating ? "destructive" : "default"}
              disabled={mutation.isPending || !adminPassword}
            >
              {mutation.isPending
                ? "Procesando..."
                : isDeactivating
                  ? "Dar de baja"
                  : "Reactivar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
