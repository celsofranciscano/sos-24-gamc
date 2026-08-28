import { crudCreate, crudList } from "@/lib/api/crud-factory";
import { institutionsCrud } from "@/lib/api/catalogs";

export const GET = crudList(institutionsCrud);
export const POST = crudCreate(institutionsCrud);
