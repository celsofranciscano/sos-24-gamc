import { crudDelete, crudGetById, crudUpdate } from "@/lib/api/crud-factory";
import { subinstitutionsCrud } from "@/lib/api/catalogs";

export const GET = crudGetById(subinstitutionsCrud);
export const PUT = crudUpdate(subinstitutionsCrud);
export const DELETE = crudDelete(subinstitutionsCrud);
