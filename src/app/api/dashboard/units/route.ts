import { crudCreate, crudList } from "@/lib/api/crud-factory";
import { unitsCrud } from "@/lib/api/catalogs";

export const GET = crudList(unitsCrud);
export const POST = crudCreate(unitsCrud);
