import { crudDelete, crudGetById, crudUpdate } from "@/lib/api/crud-factory";
import { resourceTypesCrud } from "@/lib/api/catalogs";

export const GET = crudGetById(resourceTypesCrud);
export const PUT = crudUpdate(resourceTypesCrud);
export const DELETE = crudDelete(resourceTypesCrud);
