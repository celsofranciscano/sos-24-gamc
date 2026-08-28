import { crudDelete, crudGetById, crudUpdate } from "@/lib/api/crud-factory";
import { emergencyTypesCrud } from "@/lib/api/catalogs";

export const GET = crudGetById(emergencyTypesCrud);
export const PUT = crudUpdate(emergencyTypesCrud);
export const DELETE = crudDelete(emergencyTypesCrud);
