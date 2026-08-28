import { crudCreate, crudList } from "@/lib/api/crud-factory";
import { emergencyTypesCrud } from "@/lib/api/catalogs";

export const GET = crudList(emergencyTypesCrud);
export const POST = crudCreate(emergencyTypesCrud);
