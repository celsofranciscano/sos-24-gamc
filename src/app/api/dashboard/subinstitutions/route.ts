import { crudCreate, crudList } from "@/lib/api/crud-factory";
import { subinstitutionsCrud } from "@/lib/api/catalogs";

export const GET = crudList(subinstitutionsCrud);
export const POST = crudCreate(subinstitutionsCrud);
