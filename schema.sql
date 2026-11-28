CREATE TABLE IF NOT EXISTS pets (
  id TEXT PRIMARY KEY,
  passport_uuid TEXT NOT NULL UNIQUE,
  pet_name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  weight_kg REAL,
  allergies TEXT,
  owner_name TEXT NOT NULL,
  owner_phone_sa TEXT NOT NULL,
  boarding_status TEXT DEFAULT 'none',
  boarding_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vaccinations (
  id TEXT PRIMARY KEY,
  pet_id TEXT NOT NULL,
  vaccine_name TEXT NOT NULL,
  administered_date TEXT NOT NULL,
  next_due_date TEXT NOT NULL,
  reminder_sent INTEGER DEFAULT 0,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS medical_records (
  id TEXT PRIMARY KEY,
  pet_id TEXT NOT NULL,
  record_type TEXT NOT NULL, -- 'visit', 'xray_summary', 'lab_summary', 'prescription'
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  prescription_notes TEXT,
  show_in_passport INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);

-- Step 2: consultation + estimate (new tables; existing tables unchanged)
CREATE TABLE IF NOT EXISTS visits (
  id TEXT PRIMARY KEY,
  pet_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting', -- waiting | with_vet | lab | ready
  reason TEXT,
  exam_notes TEXT,
  arrived_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS estimates (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL,
  public_uuid TEXT NOT NULL UNIQUE,    -- crypto.randomUUID(), used in the public estimate link
  options_json TEXT NOT NULL,          -- basic / standard / full: service lines + total (SAR)
  status TEXT NOT NULL DEFAULT 'sent', -- sent | approved
  approved_option TEXT,                -- basic | standard | full
  approved_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE
);
