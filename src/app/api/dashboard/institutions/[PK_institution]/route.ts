import { crudDelete, crudGetById, crudUpdate } from "@/lib/api/crud-factory";
import { institutionsCrud } from "@/lib/api/catalogs";

export const GET = crudGetById(institutionsCrud);
export const PUT = crudUpdate(institutionsCrud);
export const DELETE = crudDelete(institutionsCrud);
