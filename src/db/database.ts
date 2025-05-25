import { PGliteWorker } from "@electric-sql/pglite/worker";

let pg: PGliteWorker | null = null;
let syncChannel: BroadcastChannel | null = null;
let isInitialized = false;
const subscribers: Set<() => void> = new Set();

async function ensureDatabaseInitialized() {
  if (!isInitialized) {
    const workerInstance = new Worker(
      new URL("./pglite-worker.ts", import.meta.url),
      {
        type: "module",
      }
    );

    pg = await PGliteWorker.create(workerInstance, {
      dataDir: "idb://pRegistry",
    });
    await pg.waitReady;
    if (typeof BroadcastChannel !== "undefined") {
      syncChannel = new BroadcastChannel("pRegistry-sync");
      syncChannel.onmessage = (event) => {
        if (event.data.type === "invalidate") {
          subscribers.forEach((callback) => callback());
        }
      };
    }

    isInitialized = true;
  }
  return pg;
}

export function subscribeToUpdates(callback: () => void): () => void {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

export async function executeQuery<T = unknown>(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<T[]> {
  const db = await ensureDatabaseInitialized();
  if (!db) throw new Error("Database not initialized");

  const result = await db.query<T>(sql, params);

  if (isWriteOperation(sql)) {
    syncChannel?.postMessage({
      type: "invalidate",
      timestamp: Date.now(),
    });

    subscribers.forEach((callback) => callback());
  }

  return result.rows as T[];
}

function isWriteOperation(sql: string): boolean {
  const firstWord = sql.trim().split(/\s+/)[0].toUpperCase();
  return [
    "INSERT",
    "UPDATE",
    "DELETE",
    "CREATE",
    "ALTER",
    "DROP",
    "TRUNCATE",
  ].includes(firstWord);
}

export async function addPatient(patient: {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  city: string;
  state: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  insurance?: string;
  policyNumber?: string;
  medicalHistory?: string;
}): Promise<string> {
  const id = crypto.randomUUID();
  console.log("patient", patient);
  const result = await executeQuery(
    `INSERT INTO patients (
      id, first_name, last_name, dob, gender, blood_group,city,state,country,
      address, phone, email, insurance, policy_number, medical_history
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,$13, $14, $15 )`,
    [
      id,
      patient.firstName,
      patient.lastName,
      patient.dob,
      patient.gender,
      patient.bloodGroup,
      patient.city,
      patient.state,
      patient.country,
      patient.address,
      patient.phone,
      patient.email,
      patient.insurance || null,
      patient.policyNumber || null,
      patient.medicalHistory || null,
    ]
  );
  console.log("result after inserting", result);
  return id;
}

export async function getPatients(): Promise<Patient[]> {
  const result = await executeQuery<Patient>(
    `SELECT 
      id, 
      first_name, 
      last_name, 
      dob, 
      gender, 
      blood_group, 
      city,
      state,
      country,
      phone, 
      email,
      address,
      insurance,
      policy_number,
      medical_history,
      created_at
    FROM patients 
    ORDER BY created_at DESC`
  );
  return result;
}

export async function getPatientById(id: string): Promise<Patient | null> {
  const result = await executeQuery<Patient>(
    `SELECT * FROM patients WHERE id = $1 LIMIT 1`,
    [id]
  );
  return result[0] || null;
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  dob: string;
  gender: string;
  blood_group: string;
  city: string;
  state: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  insurance?: string;
  policy_number?: string;
  medical_history?: string;
  created_at?: string;
}
