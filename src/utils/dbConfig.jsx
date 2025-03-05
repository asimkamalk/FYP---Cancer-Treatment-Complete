import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
const sql = neon(
  "postgresql://cancer_treatment_owner:npg_8X4ZuOwmfHhG@ep-polished-field-a577e338.us-east-2.aws.neon.tech/cancer_treatment?sslmode=require"
);
export const db = drizzle(sql, { schema });
