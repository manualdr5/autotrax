-- ================================================================
-- AutoTrax Vehicle Maintenance Database
-- Supabase / PostgreSQL Schema + Seed Data
-- ================================================================

-- Table: vehicle_schedules
-- One row per Year / Make / Model / Trim combination.
-- The `maintenance` column is JSONB — an array of mileage intervals,
-- each containing the list of service items due at that mileage.
-- ================================================================
CREATE TABLE IF NOT EXISTS vehicle_schedules (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  year        integer     NOT NULL,
  make        text        NOT NULL,
  model       text        NOT NULL,
  trim        text        NOT NULL,
  maintenance jsonb       NOT NULL DEFAULT '[]'::jsonb,
  source      text        NOT NULL DEFAULT 'vehicledatabases.com',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vehicle_schedules_ymmt_unique UNIQUE (year, make, model, trim)
);

-- Index for fast YMMT lookups (used by the app on every schedule fetch)
CREATE INDEX IF NOT EXISTS idx_vehicle_schedules_ymmt
  ON vehicle_schedules (make, model, year, trim);

-- Index for dropdown population (make/model list)
CREATE INDEX IF NOT EXISTS idx_vehicle_schedules_make_model
  ON vehicle_schedules (make, model);

-- Auto-update updated_at on any row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_vehicle_schedules_updated_at ON vehicle_schedules;
CREATE TRIGGER trg_vehicle_schedules_updated_at
  BEFORE UPDATE ON vehicle_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- Row Level Security
-- Anon/public key can only READ. Writes require service_role.
-- ================================================================
ALTER TABLE vehicle_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vehicle_schedules_public_read" ON vehicle_schedules;
CREATE POLICY "vehicle_schedules_public_read"
  ON vehicle_schedules FOR SELECT
  TO anon, authenticated
  USING (true);

