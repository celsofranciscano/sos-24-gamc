import { crudCreate, crudList } from "@/lib/api/crud-factory";
import { resourceTypesCrud } from "@/lib/api/catalogs";

export const GET = crudList(resourceTypesCrud);
export const POST = crudCreate(resourceTypesCrud);
