import { crudCreate, crudList } from "@/lib/api/crud-factory";
import { institutionTypesCrud } from "@/lib/api/catalogs";

export const GET = crudList(institutionTypesCrud);
export const POST = crudCreate(institutionTypesCrud);