-- ================================================================
-- Seed Data: Lexus LS 430 (2001–2006)
-- Trim: Base 4dr Sedan Automatic
-- Source: vehicledatabases.com OEM maintenance schedule
-- 35 mileage intervals from 5,000 to 120,000 miles
-- ================================================================
INSERT INTO vehicle_schedules (year, make, model, trim, maintenance)
SELECT
  y,
  'Lexus',
  'LS 430',
  'Base 4dr Sedan Automatic',
  $MAINT$[
    {"mileage":{"miles":5000,"km":8000},"service_items":["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Linings","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Lubricate Driveshaft/Propeller Shaft","Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"]},
    {"mileage":{"miles":7500,"km":12000},"service_items":["Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"]},
    {"mileage":{"miles":10000,"km":16100},"service_items":["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Linings","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Lubricate Driveshaft/Propeller Shaft","Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"]},
    {"mileage":{"miles":15000,"km":24100},"service_items":["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Linings","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Lubricate Driveshaft/Propeller Shaft","Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires","Replace Cabin Air Filter"]},
    {"mileage":{"miles":20000,"km":32200},"service_items":["Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"]},
    {"mileage":{"miles":22500,"km":36200},"service_items":["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Linings","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Lubricate Driveshaft/Propeller Shaft","Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires","Replace Cabin Air Filter"]},
    {"mileage":{"miles":25000,"km":40200},"service_items":["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Linings","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Lubricate Driveshaft/Propeller Shaft","Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"]},
    {"mileage":{"miles":30000,"km":48300},"service_items":["Inspect Automatic Transmission Fluid","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Lines & Cables","Inspect Brake Linings","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Evaporative Emission System","Inspect Exhaust Pipes & Mounts","Inspect Fuel System","Inspect Fuel Tank Cap Gasket","Inspect Steering Linkage & Boots","Lubricate Driveshaft/Propeller Shaft","Replace Air Cleaner/Element","Replace Cabin Air Filter","Replace Differential Fluid Standard","Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"]},
    {"mileage":{"miles":35000,"km":56300},"service_items":["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Linings","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Lubricate Driveshaft/Propeller Shaft","Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"]},
    {"mileage":{"miles":37500,"km":60400},"service_items":["Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"]},
    {"mileage":{"miles":40000,"km":64400},"service_items":["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Linings","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Lubricate Driveshaft/Propeller Shaft","Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"]},
    {"mileage":{"miles":45000,"km":72400},"service_items":["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Linings","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Lubricate Driveshaft/Propeller Shaft","Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires","Replace Cabin Air Filter"]},
    {"mileage":{"miles":47500,"km":76400},"service_items":["Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"]},
    {"mileage":{"miles":50000,"km":80500},"service_items":["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Linings","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Lubricate Driveshaft/Propeller Shaft","Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"]},
    {"mileage":{"miles":55000,"km":88500},"service_items":["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Linings","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Lubricate Driveshaft/Propeller Shaft","Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"]},
    {"mileage":{"miles":57500,"km":92500},"service_items":["Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"]},
    {"mileage":{"miles":60000,"km":96600},"service_items":["Inspect Automatic Transmission Fluid","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Lines & Cables","Inspect Brake Linings","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Evaporative Emission System","Inspect Exhaust Pipes & Mounts","Inspect Fuel System","Inspect Fuel Tank Cap Gasket","Inspect Steering Linkage & Boots","Lubricate Driveshaft/Propeller Shaft","Replace Air Cleaner/Element","Replace Cabin Air Filter","Replace Differential Fluid Standard","Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires","Replace Automatic Transmission Fluid","Replace Brake Fluid"]},
    {"mileage":{"miles":65000,"km":104600},"service_items":["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Linings","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Lubricate Driveshaft/Propeller Shaft","Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"]},
    {"mileage":{"miles":67500,"km":108600},"service_items":["Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"]},
    {"mileage":{"miles":70000,"km":112700},"service_items":["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Linings","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Lubricate Driveshaft/Propeller Shaft","Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"]},
    {"mileage":{"miles":75000,"km":120700},"service_items":["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Linings","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Lubricate Driveshaft/Propeller Shaft","Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires","Replace Cabin Air Filter"]},
    {"mileage":{"miles":77500,"km":124700},"service_items":["Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"]},
    {"mileage":{"miles":80000,"km":128700},"service_items":["Inspect Automatic Transmission Fluid","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Cables & Lines","Inspect Brake Linings","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Exhaust Pipes & Mounts","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Differential Fluid Standard","Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"]},
    {"mileage":{"miles":85000,"km":136800},"service_items":["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Linings","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Lubricate Driveshaft/Propeller Shaft","Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"]},
    {"mileage":{"miles":87500,"km":140800},"service_items":["Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"]},
    {"mileage":{"miles":90000,"km":144800},"service_items":["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Linings","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Lubricate Driveshaft/Propeller Shaft","Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"]},
    {"mileage":{"miles":95000,"km":152900},"service_items":["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Linings","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Lubricate Driveshaft/Propeller Shaft","Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"]},
    {"mileage":{"miles":97500,"km":156900},"service_items":["Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"]},
    {"mileage":{"miles":100000,"km":160900},"service_items":["Inspect Automatic Transmission Fluid","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Lines & Cables","Inspect Brake Linings","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Evaporative Emission System","Inspect Exhaust Pipes & Mounts","Inspect Fuel System","Inspect Fuel Tank Cap Gasket","Inspect Steering Linkage & Boots","Lubricate Driveshaft/Propeller Shaft","Replace Air Cleaner/Element","Replace Cabin Air Filter","Replace Differential Fluid Standard","Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires","Replace Automatic Transmission Fluid","Replace Brake Fluid"]},
    {"mileage":{"miles":105000,"km":169000},"service_items":["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Linings","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Lubricate Driveshaft/Propeller Shaft","Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires","Replace Cabin Air Filter"]},
    {"mileage":{"miles":107500,"km":173000},"service_items":["Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"]},
    {"mileage":{"miles":110000,"km":177000},"service_items":["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Linings","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Lubricate Driveshaft/Propeller Shaft","Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"]},
    {"mileage":{"miles":115000,"km":185100},"service_items":["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Linings","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Lubricate Driveshaft/Propeller Shaft","Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"]},
    {"mileage":{"miles":117500,"km":189100},"service_items":["Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"]},
    {"mileage":{"miles":120000,"km":193100},"service_items":["Inspect Automatic Transmission Fluid","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Lines & Cables","Inspect Brake Linings","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Evaporative Emission System","Inspect Exhaust Pipes & Mounts","Inspect Fuel System","Inspect Fuel Tank Cap Gasket","Inspect Steering Linkage & Boots","Lubricate Driveshaft/Propeller Shaft","Replace Air Cleaner/Element","Replace Cabin Air Filter","Replace Differential Fluid Standard","Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires","Replace Automatic Transmission Fluid","Replace Brake Fluid","Replace Engine Coolant","Inspect Drive Belts","Inspect Rack And Pinion Assembly"]}
  ]$MAINT$::jsonb
FROM generate_series(2001, 2006) AS y
ON CONFLICT (year, make, model, trim) DO UPDATE
  SET maintenance = EXCLUDED.maintenance,
      updated_at  = now();

-- Verify: should return 6 rows
SELECT year, make, model, trim, jsonb_array_length(maintenance) AS intervals
FROM vehicle_schedules
ORDER BY year;
