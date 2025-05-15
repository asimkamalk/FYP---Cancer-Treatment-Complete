import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
const sql = neon(
  "postgresql://beat_cancer_owner:npg_DXE7GrRyc0Ln@ep-purple-forest-a4zjsekq.us-east-1.aws.neon.tech/beat_cancer?sslmode=require"
);
export const db = drizzle(sql, { schema });
