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
  performed_json TEXT,                 -- Step 3: service ids the vet recorded as done, e.g. ["exam","xray"]
  invoice_closed_at TEXT,              -- Step 3: empty = invoice still open
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

-- Step 3: charge guard (new table). Compared against visits.performed_json before the invoice is closed.
-- NOTE for the EXISTING D1 database: `visits` was already created in Step 2, so CREATE IF NOT EXISTS skips it.
-- Run these two lines ONCE in the D1 Console (do not put them in a re-runnable file):
--   ALTER TABLE visits ADD COLUMN performed_json TEXT;
--   ALTER TABLE visits ADD COLUMN invoice_closed_at TEXT;
CREATE TABLE IF NOT EXISTS invoice_items (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL,
  service_id TEXT NOT NULL,            -- exam | lab | xray | injection | vaccine (ids in src/services.js)
  qty INTEGER NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL,            -- SAR at billing time
  added_by_guard INTEGER DEFAULT 0,    -- 1 = line was added after the guard flagged it missing
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE
);
