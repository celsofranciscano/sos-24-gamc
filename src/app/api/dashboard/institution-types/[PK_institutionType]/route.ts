import { crudDelete, crudGetById, crudUpdate } from "@/lib/api/crud-factory";
import { institutionTypesCrud } from "@/lib/api/catalogs";

export const GET = crudGetById(institutionTypesCrud);
export const PUT = crudUpdate(institutionTypesCrud);
export const DELETE = crudDelete(institutionTypesCrud);
