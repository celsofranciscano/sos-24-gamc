import { crudDelete, crudGetById, crudUpdate } from "@/lib/api/crud-factory";
import { unitsCrud } from "@/lib/api/catalogs";

export const GET = crudGetById(unitsCrud);
export const PUT = crudUpdate(unitsCrud);
export const DELETE = crudDelete(unitsCrud);
