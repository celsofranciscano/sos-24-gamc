import bcrypt from "bcrypt";
import prisma from "@/lib/db/prisma";
import { ApiError, requireCentral, type DashboardSession } from "@/lib/api/helpers";

// ============================================================
// CONFIRMACIÓN DE SEGURIDAD POR CONTRASEÑA (STEP-UP AUTH)
// Las acciones sensibles de gestión de usuarios y privilegios
// (crear, editar, cambiar privilegios, dar de baja) exigen que
// el administrador de la Central confirme SU PROPIA contraseña.
// ============================================================

/**
 * Verifica que quien ejecuta la acción sea de la Central GAMC y que
 * la contraseña ingresada coincida con la de SU cuenta en base de datos.
 */
export async function verifyAdminPassword(adminPassword: unknown): Promise<DashboardSession> {
  const session = await requireCentral();

  if (typeof adminPassword !== "string" || adminPassword.length === 0) {
    throw new ApiError(
      400,
      "Debe ingresar su contraseña de administrador para confirmar esta acción.",
    );
  }

  const admin = await prisma.tbusers.findUnique({
    where: { PK_user: session.userId },
    select: { password: true, status: true },
  });

  if (!admin || !admin.status || !(await bcrypt.compare(adminPassword, admin.password))) {
    throw new ApiError(401, "Contraseña de administrador incorrecta.");
  }

  return session;
}

type UserRelationsInput = {
  FK_privilege: number;
  FK_institution?: number | null;
  FK_subinstitution?: number | null;
};

type UserRelationsResolved = {
  privilegeCode: string;
  privilegeName: string;
  privilegeType: string;
  FK_institution: number | null;
  FK_subinstitution: number | null;
};

/**
 * Valida la coherencia privilegio ↔ institución:
 * - Privilegios GAMC → siempre sin institución ni dependencia.
 * - Privilegios INSTITUTION → exigen institución; la dependencia,
 *   si se indica, debe pertenecer a esa institución.
 */
export async function resolveUserRelations(
  input: UserRelationsInput,
): Promise<UserRelationsResolved> {
  const privilege = await prisma.tbprivileges.findUnique({
    where: { PK_privilege: input.FK_privilege },
  });
  if (!privilege) throw new ApiError(400, "El privilegio seleccionado no existe.");

  let institution: number | null = input.FK_institution ?? null;
  let subinstitution: number | null = input.FK_subinstitution ?? null;

  if (privilege.privilegeType === "GAMC") {
    institution = null;
    subinstitution = null;
  } else {
    if (institution == null) {
      throw new ApiError(400, "Los usuarios institucionales requieren una institución.");
    }
    if (subinstitution != null) {
      const sub = await prisma.tbsubinstitutions.findUnique({
        where: { PK_subinstitution: subinstitution },
        select: { FK_institution: true },
      });
      if (!sub || sub.FK_institution !== institution) {
        throw new ApiError(400, "La dependencia no pertenece a la institución seleccionada.");
      }
    }
  }

  return {
    privilegeCode: privilege.privilegeCode,
    privilegeName: privilege.privilege,
    privilegeType: privilege.privilegeType,
    FK_institution: institution,
    FK_subinstitution: subinstitution,
  };
}

/**
 * Garantiza que nunca se deje al sistema sin un CENTRAL_ADMIN activo.
 * Se invoca antes de desactivar a un usuario o cambiarle el privilegio.
 */
export async function assertNotLastCentralAdmin(
  currentUserId: number,
  currentUserPrivilegeCode: string,
  nextPrivilegeCode: string,
  nextStatus: boolean,
): Promise<void> {
  // Solo protege si el usuario afectado es hoy un administrador central activo
  // y la acción lo dejaría de ser (por cambio de rol o por baja).
  if (currentUserPrivilegeCode !== "CENTRAL_ADMIN") return;
  if (nextPrivilegeCode === "CENTRAL_ADMIN" && nextStatus) return;

  const others = await prisma.tbusers.count({
    where: {
      PK_user: { not: currentUserId },
      status: true,
      tbprivileges: { privilegeCode: "CENTRAL_ADMIN" },
    },
  });

  if (others === 0) {
    throw new ApiError(
      409,
      "No se puede realizar la acción: es el último administrador central activo. Primero asigne el rol a otro usuario.",
    );
  }
}
