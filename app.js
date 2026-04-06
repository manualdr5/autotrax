const { useState, useMemo, useEffect, useCallback, useRef } = React;

// ─── LOCAL VEHICLE DATABASE ───────────────────────────────────────
// Maintenance schedule for Lexus LS 430 (2001-2006), sourced from
// vehicledatabases.com OEM data. 2001-2002 use placeholder schedule;
// 2003-2006 use real OEM data fetched April 2026.
const LS430_DB = (function() {
  function mi(miles, km, items) { return { mileage: { miles, km }, service_items: items }; }

  // 2001-2002 placeholder schedule (real data pending)
  const A = ["Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"];
  const B = ["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Linings","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Lubricate Driveshaft/Propeller Shaft","Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"];
  const C = [...B,"Replace Cabin Air Filter"];
  const D30 = ["Inspect Automatic Transmission Fluid","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Lines & Cables","Inspect Brake Linings","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Evaporative Emission System","Inspect Exhaust Pipes & Mounts","Inspect Fuel System","Inspect Fuel Tank Cap Gasket","Inspect Steering Linkage & Boots","Lubricate Driveshaft/Propeller Shaft","Replace Air Cleaner/Element","Replace Cabin Air Filter","Replace Differential Fluid Standard","Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"];
  const D60 = [...D30,"Replace Automatic Transmission Fluid","Replace Brake Fluid"];
  const E80 = ["Inspect Automatic Transmission Fluid","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Cables & Lines","Inspect Brake Linings","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Exhaust Pipes & Mounts","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Differential Fluid Standard","Replace Engine Oil","Replace Engine Oil Filter","Road-Test Vehicle","Rotate Tires"];
  const D120 = [...D60,"Replace Engine Coolant","Inspect Drive Belts","Inspect Rack And Pinion Assembly"];
  const SCHED = { maintenance: [
    mi(5000,8000,B),   mi(7500,12000,A),  mi(10000,16100,B), mi(15000,24100,C),
    mi(20000,32200,A), mi(22500,36200,C), mi(25000,40200,B), mi(30000,48300,D30),
    mi(35000,56300,B), mi(37500,60400,A), mi(40000,64400,B), mi(45000,72400,C),
    mi(47500,76400,A), mi(50000,80500,B), mi(55000,88500,B), mi(57500,92500,A),
    mi(60000,96600,D60),mi(65000,104600,B),mi(67500,108600,A),mi(70000,112700,B),
    mi(75000,120700,C),mi(77500,124700,A),mi(80000,128700,E80),mi(85000,136800,B),
    mi(87500,140800,A),mi(90000,144800,B),mi(95000,152900,B),mi(97500,156900,A),
    mi(100000,160900,D60),mi(105000,169000,C),mi(107500,173000,A),
    mi(110000,177000,B),mi(115000,185100,B),mi(117500,189100,A),mi(120000,193100,D120),
  ]};

  // Real OEM data — 2003
  const SCHED_2003 = { maintenance: [
    mi(5000,8000,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(7500,12000,["Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(10000,16000,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(15000,24100,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Exhaust Pipes & Mounts","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Cabin Air Filter","Replace Differential Fluid Standard","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(20000,32100,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(22500,36200,["Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(25000,40200,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(30000,48200,["Inspect Automatic Transmission Fluid","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Exhaust Pipes & Mounts","Inspect Fuel Line Connections","Inspect Fuel Tank Band","Inspect Fuel Tank Cap Gasket","Inspect Fuel Tank Vapor Vent Hoses","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Replace Air Cleaner/Element","Replace Brake Fluid","Replace Cabin Air Filter","Replace Differential Fluid Standard","Replace Engine Coolant","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(35000,56300,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(37500,60300,["Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(40000,64300,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(45000,72400,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Exhaust Pipes & Mounts","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Replace Cabin Air Filter","Replace Differential Fluid Standard","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(50000,80400,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(52500,84400,["Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(55000,88500,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(60000,96500,["Inspect Automatic Transmission Fluid","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Exhaust Pipes & Mounts","Inspect Fuel Line Connections","Inspect Fuel Tank Band","Inspect Fuel Tank Cap Gasket","Inspect Fuel Tank Vapor Vent Hoses","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Inspect Valve Clearance","Replace Air Cleaner/Element","Replace Automatic Transmission Fluid","Replace Brake Fluid","Replace Cabin Air Filter","Replace Differential Fluid Standard","Replace Engine Coolant","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(65000,104600,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(67500,108600,["Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(70000,112600,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(75000,120700,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Exhaust Pipes & Mounts","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Cabin Air Filter","Replace Differential Fluid Standard","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(80000,128700,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(82500,132700,["Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(85000,136700,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(90000,144800,["Inspect Automatic Transmission Fluid","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Exhaust Pipes & Mounts","Inspect Fuel Line Connections","Inspect Fuel Tank Band","Inspect Fuel Tank Cap Gasket","Inspect Fuel Tank Vapor Vent Hoses","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Replace Air Cleaner/Element","Replace Brake Fluid","Replace Cabin Air Filter","Replace Differential Fluid Standard","Replace Engine Coolant","Replace Engine Oil","Replace Engine Oil Filter","Replace Timing Belt","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(95000,152800,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(97500,156900,["Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(100000,160900,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(105000,168900,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Exhaust Pipes & Mounts","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Replace Cabin Air Filter","Replace Differential Fluid Standard","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(110000,177000,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(112500,181000,["Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(115000,185000,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(120000,193100,["Inspect Automatic Transmission Fluid","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Exhaust Pipes & Mounts","Inspect Fuel Line Connections","Inspect Fuel Tank Band","Inspect Fuel Tank Cap Gasket","Inspect Fuel Tank Vapor Vent Hoses","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Inspect Valve Clearance","Replace Air Cleaner/Element","Replace Automatic Transmission Fluid","Replace Brake Fluid","Replace Cabin Air Filter","Replace Differential Fluid Standard","Replace Engine Coolant","Replace Engine Oil","Replace Engine Oil Filter","Replace Spark Plugs","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(125000,201100,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(127500,205100,["Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(130000,209200,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(135000,217200,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Exhaust Pipes & Mounts","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Differential Fluid Standard","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(140000,225300,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(142500,229300,["Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(145000,233300,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(150000,241400,["Inspect Automatic Transmission Fluid","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Exhaust Pipes & Mounts","Inspect Fuel Line Connections","Inspect Fuel Tank Band","Inspect Fuel Tank Cap Gasket","Inspect Fuel Tank Vapor Vent Hoses","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Replace Air Cleaner/Element","Replace Brake Fluid","Replace Cabin Air Filter","Replace Differential Fluid Standard","Replace Engine Coolant","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
  ]};

  // Real OEM data — 2004
  const SCHED_2004 = { maintenance: [
    mi(5000,8000,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(10000,16000,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(15000,24100,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(20000,32100,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(25000,40200,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(30000,48200,["Inspect Automatic Transmission Fluid","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Fuel Line Connections","Inspect Fuel Tank Band","Inspect Fuel Tank Cap Gasket","Inspect Fuel Tank Vapor Vent Hoses","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Replace Air Cleaner/Element","Replace Brake Fluid","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(35000,56300,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(40000,64300,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(45000,72400,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(50000,80400,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(55000,88500,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(60000,96500,["Inspect Automatic Transmission Fluid","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Fuel Line Connections","Inspect Fuel Tank Band","Inspect Fuel Tank Cap Gasket","Inspect Fuel Tank Vapor Vent Hoses","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Inspect Valve Clearance","Replace Air Cleaner/Element","Replace Automatic Transmission Fluid","Replace Brake Fluid","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(65000,104600,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(70000,112600,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(75000,120700,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(80000,128700,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(85000,136700,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(90000,144800,["Inspect Automatic Transmission Fluid","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Fuel Line Connections","Inspect Fuel Tank Band","Inspect Fuel Tank Cap Gasket","Inspect Fuel Tank Vapor Vent Hoses","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Replace Air Cleaner/Element","Replace Brake Fluid","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Replace Timing Belt","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(95000,152800,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(100000,160900,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Cabin Air Filter","Replace Engine Coolant","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(105000,168900,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(110000,177000,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(115000,185000,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Engine Coolant","Inspect Steering Linkage & Boots","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(120000,193100,["Inspect Automatic Transmission Fluid","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Fuel Line Connections","Inspect Fuel Tank Band","Inspect Fuel Tank Cap Gasket","Inspect Fuel Tank Vapor Vent Hoses","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Inspect Valve Clearance","Replace Air Cleaner/Element","Replace Automatic Transmission Fluid","Replace Brake Fluid","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Replace Spark Plugs","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(125000,201100,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(130000,209200,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(135000,217200,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Hoses & Lines","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(140000,225300,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(145000,233300,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(150000,241400,["Inspect Automatic Transmission Fluid","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Fuel Line Connections","Inspect Fuel Tank Band","Inspect Fuel Tank Cap Gasket","Inspect Fuel Tank Vapor Vent Hoses","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Replace Air Cleaner/Element","Replace Brake Fluid","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
  ]};

  // Real OEM data — 2005
  const SCHED_2005 = { maintenance: [
    mi(5000,8000,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(10000,16000,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(15000,24100,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(20000,32100,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(25000,40200,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(30000,48200,["Inspect Automatic Transmission Fluid","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Fuel Line Connections","Inspect Fuel Tank Band","Inspect Fuel Tank Cap Gasket","Inspect Fuel Tank Vapor Vent Hoses","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Air Cleaner/Element","Replace Brake Fluid","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(35000,56300,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(40000,64300,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(45000,72400,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(50000,80400,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(55000,88500,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(60000,96500,["Inspect Automatic Transmission Fluid","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Fuel Line Connections","Inspect Fuel Tank Band","Inspect Fuel Tank Cap Gasket","Inspect Fuel Tank Vapor Vent Hoses","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Inspect Valve Clearance","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Air Cleaner/Element","Replace Automatic Transmission Fluid","Replace Brake Fluid","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(65000,104600,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(70000,112600,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(75000,120700,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(80000,128700,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(85000,136700,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(90000,144800,["Inspect Automatic Transmission Fluid","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Fuel Line Connections","Inspect Fuel Tank Band","Inspect Fuel Tank Cap Gasket","Inspect Fuel Tank Vapor Vent Hoses","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Air Cleaner/Element","Replace Brake Fluid","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Replace Timing Belt","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(95000,152800,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(100000,160900,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Cabin Air Filter","Replace Engine Coolant","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(105000,168900,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(110000,177000,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(115000,185000,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Engine Coolant","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(120000,193100,["Inspect Automatic Transmission Fluid","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Fuel Line Connections","Inspect Fuel Tank Band","Inspect Fuel Tank Cap Gasket","Inspect Fuel Tank Vapor Vent Hoses","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Inspect Valve Clearance","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Air Cleaner/Element","Replace Automatic Transmission Fluid","Replace Brake Fluid","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Replace Spark Plugs","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(125000,201100,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(130000,209200,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(135000,217200,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Hoses & Lines","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(140000,225300,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(145000,233300,["Inspect Air Cleaner/Element","Inspect Ball Joint & Dust Covers","Inspect Chassis' Body Nuts & Bolts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(150000,241400,["Inspect Automatic Transmission Fluid","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Driveshaft/Propeller Shaft Dust Boots","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Fuel Line Connections","Inspect Fuel Tank Band","Inspect Fuel Tank Cap Gasket","Inspect Fuel Tank Vapor Vent Hoses","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Air Cleaner/Element","Replace Brake Fluid","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
  ]};

  // Real OEM data — 2006
  const SCHED_2006 = { maintenance: [
    mi(5000,8000,["Inspect Air Cleaner/Element","Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(10000,16000,["Inspect Air Cleaner/Element","Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(15000,24100,["Inspect Air Cleaner/Element","Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(20000,32100,["Inspect Air Cleaner/Element","Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(25000,40200,["Inspect Air Cleaner/Element","Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(30000,48200,["Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Fuel Line Connections","Inspect Fuel Tank Band","Inspect Fuel Tank Cap Gasket","Inspect Fuel Tank Vapor Vent Hoses","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Air Cleaner/Element","Replace Brake Fluid","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(35000,56300,["Inspect Air Cleaner/Element","Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(40000,64300,["Inspect Air Cleaner/Element","Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(45000,72400,["Inspect Air Cleaner/Element","Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(50000,80400,["Inspect Air Cleaner/Element","Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(55000,88500,["Inspect Air Cleaner/Element","Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(60000,96500,["Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Fuel Line Connections","Inspect Fuel Tank Band","Inspect Fuel Tank Cap Gasket","Inspect Fuel Tank Vapor Vent Hoses","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Inspect Valve Clearance","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Air Cleaner/Element","Replace Automatic Transmission Fluid","Replace Brake Fluid","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(65000,104600,["Inspect Air Cleaner/Element","Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(70000,112600,["Inspect Air Cleaner/Element","Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(75000,120700,["Inspect Air Cleaner/Element","Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(80000,128700,["Inspect Air Cleaner/Element","Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(85000,136700,["Inspect Air Cleaner/Element","Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(90000,144800,["Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Fuel Line Connections","Inspect Fuel Tank Band","Inspect Fuel Tank Cap Gasket","Inspect Fuel Tank Vapor Vent Hoses","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Air Cleaner/Element","Replace Brake Fluid","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Replace Timing Belt","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(95000,152800,["Inspect Air Cleaner/Element","Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(100000,160900,["Inspect Air Cleaner/Element","Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Cabin Air Filter","Replace Engine Coolant","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(105000,168900,["Inspect Air Cleaner/Element","Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(110000,177000,["Inspect Air Cleaner/Element","Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(115000,185000,["Inspect Air Cleaner/Element","Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Engine Coolant","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(120000,193100,["Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Fuel Line Connections","Inspect Fuel Tank Band","Inspect Fuel Tank Cap Gasket","Inspect Fuel Tank Vapor Vent Hoses","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Inspect Valve Clearance","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Air Cleaner/Element","Replace Automatic Transmission Fluid","Replace Brake Fluid","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Replace Spark Plugs","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(125000,201100,["Inspect Air Cleaner/Element","Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(130000,209200,["Inspect Air Cleaner/Element","Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Engine Coolant","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(135000,217200,["Inspect Air Cleaner/Element","Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Discs/Rotors","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Engine Coolant","Inspect Exhaust Pipes & Mounts","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(140000,225300,["Inspect Air Cleaner/Element","Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Cabin Air Filter","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(145000,233300,["Inspect Air Cleaner/Element","Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Brake Discs/Rotors","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Engine Coolant","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
    mi(150000,241400,["Inspect Axle Shaft Boots","Inspect Ball Joint & Dust Covers","Inspect Body Corrosion & Paint Condition","Inspect Brake Hoses & Lines","Inspect Brake Pads","Inspect Chassis' Body Nuts & Bolts","Inspect Differential Fluid Standard","Inspect Drive Belts","Inspect Exhaust Pipes & Mounts","Inspect Fuel Line Connections","Inspect Fuel Tank Band","Inspect Fuel Tank Cap Gasket","Inspect Fuel Tank Vapor Vent Hoses","Inspect Rack And Pinion Assembly","Inspect Steering Linkage & Boots","Re-Torque Driveshaft/Propeller Shaft Flange","Replace Air Cleaner/Element","Replace Brake Fluid","Replace Cabin Air Filter","Replace Engine Coolant","Replace Engine Oil","Replace Engine Oil Filter","Reset Engine Oil Replacement Reminder Light","Road-Test Vehicle","Rotate Tires"]),
  ]};

  return {
    "Lexus": {
      "LS 430": {
        years: ["2001","2002","2003","2004","2005","2006"],
        trims: ["Base 4dr Sedan Automatic"],
        schedules: { 2001:SCHED, 2002:SCHED, 2003:SCHED_2003, 2004:SCHED_2004, 2005:SCHED_2005, 2006:SCHED_2006 }
      }
    }
  };
})();

// ─── SUPABASE CLIENT (shared instance from config block above) ───
function getSB() {
  return window.sbClient || null;
}

// Fetch all available year/make/model/trim rows (for dropdowns)
async function sbFetchVehicleOptions() {
  const sb = getSB();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from("vehicle_schedules")
      .select("year, make, model, trim")
      .order("make").order("model").order("year", { ascending: true });
    return error ? null : data;
  } catch { return null; }
}

// Fetch the maintenance array for a specific vehicle
async function sbFetchSchedule(year, make, model, trim) {
  const sb = getSB();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from("vehicle_schedules")
      .select("maintenance")
      .eq("year", parseInt(year))
      .eq("make", make)
      .eq("model", model)
      .eq("trim", trim)
      .single();
    return (error || !data) ? null : { maintenance: data.maintenance };
  } catch { return null; }
}

// ─── LOCAL FALLBACK HELPERS ───────────────────────────────────────
// Convert LS430_DB to the same flat-row format Supabase returns
function localVehicleRows() {
  const rows = [];
  for (const make of Object.keys(LS430_DB)) {
    for (const model of Object.keys(LS430_DB[make])) {
      const entry = LS430_DB[make][model];
      for (const year of entry.years) {
        for (const trim of entry.trims) {
          rows.push({ year: parseInt(year), make, model, trim });
        }
      }
    }
  }
  return rows;
}
function localSchedule(year, make, model) {
  return LS430_DB[make]?.[model]?.schedules?.[parseInt(year)] || null;
}

// ─── DROPDOWN DERIVATION (works with both Supabase rows & local rows)
function getAvailYears(rows)  {
  return [...new Set(rows.map(r => String(r.year)))].sort((a,b) => a - b);
}
function getAvailMakes(rows, year) {
  if (!year) return [];
  return [...new Set(rows.filter(r => String(r.year) === year).map(r => r.make))].sort();
}
function getAvailModels(rows, year, make) {
  if (!make) return [];
  return [...new Set(rows.filter(r => String(r.year) === year && r.make === make).map(r => r.model))].sort();
}
function getAvailTrims(rows, year, make, model) {
  if (!model) return [];
  return [...new Set(rows.filter(r => String(r.year) === year && r.make === make && r.model === model).map(r => r.trim))].sort();
}

function autoCategory(name) {
  const n = name.toLowerCase();
  if (n.match(/oil|air cleaner|spark|engine|fuel filter|belt|timing|valve|piston|throttle/)) return "Engine";
  if (n.match(/brake|rotor|caliper|pad/)) return "Brakes";
  if (n.match(/tire|tyre|wheel|rotation/)) return "Tires";
  if (n.match(/transmission|transaxle|differential|transfer|cvt|clutch|axle|driveline|drive line|drive shaft/)) return "Drivetrain";
  if (n.match(/coolant|cooling|radiator|thermostat/)) return "Cooling";
  if (n.match(/battery|alternator|electrical/)) return "Electrical";
  if (n.match(/cabin|air filter|interior/)) return "Interior";
  if (n.match(/wiper|windshield|washer fluid/)) return "Visibility";
  if (n.match(/steering|suspension|shock|strut|bushing/)) return "Suspension";
  return "General";
}

function autoPriority(name) {
  const n = name.toLowerCase();
  if (n.match(/oil|timing belt|coolant|brake fluid|transmission fluid|transaxle|cvt fluid/)) return "critical";
  if (n.match(/spark plug|serpentine belt|battery|tire|differential|transfer case|fuel filter|brake pad|rotor/)) return "high";
  if (n.match(/air cleaner|cabin filter|wiper|washer|rotation/)) return "medium";
  return "low";
}

function parseApiData(data) {
  const maint = data.maintenance || [];
  const map = {};
  for (const entry of maint) {
    const miles = (typeof entry.mileage === "object") ? entry.mileage.miles : entry.mileage;
    for (const svc of entry.service_items) {
      if (!map[svc]) map[svc] = [];
      map[svc].push(miles);
    }
  }
  return Object.entries(map).map(([name, mileages]) => {
    mileages.sort((a, b) => a - b);
    const gaps = mileages.slice(1).map((m, i) => m - mileages[i]);
    const interval = gaps.length > 0 ? Math.min(...gaps) : (mileages[0] || 10000);
    return {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""),
      name, mileages, interval,
      category: autoCategory(name),
      priority: autoPriority(name),
      source: "api",
    };
  });
}

// ─── SUPABASE DATA HELPERS ───────────────────────────────────────
const LOCAL_KEY = "autolog_v3";

// Load vehicle list from Supabase user_data table (or localStorage if offline)
async function loadVehicles(uid) {
  if (!window.SB_READY || !uid) {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); } catch { return []; }
  }
  try {
    const { data, error } = await window.sbClient
      .from("user_data")
      .select("vehicles")
      .eq("id", uid)
      .maybeSingle();
    if (error) throw error;
    return data ? (data.vehicles || []) : [];
  } catch(e) {
    console.error("Supabase load error:", e.message);
    return [];
  }
}

// Save vehicle list to Supabase user_data table (upsert — creates row if missing)
async function saveVehicles(uid, vehicles) {
  if (!window.SB_READY || !uid) {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(vehicles)); } catch {}
    return;
  }
  try {
    const { error } = await window.sbClient
      .from("user_data")
      .upsert({
        id: uid,
        vehicles,
        updated_at: new Date().toISOString()
      }, { onConflict: "id" });
    if (error) throw error;
  } catch(e) {
    console.error("Supabase save error:", e.message);
  }
}

// ─── TOTP UTILITIES (RFC 6238 — runs 100% client-side) ───────────
const _B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function _b32Encode(bytes) {
  let bits = 0, val = 0, out = "";
  for (const b of bytes) {
    val = (val << 8) | b; bits += 8;
    while (bits >= 5) { bits -= 5; out += _B32[(val >> bits) & 31]; }
  }
  if (bits > 0) out += _B32[(val << (5 - bits)) & 31];
  return out;
}
function _b32Decode(str) {
  str = str.toUpperCase().replace(/[^A-Z2-7]/g, "");
  const out = []; let bits = 0, val = 0;
  for (const c of str) {
    val = (val << 5) | _B32.indexOf(c); bits += 5;
    if (bits >= 8) { bits -= 8; out.push((val >> bits) & 0xFF); }
  }
  return new Uint8Array(out);
}
async function _totpCode(secret, offset = 0) {
  const T = Math.floor(Date.now() / 30000) + offset;
  const buf = new ArrayBuffer(8);
  const dv = new DataView(buf);
  dv.setUint32(0, Math.floor(T / 0x100000000) >>> 0, false);
  dv.setUint32(4, T >>> 0, false);
  const key = await crypto.subtle.importKey("raw", _b32Decode(secret), { name:"HMAC", hash:"SHA-1" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, buf));
  const o = sig[19] & 0xF;
  const code = ((sig[o]&0x7F)<<24|(sig[o+1]&0xFF)<<16|(sig[o+2]&0xFF)<<8|(sig[o+3]&0xFF)) % 1_000_000;
  return String(code).padStart(6, "0");
}
async function verifyTotp(secret, token) {
  const t = token.replace(/\D/g, "");
  if (t.length !== 6) return false;
  for (const offset of [-1, 0, 1]) { if (await _totpCode(secret, offset) === t) return true; }
  return false;
}
function newTotpSecret() {
  const bytes = new Uint8Array(20); crypto.getRandomValues(bytes); return _b32Encode(bytes);
}
function totpUri(secret, email) {
  return `otpauth://totp/AutoTrax:${encodeURIComponent(email)}?secret=${secret}&issuer=AutoTrax&algorithm=SHA1&digits=6&period=30`;
}
function fmtSecret(s) { return s.match(/.{1,4}/g)?.join(" ") || s; }

// ─── 2FA DATA HELPERS ────────────────────────────────────────────
const TWOFA_KEY = "autolog_2fa_v1";

// Load 2FA settings from Supabase user_data table (or localStorage if offline)
async function load2FA(uid) {
  if (!window.SB_READY || !uid) {
    try { return JSON.parse(localStorage.getItem(TWOFA_KEY) || "null") || { enabled: false }; } catch { return { enabled: false }; }
  }
  try {
    const { data, error } = await window.sbClient
      .from("user_data")
      .select("two_fa")
      .eq("id", uid)
      .maybeSingle();
    if (error) throw error;
    return data ? (data.two_fa || { enabled: false }) : { enabled: false };
  } catch { return { enabled: false }; }
}

// Save 2FA settings to Supabase user_data table (upsert — creates row if missing)
async function save2FA(uid, data) {
  if (!window.SB_READY || !uid) {
    try { localStorage.setItem(TWOFA_KEY, JSON.stringify(data)); } catch {} return;
  }
  try {
    const { error } = await window.sbClient
      .from("user_data")
      .upsert({
        id: uid,
        two_fa: data,
        updated_at: new Date().toISOString()
      }, { onConflict: "id" });
    if (error) throw error;
  } catch(e) { console.error("2FA save error:", e.message); }
}

// ─── INLINE SVG ICONS ───────────────────────────────────────────
const sp = { xmlns:"http://www.w3.org/2000/svg", fill:"none", stroke:"currentColor", strokeWidth:"2", strokeLinecap:"round", strokeLinejoin:"round" };
const Ic = ({size=16,className="",children}) => <svg {...sp} width={size} height={size} viewBox="0 0 24 24" className={className}>{children}</svg>;

const CarIcon     = p => <Ic {...p}><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></Ic>;
const PlusIcon    = p => <Ic {...p}><path d="M5 12h14"/><path d="M12 5v14"/></Ic>;
const WrenchIcon  = p => <Ic {...p}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></Ic>;
const AlertIcon   = p => <Ic {...p}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></Ic>;
const CheckIcon   = p => <Ic {...p}><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></Ic>;
const ClockIcon   = p => <Ic {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Ic>;
const TrashIcon   = p => <Ic {...p}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></Ic>;
const XIcon       = p => <Ic {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></Ic>;
const HistoryIcon = p => <Ic {...p}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></Ic>;
const EditIcon    = p => <Ic {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></Ic>;
const SaveIcon    = p => <Ic {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></Ic>;
const RefreshIcon = p => <Ic {...p}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></Ic>;
const SparkleIcon = p => <Ic {...p}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></Ic>;
const LogoutIcon  = p => <Ic {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Ic>;
const UserIcon    = p => <Ic {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Ic>;
const CloudIcon   = p => <Ic {...p}><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></Ic>;
const EyeIcon     = p => <Ic {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></Ic>;
const EyeOffIcon  = p => <Ic {...p}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></Ic>;
const SpinnerIcon = ({size=16,className=""}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`spin ${className}`}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;
const MenuIcon    = p => <Ic {...p}><path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/></Ic>;
const ShieldIcon  = p => <Ic {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Ic>;
const KeyIcon     = p => <Ic {...p}><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></Ic>;

// ─── VEHICLE DATA ────────────────────────────────────────────────
const MAKES_MODELS = {
  Toyota:    ["4Runner","Avalon","Camry","Corolla","Highlander","Prius","RAV4","Sequoia","Sienna","Tacoma","Tundra","Venza"],
  Honda:     ["Accord","Civic","CR-V","HR-V","Insight","Odyssey","Passport","Pilot","Ridgeline"],
  Ford:      ["Bronco","Edge","Escape","Expedition","Explorer","F-150","F-250","Fusion","Maverick","Mustang","Ranger"],
  Chevrolet: ["Blazer","Colorado","Equinox","Malibu","Silverado 1500","Silverado 2500","Suburban","Tahoe","Traverse","Trax"],
  Nissan:    ["Altima","Armada","Frontier","Kicks","Maxima","Murano","Pathfinder","Rogue","Sentra","Titan","Versa"],
  BMW:       ["1 Series","2 Series","3 Series","4 Series","5 Series","7 Series","X1","X3","X5","X7","M3","M5"],
  "Mercedes-Benz": ["A-Class","C-Class","E-Class","GLA","GLC","GLE","GLS","S-Class","CLA","AMG GT"],
  Hyundai:   ["Elantra","Kona","Palisade","Santa Cruz","Santa Fe","Sonata","Tucson","Venue"],
  Kia:       ["Carnival","EV6","Forte","K5","Niro","Seltos","Sorento","Sportage","Stinger","Telluride"],
  Subaru:    ["Ascent","BRZ","Crosstrek","Forester","Impreza","Legacy","Outback","WRX"],
  Jeep:      ["Cherokee","Compass","Gladiator","Grand Cherokee","Renegade","Wrangler"],
  Dodge:     ["Challenger","Charger","Durango","Ram 1500","Ram 2500"],
  Volkswagen:["Atlas","Golf","ID.4","Jetta","Passat","Taos","Tiguan"],
  Audi:      ["A3","A4","A5","A6","A8","Q3","Q5","Q7","Q8","e-tron","TT"],
  Mazda:     ["CX-30","CX-5","CX-50","CX-9","Mazda3","Mazda6","MX-5 Miata"],
  GMC:       ["Acadia","Canyon","Sierra 1500","Sierra 2500","Terrain","Yukon"],
  Lexus:     ["ES","GX","IS","LS","LX","NX","RX","UX"],
  Acura:     ["ILX","MDX","RDX","TLX"],
  Ram:       ["1500","2500","3500","ProMaster"],
  Volvo:     ["S60","S90","V60","V90","XC40","XC60","XC90"],
};

const BRAND_SCHEDULES = {
  Toyota: [
    {id:"oil",        name:"Oil & Filter Change",     interval:5000, category:"Engine",    priority:"critical",note:"Full synthetic — Toyota 0W-20"},
    {id:"tire_rot",   name:"Tire Rotation",            interval:5000, category:"Tires",     priority:"high",   note:"Rotate with every oil change"},
    {id:"cabin",      name:"Cabin Air Filter",         interval:15000,category:"Interior",  priority:"medium", note:"More often in dusty climates"},
    {id:"air",        name:"Engine Air Filter",        interval:30000,category:"Engine",    priority:"medium"},
    {id:"brake_insp", name:"Brake Inspection",         interval:15000,category:"Brakes",    priority:"high"},
    {id:"brake_fluid",name:"Brake Fluid Flush",        interval:45000,category:"Brakes",    priority:"high",   note:"Every 3 years or 45k miles"},
    {id:"trans",      name:"Transmission Fluid",       interval:60000,category:"Drivetrain",priority:"high",   note:"Toyota ATF-WS required"},
    {id:"plugs",      name:"Spark Plugs (Iridium)",    interval:120000,category:"Engine",   priority:"high"},
    {id:"coolant",    name:"Coolant Flush",            interval:100000,category:"Cooling",  priority:"high",   note:"Toyota Super Long Life Coolant"},
    {id:"belt",       name:"Serpentine Belt",          interval:90000,category:"Engine",    priority:"critical",note:"Inspect at 60k, replace at 90k"},
    {id:"battery",    name:"Battery Test/Replace",     interval:50000,category:"Electrical",priority:"medium"},
    {id:"wiper",      name:"Wiper Blades",             interval:12000,category:"Visibility",priority:"low"},
    {id:"diff",       name:"Differential Fluid",       interval:30000,category:"Drivetrain",priority:"medium", note:"4WD/AWD models only"},
  ],
  Honda: [
    {id:"oil",        name:"Oil & Filter Change",     interval:5000, category:"Engine",    priority:"critical",note:"Honda 0W-20 full synthetic"},
    {id:"tire_rot",   name:"Tire Rotation",            interval:7500, category:"Tires",     priority:"high"},
    {id:"cabin",      name:"Cabin Air Filter",         interval:15000,category:"Interior",  priority:"medium"},
    {id:"air",        name:"Engine Air Filter",        interval:30000,category:"Engine",    priority:"medium"},
    {id:"brake_insp", name:"Brake Inspection",         interval:15000,category:"Brakes",    priority:"high"},
    {id:"brake_fluid",name:"Brake Fluid Flush",        interval:45000,category:"Brakes",    priority:"high"},
    {id:"trans",      name:"Transmission Fluid",       interval:90000,category:"Drivetrain",priority:"high",   note:"Honda ATF-DW1 required"},
    {id:"plugs",      name:"Spark Plugs (Iridium)",    interval:100000,category:"Engine",   priority:"high"},
    {id:"coolant",    name:"Coolant Flush",            interval:100000,category:"Cooling",  priority:"high"},
    {id:"belt",       name:"Serpentine Belt",          interval:105000,category:"Engine",   priority:"critical"},
    {id:"battery",    name:"Battery Test/Replace",     interval:50000,category:"Electrical",priority:"medium"},
    {id:"wiper",      name:"Wiper Blades",             interval:12000,category:"Visibility",priority:"low"},
  ],
  Ford: [
    {id:"oil",        name:"Oil & Filter Change",     interval:7500, category:"Engine",    priority:"critical",note:"Motorcraft full synthetic 5W-30"},
    {id:"tire_rot",   name:"Tire Rotation",            interval:7500, category:"Tires",     priority:"high"},
    {id:"cabin",      name:"Cabin Air Filter",         interval:15000,category:"Interior",  priority:"medium"},
    {id:"air",        name:"Engine Air Filter",        interval:30000,category:"Engine",    priority:"medium"},
    {id:"brake_insp", name:"Brake Inspection",         interval:15000,category:"Brakes",    priority:"high"},
    {id:"brake_fluid",name:"Brake Fluid Flush",        interval:45000,category:"Brakes",    priority:"high"},
    {id:"trans",      name:"Transmission Fluid",       interval:60000,category:"Drivetrain",priority:"high",   note:"Mercon LV for automatic"},
    {id:"plugs",      name:"Spark Plugs",              interval:60000,category:"Engine",    priority:"high"},
    {id:"coolant",    name:"Coolant Flush",            interval:60000,category:"Cooling",   priority:"high"},
    {id:"belt",       name:"Serpentine Belt",          interval:90000,category:"Engine",    priority:"critical"},
    {id:"battery",    name:"Battery Test/Replace",     interval:50000,category:"Electrical",priority:"medium"},
    {id:"wiper",      name:"Wiper Blades",             interval:12000,category:"Visibility",priority:"low"},
  ],
  Chevrolet: [
    {id:"oil",        name:"Oil & Filter Change",     interval:7500, category:"Engine",    priority:"critical",note:"Dexos approved synthetic"},
    {id:"tire_rot",   name:"Tire Rotation",            interval:7500, category:"Tires",     priority:"high"},
    {id:"cabin",      name:"Cabin Air Filter",         interval:15000,category:"Interior",  priority:"medium"},
    {id:"air",        name:"Engine Air Filter",        interval:45000,category:"Engine",    priority:"medium"},
    {id:"brake_insp", name:"Brake Inspection",         interval:15000,category:"Brakes",    priority:"high"},
    {id:"brake_fluid",name:"Brake Fluid Flush",        interval:45000,category:"Brakes",    priority:"high"},
    {id:"trans",      name:"Transmission Fluid",       interval:45000,category:"Drivetrain",priority:"high",   note:"Dexron VI ATF required"},
    {id:"plugs",      name:"Spark Plugs (Iridium)",    interval:100000,category:"Engine",   priority:"high"},
    {id:"coolant",    name:"Coolant Flush",            interval:150000,category:"Cooling",  priority:"high",   note:"Dex-Cool extended life"},
    {id:"belt",       name:"Serpentine Belt",          interval:90000,category:"Engine",    priority:"critical"},
    {id:"battery",    name:"Battery Test/Replace",     interval:50000,category:"Electrical",priority:"medium"},
    {id:"wiper",      name:"Wiper Blades",             interval:12000,category:"Visibility",priority:"low"},
  ],
  BMW: [
    {id:"oil",        name:"Oil & Filter Change",     interval:10000,category:"Engine",    priority:"critical",note:"BMW LL-01 or LL-04 spec ONLY"},
    {id:"tire_rot",   name:"Tire Rotation",            interval:10000,category:"Tires",     priority:"high"},
    {id:"cabin",      name:"Cabin/Microfilter",        interval:20000,category:"Interior",  priority:"medium"},
    {id:"air",        name:"Engine Air Filter",        interval:30000,category:"Engine",    priority:"medium"},
    {id:"brake_insp", name:"Brake Inspection",         interval:20000,category:"Brakes",    priority:"high",   note:"Electronic wear sensors"},
    {id:"brake_fluid",name:"Brake Fluid Flush",        interval:24000,category:"Brakes",    priority:"high",   note:"Every 2 years — moisture absorption"},
    {id:"trans",      name:"Transmission Fluid",       interval:60000,category:"Drivetrain",priority:"high",   note:"Not truly 'lifetime'"},
    {id:"plugs",      name:"Spark Plugs",              interval:60000,category:"Engine",    priority:"high"},
    {id:"coolant",    name:"Coolant Flush",            interval:50000,category:"Cooling",   priority:"high",   note:"BMW blue coolant — never mix"},
    {id:"belt",       name:"Serpentine/Drive Belt",    interval:80000,category:"Engine",    priority:"critical"},
    {id:"battery",    name:"Battery Registration",     interval:50000,category:"Electrical",priority:"high",   note:"Requires coding — use specialist"},
    {id:"wiper",      name:"Wiper Blades",             interval:12000,category:"Visibility",priority:"low"},
  ],
  "Mercedes-Benz": [
    {id:"oil",        name:"Oil & Filter Change",     interval:10000,category:"Engine",    priority:"critical",note:"MB 229.5 or 229.51 spec ONLY"},
    {id:"tire_rot",   name:"Tire Rotation",            interval:10000,category:"Tires",     priority:"high"},
    {id:"cabin",      name:"Cabin Air Filter",         interval:20000,category:"Interior",  priority:"medium"},
    {id:"air",        name:"Engine Air Filter",        interval:30000,category:"Engine",    priority:"medium"},
    {id:"brake_insp", name:"Brake Inspection",         interval:20000,category:"Brakes",    priority:"high"},
    {id:"brake_fluid",name:"Brake Fluid Flush",        interval:20000,category:"Brakes",    priority:"high",   note:"Every 2 years — MB spec fluid"},
    {id:"trans",      name:"Transmission Fluid (7G)",  interval:40000,category:"Drivetrain",priority:"high",   note:"Genuine MB ATF 134 required"},
    {id:"plugs",      name:"Spark Plugs",              interval:60000,category:"Engine",    priority:"high"},
    {id:"coolant",    name:"Coolant Flush",            interval:50000,category:"Cooling",   priority:"high"},
    {id:"belt",       name:"Serpentine Belt",          interval:80000,category:"Engine",    priority:"critical"},
    {id:"battery",    name:"Battery Registration",     interval:50000,category:"Electrical",priority:"high",   note:"Must be programmed via Star Diagnostic"},
    {id:"wiper",      name:"Wiper Blades",             interval:12000,category:"Visibility",priority:"low"},
  ],
  Subaru: [
    {id:"oil",        name:"Oil & Filter Change",     interval:6000, category:"Engine",    priority:"critical",note:"Subaru Synthetic 0W-20 — prevents sludge"},
    {id:"tire_rot",   name:"Tire Rotation",            interval:6000, category:"Tires",     priority:"critical",note:"Critical for Symmetrical AWD"},
    {id:"cabin",      name:"Cabin Air Filter",         interval:12000,category:"Interior",  priority:"medium"},
    {id:"air",        name:"Engine Air Filter",        interval:30000,category:"Engine",    priority:"medium"},
    {id:"brake_insp", name:"Brake Inspection",         interval:12000,category:"Brakes",    priority:"high"},
    {id:"brake_fluid",name:"Brake Fluid Flush",        interval:30000,category:"Brakes",    priority:"high"},
    {id:"trans",      name:"CVT/Transmission Fluid",   interval:25000,category:"Drivetrain",priority:"critical",note:"Subaru CVT fluid — CRITICAL to not skip"},
    {id:"plugs",      name:"Spark Plugs",              interval:60000,category:"Engine",    priority:"high"},
    {id:"coolant",    name:"Coolant Flush",            interval:30000,category:"Cooling",   priority:"high"},
    {id:"timing",     name:"Timing Belt (if equipped)",interval:105000,category:"Engine",   priority:"critical",note:"Interference engine — failure = damage"},
    {id:"battery",    name:"Battery Test/Replace",     interval:50000,category:"Electrical",priority:"medium"},
    {id:"wiper",      name:"Wiper Blades",             interval:12000,category:"Visibility",priority:"low"},
  ],
};

const DEFAULT_SCHEDULE = [
  {id:"oil",        name:"Oil & Filter Change",  interval:5000, category:"Engine",    priority:"critical"},
  {id:"tire_rot",   name:"Tire Rotation",         interval:7500, category:"Tires",     priority:"high"},
  {id:"cabin",      name:"Cabin Air Filter",      interval:15000,category:"Interior",  priority:"medium"},
  {id:"air",        name:"Engine Air Filter",     interval:30000,category:"Engine",    priority:"medium"},
  {id:"brake_insp", name:"Brake Inspection",      interval:15000,category:"Brakes",    priority:"high"},
  {id:"brake_fluid",name:"Brake Fluid Flush",     interval:45000,category:"Brakes",    priority:"high"},
  {id:"trans",      name:"Transmission Fluid",    interval:60000,category:"Drivetrain",priority:"high"},
  {id:"plugs",      name:"Spark Plugs",           interval:60000,category:"Engine",    priority:"high"},
  {id:"coolant",    name:"Coolant Flush",         interval:60000,category:"Cooling",   priority:"high"},
  {id:"belt",       name:"Serpentine Belt",       interval:90000,category:"Engine",    priority:"critical"},
  {id:"battery",    name:"Battery Test/Replace",  interval:50000,category:"Electrical",priority:"medium"},
  {id:"wiper",      name:"Wiper Blades",          interval:12000,category:"Visibility",priority:"low"},
];

const getBuiltinSchedule = make => BRAND_SCHEDULES[make] || DEFAULT_SCHEDULE;
const CATEGORIES = ["All","Engine","Brakes","Tires","Drivetrain","Cooling","Electrical","Interior","Visibility","Suspension","General"];
const YEARS = Array.from({length:2025-1983+1},(_,i)=>String(2025-i));

// Priority config — CSS class suffixes map to .badge-category.{key} in styles.css
const PRIORITY_CFG = {
  critical:{cls:"critical", dot:"dot-critical"},
  high:    {cls:"high",     dot:"dot-high"},
  medium:  {cls:"medium",   dot:"dot-medium"},
  low:     {cls:"low",      dot:"dot-low"},
};
// Status config — CSS class suffixes map to .status-pill.{key}, .service-row.{key}, etc.
const STATUS_CFG = {
  overdue:{label:"OVERDUE",  cls:"overdue"},
  soon:   {label:"DUE SOON", cls:"soon"},
  good:   {label:"OK",       cls:"good"},
  unknown:{label:"UNLOGGED", cls:"unknown"},
};

// ─── UTILITIES ───────────────────────────────────────────────────
let _uid = Date.now();
const uid     = () => `v${_uid++}`;
const fmtMi   = n => n==null?"—":Math.abs(Math.round(n)).toLocaleString()+" mi";
const fmtDate = d => d?new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"—";

function getStatus(item, currentMileage, logs) {
  // Match logs by serviceId first; fall back to serviceName if no ID match found
  let relevant = logs.filter(l => l.serviceId === item.id).sort((a,b) => b.mileage - a.mileage);
  if (relevant.length === 0) {
    relevant = logs.filter(l => l.serviceName === item.name).sort((a,b) => b.mileage - a.mileage);
  }
  const lastLog  = relevant[0] || null;
  const lastMi   = lastLog ? lastLog.mileage : null;
  const baseMi   = lastMi != null ? lastMi : 0;
  let dueAt;
  if (item.mileages && item.mileages.length > 0) {
    const next = item.mileages.find(m => m > baseMi);
    dueAt = next || (baseMi + item.interval);
  } else {
    dueAt = baseMi + item.interval;
  }
  const remaining = dueAt - currentMileage;
  const span = dueAt - baseMi;
  const pct = lastMi != null && span > 0
    ? Math.min(100, Math.max(0, ((currentMileage - baseMi) / span) * 100))
    : (item.mileages ? Math.min(100, Math.max(0, (currentMileage / dueAt) * 100)) : null);
  let status;
  if (lastMi == null) {
    // No logs exist — compare current mileage against first due point
    if (remaining < 0) {
      status = "overdue";
    } else if (remaining <= item.interval * 0.15) {
      status = "soon";
    } else if (item.mileages || item.interval) {
      status = "unknown";
    } else {
      status = "unknown";
    }
  } else if (remaining < 0) {
    status = "overdue";
  } else if (remaining <= item.interval * 0.15) {
    status = "soon";
  } else {
    status = "good";
  }
  return { lastLog, lastMi, dueAt, remaining, pct, status };
}

// ─── STATUS BADGE ────────────────────────────────────────────────
function StatusBadge({status}) {
  const c = STATUS_CFG[status];
  return (
    <span className={`status-pill ${c.cls}${status==="overdue"?" anim-shimmer":""}`}>
      {status==="overdue"&&<AlertIcon size={10}/>}
      {status==="soon"   &&<ClockIcon size={10}/>}
      {status==="good"   &&<CheckIcon size={10}/>}
      {c.label}
    </span>
  );
}

function ProgressBar({pct,status}) {
  if(pct==null) return <div className="progress-track" style={{height:6}}/>;
  const cls = STATUS_CFG[status]?.cls || "unknown";
  return (
    <div className="progress-track">
      <div className={`progress-fill anim-bar ${cls}`} style={{"--bar-w":`${Math.min(pct,100)}%`}}/>
    </div>
  );
}

// ─── QR CODE VIEW ────────────────────────────────────────────────
function QRCodeView({ value, size = 180 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !window.QRCode) return;
    ref.current.innerHTML = "";
    new window.QRCode(ref.current, { text: value, width: size, height: size, correctLevel: window.QRCode.CorrectLevel.M });
  }, [value, size]);
  return <div ref={ref} className="qr-container"/>;
}

// ─── LOADING SCREEN ──────────────────────────────────────────────
function LoadingScreen({message="Loading…"}) {
  return (
    <div className="screen-bg">
      <div className="text-center anim-fade-in">
        <div className="logo-icon lg mx-auto mb-5">
          <CarIcon size={28} className="text-white"/>
        </div>
        <div className="text-heading text-lg mb-2">AutoTrax</div>
        <div className="flex items-center justify-center gap-2 text-sm" style={{color:'var(--text-muted)'}}>
          <SpinnerIcon size={16}/> {message}
        </div>
      </div>
    </div>
  );
}

// ─── AUTH SCREEN ─────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode]       = useState("login"); // "login" | "signup" | "reset"
  const [loginId, setLoginId] = useState("");       // username or email (login mode)
  const [email, setEmail]     = useState("");       // email (signup + reset modes)
  const [firstName, setFirst] = useState("");       // first name (signup only)
  const [lastName, setLast]   = useState("");       // last name (signup only)
  const [username, setUser]   = useState("");       // chosen username (signup only)
  const [password, setPass]   = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const [info, setInfo]       = useState("");

  const inp = "input-field";

  // Map Supabase error messages to user-friendly text
  function friendlyError(msg) {
    if (!msg) return "Something went wrong. Please try again.";
    const m = msg.toLowerCase();
    if (m.includes("invalid login")) return "Incorrect username/email or password.";
    if (m.includes("already registered") || m.includes("already been registered")) return "An account with this email already exists.";
    if (m.includes("password") && m.includes("least")) return "Password must be at least 6 characters.";
    if (m.includes("valid email") || m.includes("invalid email")) return "Please enter a valid email address.";
    if (m.includes("rate") || m.includes("too many")) return "Too many attempts. Please wait a moment and try again.";
    if (m.includes("network") || m.includes("fetch")) return "Network error. Check your internet connection.";
    return msg;
  }

  // Detect whether the login input looks like an email or a username
  function isEmail(str) { return str.includes("@"); }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr(""); setInfo(""); setLoading(true);
    try {
      const sb = window.sbClient;

      if (mode === "reset") {
        // Password reset — always requires email
        const { error } = await sb.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setInfo("Password reset email sent! Check your inbox.");
        setMode("login");

      } else if (mode === "signup") {
        // ── SIGNUP ──────────────────────────────────────────────
        if (password !== confirm) { setErr("Passwords do not match."); setLoading(false); return; }
        const uname = username.trim().toLowerCase();
        if (uname.length < 3) { setErr("Username must be at least 3 characters."); setLoading(false); return; }
        if (!/^[a-z0-9_]+$/.test(uname)) { setErr("Username can only contain letters, numbers, and underscores."); setLoading(false); return; }

        // Check if username is already taken before creating the auth user
        const { data: existing } = await sb.from("profiles").select("id").eq("username", uname).maybeSingle();
        if (existing) { setErr("That username is already taken."); setLoading(false); return; }

        // Create auth user with metadata
        const { data, error } = await sb.auth.signUp({
          email,
          password,
          options: { data: { first_name: firstName.trim(), last_name: lastName.trim(), username: uname } }
        });
        if (error) throw error;
        if (!data.user) { setErr("Signup failed. Please try again."); setLoading(false); return; }

        // Insert profile row (maps username → auth user for login lookups)
        const { error: profErr } = await sb.from("profiles").insert({
          id: data.user.id,
          username: uname,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim().toLowerCase()
        });
        if (profErr) console.error("Profile insert error:", profErr.message);

        // Remember what they signed up with for sidebar display
        sessionStorage.setItem("autolog_login_id", uname);
        onAuth(data.user);

      } else {
        // ── LOGIN ───────────────────────────────────────────────
        let loginEmail = loginId.trim();

        // If they entered a username (not an email), look up the email
        if (!isEmail(loginEmail)) {
          const { data: profile, error: lookupErr } = await sb
            .from("profiles")
            .select("email")
            .eq("username", loginEmail.toLowerCase())
            .maybeSingle();
          if (lookupErr || !profile) { setErr("Username not found."); setLoading(false); return; }
          loginEmail = profile.email;
          // Store the username they logged in with for sidebar display
          sessionStorage.setItem("autolog_login_id", loginId.trim());
        } else {
          sessionStorage.setItem("autolog_login_id", loginEmail);
        }

        const { data, error } = await sb.auth.signInWithPassword({ email: loginEmail, password });
        if (error) throw error;
        if (data.user) onAuth(data.user);
      }
    } catch(e) {
      setErr(friendlyError(e.message || e.code));
    }
    setLoading(false);
  }

  const titles = { login:"Sign in to AutoTrax", signup:"Create your account", reset:"Reset password" };
  const btnLabels = { login:"Sign In", signup:"Create Account", reset:"Send Reset Email" };

  return (
    <div className="screen-bg">
      <div className="w-full max-w-sm anim-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="logo-icon lg mx-auto mb-3">
            <CarIcon size={28} className="text-white"/>
          </div>
          <h1 className="text-heading text-2xl">AutoTrax</h1>
          <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Car Maintenance Tracker</p>
        </div>

        {/* Card */}
        <div className="auth-card">
          <h2 className="text-heading text-lg mb-1">{titles[mode]}</h2>
          {mode === "login"  && <p className="text-sm mb-5" style={{color:'var(--text-secondary)'}}>Your vehicles and history sync across all devices.</p>}
          {mode === "signup" && <p className="text-sm mb-5" style={{color:'var(--text-secondary)'}}>Free account — your data is saved in the cloud.</p>}
          {mode === "reset"  && <p className="text-sm mb-5" style={{color:'var(--text-secondary)'}}>Enter your email and we'll send a reset link.</p>}

          {info && <div className="alert alert-success mb-4">{info}</div>}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* ── LOGIN MODE: single field for username or email ── */}
            {mode === "login" && (
              <div>
                <label className="input-label">Username or Email</label>
                <input type="text" required autoComplete="username" placeholder="johndoe or you@example.com"
                  value={loginId} onChange={e=>setLoginId(e.target.value)} className={inp}/>
              </div>
            )}

            {/* ── SIGNUP MODE: first name, last name, username, email ── */}
            {mode === "signup" && (<>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="input-label">First Name</label>
                  <input type="text" required placeholder="John"
                    value={firstName} onChange={e=>setFirst(e.target.value)} className={inp}/>
                </div>
                <div className="flex-1">
                  <label className="input-label">Last Name</label>
                  <input type="text" required placeholder="Doe"
                    value={lastName} onChange={e=>setLast(e.target.value)} className={inp}/>
                </div>
              </div>
              <div>
                <label className="input-label">Username</label>
                <input type="text" required autoComplete="username" placeholder="johndoe (min 3 characters)"
                  minLength={3} value={username} onChange={e=>setUser(e.target.value)} className={inp}/>
              </div>
              <div>
                <label className="input-label">Email</label>
                <input type="email" required autoComplete="email" placeholder="you@example.com"
                  value={email} onChange={e=>setEmail(e.target.value)} className={inp}/>
              </div>
            </>)}

            {/* ── RESET MODE: email only ── */}
            {mode === "reset" && (
              <div>
                <label className="input-label">Email</label>
                <input type="email" required autoComplete="email" placeholder="you@example.com"
                  value={email} onChange={e=>setEmail(e.target.value)} className={inp}/>
              </div>
            )}

            {mode !== "reset" && (
              <div>
                <label className="input-label">Password</label>
                <div className="relative">
                  <input type={showPw?"text":"password"} required autoComplete={mode==="signup"?"new-password":"current-password"}
                    placeholder={mode==="signup"?"At least 6 characters":"Your password"}
                    value={password} onChange={e=>setPass(e.target.value)}
                    className={`${inp} pr-10`}/>
                  <button type="button" onClick={()=>setShowPw(p=>!p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{color:'var(--text-muted)'}}>
                    {showPw ? <EyeOffIcon size={16}/> : <EyeIcon size={16}/>}
                  </button>
                </div>
              </div>
            )}

            {mode === "signup" && (
              <div>
                <label className="input-label">Confirm Password</label>
                <input type={showPw?"text":"password"} required autoComplete="new-password"
                  placeholder="Re-enter password"
                  value={confirm} onChange={e=>setConfirm(e.target.value)} className={inp}/>
              </div>
            )}

            {err && <div className="alert alert-error">{err}</div>}

            <button type="submit" disabled={loading}
              className="btn btn-primary btn-block mt-1">
              {loading ? <><SpinnerIcon size={14}/> Please wait…</> : btnLabels[mode]}
            </button>
          </form>

          {/* Mode switcher */}
          <div className="mt-4 flex flex-col gap-2 text-center text-sm">
            {mode === "login" && <>
              <button onClick={()=>{setMode("signup");setErr("");setInfo("");}}
                className="font-medium" style={{color:'var(--accent)'}}>
                Don't have an account? Sign up
              </button>
              <button onClick={()=>{setMode("reset");setErr("");setInfo("");}}
                className="text-xs" style={{color:'var(--text-muted)'}}>
                Forgot password?
              </button>
            </>}
            {mode === "signup" && (
              <button onClick={()=>{setMode("login");setErr("");setInfo("");}}
                className="font-medium" style={{color:'var(--accent)'}}>
                Already have an account? Sign in
              </button>
            )}
            {mode === "reset" && (
              <button onClick={()=>{setMode("login");setErr("");setInfo("");}}
                className="text-xs" style={{color:'var(--text-muted)'}}>
                Back to sign in
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs mt-4" style={{color:'var(--text-muted)'}}>
          Your data is stored securely in Supabase.
        </p>
      </div>
    </div>
  );
}

// ─── SETUP SCREEN (shown when Supabase config not filled in) ─────
function SetupScreen({ onContinueOffline }) {
  const steps = [
    { n:"1", text:"Go to supabase.com/dashboard and create a new project" },
    { n:"2", text:"In Settings → API, copy your Project URL and anon (public) key" },
    { n:"3", text:"Enable Email/Password auth under Authentication → Providers → Email" },
    { n:"4", text:"Create a user_data table (see SQL in the HTML comment near the top of this file)" },
    { n:"5", text:"Open this HTML file in a text editor and paste your URL + key into SB_URL / SB_KEY near the top" },
  ];
  return (
    <div className="screen-bg" style={{overflow:'auto'}}>
      <div className="w-full max-w-md py-8 anim-slide-up">
        <div className="text-center mb-6">
          <div className="logo-icon lg mx-auto mb-3">
            <CarIcon size={28} className="text-white"/>
          </div>
          <h1 className="text-heading text-2xl">AutoTrax</h1>
        </div>

        <div className="auth-card mb-4">
          <div className="flex items-center gap-2 mb-1">
            <CloudIcon size={20} style={{color:'var(--accent)'}}/>
            <h2 className="text-heading text-lg">Set Up Cloud Accounts</h2>
          </div>
          <p className="text-sm mb-5" style={{color:'var(--text-secondary)'}}>
            To enable user accounts and cross-device sync, connect a free Supabase project.
            This takes about 5 minutes.
          </p>

          <div className="space-y-3">
            {steps.map(s=>(
              <div key={s.n} className="flex gap-3 items-start">
                <div className="step-number mt-0.5">{s.n}</div>
                <p className="text-sm leading-relaxed" style={{color:'var(--text-secondary)'}}>{s.text}</p>
              </div>
            ))}
          </div>

          <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer"
            className="btn btn-primary btn-block mt-5" style={{textDecoration:'none'}}>
            Open Supabase Dashboard →
          </a>
        </div>

        <div className="rounded-2xl p-4 text-center" style={{background:'var(--bg-surface)',border:'1px solid var(--border-default)'}}>
          <p className="text-sm mb-3" style={{color:'var(--text-secondary)'}}>Not ready to set up accounts yet?</p>
          <button onClick={onContinueOffline}
            className="btn btn-secondary">
            Continue with Local Storage (this device only)
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MILEAGE EDITOR ─────────────────────────────────────────────
function MileageEditor({value,onSave}) {
  const [editing,setEditing] = useState(false);
  const [input,setInput] = useState(String(value));
  useEffect(()=>{if(!editing)setInput(String(value));},[value,editing]);
  function save(){const v=parseInt(input,10);if(!isNaN(v)&&v>=0)onSave(v);setEditing(false);}
  if(!editing) return (
    <button onClick={()=>{setInput(String(value));setEditing(true);}} className="flex items-center gap-2 group mt-1">
      <span className="mileage-display">{value.toLocaleString()}</span>
      <span className="text-base font-medium" style={{color:'var(--text-secondary)'}}>miles</span>
      <EditIcon size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{color:'var(--text-muted)'}}/>
    </button>
  );
  return (
    <div className="flex items-center gap-2 mt-1">
      <input autoFocus type="number" min="0" value={input}
        onChange={e=>setInput(e.target.value)}
        onKeyDown={e=>{if(e.key==="Enter")save();if(e.key==="Escape")setEditing(false);}}
        className="mileage-input"/>
      <span className="text-base font-medium" style={{color:'var(--text-secondary)'}}>miles</span>
      <button onClick={save} className="btn btn-primary btn-sm"><SaveIcon size={14}/></button>
      <button onClick={()=>setEditing(false)} className="btn btn-secondary btn-sm"><XIcon size={14}/></button>
    </div>
  );
}

// ─── FETCH OEM SCHEDULE MODAL ────────────────────────────────────
function FetchScheduleModal({vehicle, onSuccess, onClose}) {
  const [rows,    setRows]    = useState(null);   // flat list from Supabase or local
  const [loading, setLoading] = useState(true);   // loading dropdown options
  const [submitting, setSub]  = useState(false);
  const [year,  setYear]  = useState("");
  const [make,  setMake]  = useState("");
  const [model, setModel] = useState("");
  const [trim,  setTrim]  = useState("");
  const [err,   setErr]   = useState("");
  const [sbUsed, setSbUsed] = useState(false);

  // Load vehicle options from Supabase on mount, fall back to local
  useEffect(() => {
    (async () => {
      const sbRows = await sbFetchVehicleOptions();
      const finalRows = sbRows || localVehicleRows();
      setSbUsed(!!sbRows);
      setRows(finalRows);
      setLoading(false);
      // Pre-select if vehicle matches
      const vy = String(vehicle.year);
      const yrs = getAvailYears(finalRows);
      if (yrs.includes(vy)) {
        setYear(vy);
        const mks = getAvailMakes(finalRows, vy);
        if (mks.includes(vehicle.make)) {
          setMake(vehicle.make);
          const mods = getAvailModels(finalRows, vy, vehicle.make);
          if (mods.includes(vehicle.model)) {
            setModel(vehicle.model);
            const trs = getAvailTrims(finalRows, vy, vehicle.make, vehicle.model);
            if (trs.length === 1) setTrim(trs[0]);
          }
        }
      }
    })();
  }, []);

  function onYearChange(y)  { setYear(y); setMake(""); setModel(""); setTrim(""); }
  function onMakeChange(mk) {
    setMake(mk); setModel(""); setTrim("");
    const mods = getAvailModels(rows, year, mk);
    if (mods.length === 1) {
      setModel(mods[0]);
      const trs = getAvailTrims(rows, year, mk, mods[0]);
      if (trs.length === 1) setTrim(trs[0]);
    }
  }
  function onModelChange(mod) {
    setModel(mod); setTrim("");
    const trs = getAvailTrims(rows, year, make, mod);
    if (trs.length === 1) setTrim(trs[0]);
  }

  async function submit(e) {
    e.preventDefault(); setErr(""); setSub(true);
    if (!year || !make || !model || !trim) { setErr("Please select all four fields."); setSub(false); return; }
    const sbRaw = await sbFetchSchedule(year, make, model, trim);
    const raw = sbRaw || localSchedule(year, make, model);
    setSub(false);
    if (!raw) { setErr("No schedule found for this vehicle."); return; }
    onSuccess({ trim, apiSchedule: parseApiData(raw), scheduleSource: sbRaw ? "supabase" : "local" });
  }

  const sel = "select-field";
  const lbl = "input-label";
  const availYears  = rows ? getAvailYears(rows) : [];
  const availMakes  = rows ? getAvailMakes(rows, year) : [];
  const availModels = rows ? getAvailModels(rows, year, make) : [];
  const availTrims  = rows ? getAvailTrims(rows, year, make, model) : [];

  return (
    <div className="modal-backdrop" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal max-w-sm max-h-screen overflow-y-auto anim-modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header sticky top-0 z-10" style={{background:'var(--bg-surface)'}}>
          <div className="flex items-center gap-2.5">
            <div className="modal-icon accent"><SparkleIcon size={16} className="text-white"/></div>
            <div>
              <h2 className="text-heading text-sm">OEM Maintenance Schedule</h2>
              <p className="text-xs" style={{color:'var(--text-muted)'}}>{loading ? "Connecting to database…" : (sbUsed ? "Live from Supabase" : "Using local database")}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon"><XIcon size={18}/></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className={`alert text-xs ${sbUsed ? "alert-success" : "alert-info"}`}>
            {loading ? "Loading vehicle options…" : (sbUsed ? "Connected to Supabase — live data" : "Supabase unavailable — using local database fallback")}
          </div>

          {/* Year */}
          <div>
            <label className={lbl}>Year <span style={{color:'var(--status-overdue)'}}>*</span></label>
            <select value={year} onChange={e=>onYearChange(e.target.value)} disabled={loading} className={sel}>
              <option value="">{loading ? "Loading…" : "Select year"}</option>
              {availYears.map(y=><option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {/* Make */}
          <div>
            <label className={lbl}>Make <span style={{color:'var(--status-overdue)'}}>*</span></label>
            <select value={make} onChange={e=>onMakeChange(e.target.value)} disabled={!year} className={sel}>
              <option value="">{year ? "Select make" : "Select a year first"}</option>
              {availMakes.map(m=><option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          {/* Model */}
          <div>
            <label className={lbl}>Model <span style={{color:'var(--status-overdue)'}}>*</span></label>
            <select value={model} onChange={e=>onModelChange(e.target.value)} disabled={!make} className={sel}>
              <option value="">{make ? "Select model" : "Select a make first"}</option>
              {availModels.map(m=><option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          {/* Trim */}
          <div>
            <label className={lbl}>Trim <span style={{color:'var(--status-overdue)'}}>*</span></label>
            <select value={trim} onChange={e=>setTrim(e.target.value)} disabled={!model} className={sel}>
              <option value="">{model ? "Select trim" : "Select a model first"}</option>
              {availTrims.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {err && <div className="alert alert-error text-xs">{err}</div>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose}
              className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={!trim || submitting}
              className="btn btn-primary flex-1">
              {submitting ? <><SpinnerIcon size={14}/> Loading…</> : <><SparkleIcon size={14}/> Load Schedule</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── ADD VEHICLE MODAL ───────────────────────────────────────────
function AddVehicleModal({onAdd,onClose}) {
  const [rows,     setRows]    = useState(null);
  const [loadingOpts, setLoadingOpts] = useState(true);
  const [year,    setYear]    = useState("");
  const [make,    setMake]    = useState("");
  const [model,   setModel]   = useState("");
  const [trim,    setTrim]    = useState("");
  const [mileage, setMileage] = useState("");
  const [nickname,setNick]    = useState("");
  const [err,     setErr]     = useState("");
  const [submitting, setSub]  = useState(false);

  useEffect(() => {
    (async () => {
      const sbRows = await sbFetchVehicleOptions();
      setRows(sbRows || localVehicleRows());
      setLoadingOpts(false);
    })();
  }, []);

  function onYearChange(y)  { setYear(y); setMake(""); setModel(""); setTrim(""); }
  function onMakeChange(mk) {
    setMake(mk); setModel(""); setTrim("");
    const mods = getAvailModels(rows, year, mk);
    if (mods.length === 1) {
      setModel(mods[0]);
      const trs = getAvailTrims(rows, year, mk, mods[0]);
      if (trs.length === 1) setTrim(trs[0]);
    }
  }
  function onModelChange(mod) {
    setModel(mod); setTrim("");
    const trs = getAvailTrims(rows, year, make, mod);
    if (trs.length === 1) setTrim(trs[0]);
  }

  const availYears  = rows ? getAvailYears(rows) : [];
  const availMakes  = rows ? getAvailMakes(rows, year) : [];
  const availModels = rows ? getAvailModels(rows, year, make) : [];
  const availTrims  = rows ? getAvailTrims(rows, year, make, model) : [];

  async function submit(e) {
    e.preventDefault();
    if (!year||!make||!model||!trim||mileage==="") { setErr("Please fill in all required fields."); return; }
    const mi = parseInt(mileage, 10);
    if (isNaN(mi)||mi<0) { setErr("Enter a valid mileage."); return; }
    setErr(""); setSub(true);
    const sbRaw2 = await sbFetchSchedule(year, make, model, trim);
    const raw = sbRaw2 || localSchedule(year, make, model);
    setSub(false);
    const apiSchedule = raw ? parseApiData(raw) : null;
    onAdd({ id:uid(), year, make, model, trim, nickname:nickname.trim(),
            currentMileage:mi, serviceLogs:[], vin:"", apiSchedule, scheduleSource: sbRaw2 ? "supabase" : "local", apiError:"" });
    onClose();
  }

  const lbl = "input-label";
  const sel = "select-field";
  const inp = "input-field";

  return (
    <div className="modal-backdrop" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal max-w-md max-h-screen overflow-y-auto anim-modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header sticky top-0 z-10" style={{background:'var(--bg-surface)'}}>
          <div className="flex items-center gap-2.5">
            <div className="modal-icon accent"><CarIcon size={16} className="text-white"/></div>
            <h2 className="text-heading text-lg">Add Vehicle</h2>
          </div>
          <button onClick={onClose} className="btn-icon"><XIcon size={18}/></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          {err && <div className="alert alert-error text-sm">{err}</div>}

          {/* Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Year <span style={{color:'var(--status-overdue)'}}>*</span></label>
              <select value={year} onChange={e=>onYearChange(e.target.value)} disabled={loadingOpts} className={sel}>
                <option value="">{loadingOpts ? "Loading…" : "Select year"}</option>
                {availYears.map(y=><option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            {/* Make */}
            <div>
              <label className={lbl}>Make <span style={{color:'var(--status-overdue)'}}>*</span></label>
              <select value={make} onChange={e=>onMakeChange(e.target.value)} disabled={!year||loadingOpts} className={sel}>
                <option value="">{year ? "Select make" : "Year first"}</option>
                {availMakes.map(m=><option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Model */}
          <div>
            <label className={lbl}>Model <span style={{color:'var(--status-overdue)'}}>*</span></label>
            <select value={model} onChange={e=>onModelChange(e.target.value)} disabled={!make} className={sel}>
              <option value="">{make ? "Select model" : "Select a make first"}</option>
              {availModels.map(m=><option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Trim */}
          <div>
            <label className={lbl}>Trim <span style={{color:'var(--status-overdue)'}}>*</span></label>
            <select value={trim} onChange={e=>setTrim(e.target.value)} disabled={!model} className={sel}>
              <option value="">{model ? "Select trim" : "Select a model first"}</option>
              {availTrims.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Mileage */}
          <div>
            <label className={lbl}>Current Mileage <span style={{color:'var(--status-overdue)'}}>*</span></label>
            <input type="number" min="0" placeholder="e.g. 45000" value={mileage} onChange={e=>setMileage(e.target.value)} className={inp}/>
          </div>

          {/* Nickname */}
          <div>
            <label className={lbl}>Nickname <span style={{color:'var(--text-muted)'}}>(optional)</span></label>
            <input type="text" placeholder="e.g. My Daily Driver" value={nickname} onChange={e=>setNick(e.target.value)} className={inp}/>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={!trim||submitting}
              className="btn btn-primary flex-1">
              {submitting ? <><SpinnerIcon size={14}/> Fetching…</> : "Add Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── LOG SERVICE MODAL ───────────────────────────────────────────
function LogServiceModal({service,currentMileage,onLog,onClose}) {
  const today = new Date().toISOString().split("T")[0];
  const [date,setDate]   = useState(today);
  const [mi,setMi]       = useState(String(currentMileage));
  const [notes,setNotes] = useState("");
  const [err,setErr]     = useState("");
  function submit(e){e.preventDefault();const miles=parseInt(mi,10);if(isNaN(miles)||miles<0){setErr("Enter a valid mileage.");return;}onLog({id:uid(),serviceId:service.id,serviceName:service.name,date,mileage:miles,notes:notes.trim()});onClose();}
  const inp="input-field";
  const lbl="input-label";
  return (
    <div className="modal-backdrop" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal max-w-sm anim-modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2"><div className="modal-icon success"><WrenchIcon size={16} className="text-white"/></div><div><h2 className="text-heading text-sm">Log Service</h2><p className="text-xs" style={{color:'var(--text-muted)'}}>{service.name}</p></div></div>
          <button onClick={onClose} className="btn-icon"><XIcon size={18}/></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          {err&&<div className="alert alert-error text-sm">{err}</div>}
          <div><label className={lbl}>Service Date</label><input type="date" value={date} max={today} onChange={e=>setDate(e.target.value)} className={inp}/></div>
          <div><label className={lbl}>Mileage at Service</label><input type="number" min="0" value={mi} onChange={e=>setMi(e.target.value)} className={inp}/></div>
          <div><label className={lbl}>Notes <span style={{color:'var(--text-muted)'}}>(optional)</span></label><textarea rows={2} placeholder="Shop name, cost, parts used..." value={notes} onChange={e=>setNotes(e.target.value)} className={`${inp} resize-none`}/></div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn btn-success flex-1">Log Service</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── 2FA SETUP MODAL ─────────────────────────────────────────────
function TwoFASetupModal({ userEmail, uid, onEnabled, onClose }) {
  const [secret]         = useState(() => newTotpSecret());
  const [step, setStep]  = useState("scan");   // "scan" | "verify"
  const [code, setCode]  = useState("");
  const [err,  setErr]   = useState("");
  const [busy, setBusy]  = useState(false);
  const uri = totpUri(secret, userEmail);

  async function confirm(e) {
    e.preventDefault(); setErr(""); setBusy(true);
    const ok = await verifyTotp(secret, code);
    setBusy(false);
    if (!ok) { setErr("Incorrect code — make sure your phone's time is synced and try again."); return; }
    await save2FA(uid, { enabled: true, secret });
    onEnabled({ enabled: true, secret });
  }

  return (
    <div className="modal-backdrop" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal max-w-sm anim-modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2.5">
            <div className="modal-icon accent"><ShieldIcon size={16} className="text-white"/></div>
            <div>
              <h2 className="text-heading text-sm">Set Up Two-Factor Auth</h2>
              <p className="text-xs" style={{color:'var(--text-muted)'}}>Step {step === "scan" ? "1" : "2"} of 2</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon"><XIcon size={18}/></button>
        </div>

        {step === "scan" && (
          <div className="p-5 space-y-4">
            <p className="text-sm" style={{color:'var(--text-secondary)'}}>Open <strong>Google Authenticator</strong> (or any TOTP app), tap the <strong>+</strong> button, and scan this QR code:</p>
            <QRCodeView value={uri} size={180}/>
            <div>
              <p className="text-xs font-medium mb-1" style={{color:'var(--text-muted)'}}>Can't scan? Enter this key manually:</p>
              <div className="secret-display">
                {fmtSecret(secret)}
              </div>
              <p className="text-xs mt-1 text-center" style={{color:'var(--text-muted)'}}>Account: AutoTrax · Type: Time-based</p>
            </div>
            <button onClick={() => setStep("verify")}
              className="btn btn-primary btn-block">
              I've added it → Next
            </button>
          </div>
        )}

        {step === "verify" && (
          <form onSubmit={confirm} className="p-5 space-y-4">
            <p className="text-sm" style={{color:'var(--text-secondary)'}}>Enter the <strong>6-digit code</strong> from Google Authenticator to confirm setup:</p>
            <div>
              <input autoFocus type="text" inputMode="numeric" maxLength={6} placeholder="000000"
                value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,""))} className="code-input"/>
              {err && <p className="text-xs mt-2" style={{color:'var(--status-overdue)'}}>{err}</p>}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setStep("scan"); setCode(""); setErr(""); }}
                className="btn btn-secondary flex-1">
                ← Back
              </button>
              <button type="submit" disabled={busy || code.length < 6}
                className="btn btn-primary flex-1">
                {busy ? <><SpinnerIcon size={14}/> Verifying…</> : <><ShieldIcon size={14}/> Enable 2FA</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── 2FA DISABLE MODAL ───────────────────────────────────────────
function TwoFADisableModal({ uid, secret, onDisabled, onClose }) {
  const [code, setCode] = useState("");
  const [err,  setErr]  = useState("");
  const [busy, setBusy] = useState(false);
  async function confirm(e) {
    e.preventDefault(); setErr(""); setBusy(true);
    const ok = await verifyTotp(secret, code);
    setBusy(false);
    if (!ok) { setErr("Incorrect code. Please try again."); return; }
    await save2FA(uid, { enabled: false });
    onDisabled();
  }

  return (
    <div className="modal-backdrop" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="modal max-w-sm anim-modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2.5">
            <div className="modal-icon danger"><ShieldIcon size={16} className="text-white"/></div>
            <h2 className="text-heading text-sm">Disable Two-Factor Auth</h2>
          </div>
          <button onClick={onClose} className="btn-icon"><XIcon size={18}/></button>
        </div>
        <form onSubmit={confirm} className="p-5 space-y-4">
          <p className="text-sm" style={{color:'var(--text-secondary)'}}>Enter your current <strong>6-digit code</strong> from Google Authenticator to confirm:</p>
          <div>
            <input autoFocus type="text" inputMode="numeric" maxLength={6} placeholder="000000"
              value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,""))} className="code-input"/>
            {err && <p className="text-xs mt-2" style={{color:'var(--status-overdue)'}}>{err}</p>}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose}
              className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={busy || code.length < 6}
              className="btn btn-danger flex-1">
              {busy ? <><SpinnerIcon size={14}/> Verifying…</> : "Disable 2FA"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── 2FA VERIFY MODAL (shown at login) ───────────────────────────
function TwoFAVerifyScreen({ secret, onVerified, onCancel }) {
  const [code, setCode] = useState("");
  const [err,  setErr]  = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault(); setErr(""); setBusy(true);
    const ok = await verifyTotp(secret, code);
    setBusy(false);
    if (!ok) { setErr("Incorrect code. Check your authenticator app and try again."); setCode(""); return; }
    onVerified();
  }

  return (
    <div className="screen-bg">
      <div className="w-full max-w-sm anim-slide-up">
        <div className="text-center mb-8">
          <div className="logo-icon lg mx-auto mb-3">
            <ShieldIcon size={28} className="text-white"/>
          </div>
          <h1 className="text-heading text-2xl">Two-Factor Auth</h1>
          <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>Check Google Authenticator for your code</p>
        </div>
        <div className="auth-card">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="input-label">6-Digit Code</label>
              <input autoFocus type="text" inputMode="numeric" maxLength={6} placeholder="000 000"
                value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,""))}
                className="code-input"/>
            </div>
            {err && <div className="alert alert-error">{err}</div>}
            <button type="submit" disabled={busy || code.length < 6}
              className="btn btn-primary btn-block">
              {busy ? <><SpinnerIcon size={14}/> Verifying…</> : <><ShieldIcon size={14}/> Verify & Sign In</>}
            </button>
          </form>
          <button onClick={onCancel} className="mt-4 w-full text-center text-xs transition-colors" style={{color:'var(--text-muted)'}}>
            Sign out and use a different account
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── APP CONTENT (main app, shown after auth) ────────────────────
function AppContent({ user, onLogout }) {
  // When running offline (no Supabase or no user), read localStorage synchronously
  // inside the useState initializer so there is never a blank loading flash.
  const isOffline = !window.SB_READY || !user;

  function readLocalVehicles() {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); } catch { return []; }
  }

  const [vehicles,  setVehicles]   = useState(() => isOffline ? readLocalVehicles() : []);
  const [dataLoaded,setDataLoaded] = useState(isOffline); // offline = already loaded
  const [activeId,  setActiveId]   = useState(() => {
    if (!isOffline) return null;
    const vs = readLocalVehicles();
    return vs.length > 0 ? vs[0].id : null;
  });
  const [showAdd,   setShowAdd]    = useState(false);
  const [logModal,  setLogModal]   = useState(null);
  const [fetchModal,setFetchModal] = useState(false);
  const [tab,       setTab]        = useState("schedule");
  const [catFilter, setCat]        = useState("All");
  const [stFilter,  setSt]         = useState("All");
  const [showUser,      setShowUser]      = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [twoFAData,     setTwoFAData]     = useState(null);   // null = loading
  // Persist 2FA verification across refreshes within the same browser session
  const _2FA_SESSION_KEY = "autolog_2fa_session";
  const [twoFAVerified, _setTwoFAVerified] = useState(() => sessionStorage.getItem(_2FA_SESSION_KEY) === "true");
  function setTwoFAVerified(val) {
    if (val) sessionStorage.setItem(_2FA_SESSION_KEY, "true");
    else sessionStorage.removeItem(_2FA_SESSION_KEY);
    _setTwoFAVerified(val);
  }
  const [showTwoFASetup,setShowTwoFASetup]= useState(false);
  const [showTwoFAOff,  setShowTwoFAOff] = useState(false);

  // Load from Supabase only when in cloud mode
  useEffect(() => {
    if (isOffline) {
      // Offline: load 2FA data synchronously from localStorage
      load2FA(null).then(d => setTwoFAData(d));
      return;
    }

    // Safety timeout — if Supabase hangs for any reason (e.g. not set up yet),
    // show the app after 6 seconds rather than staying stuck on loading screen.
    const giveUp = setTimeout(() => { setDataLoaded(true); setTwoFAData({ enabled: false }); }, 6000);

    Promise.all([loadVehicles(user.id), load2FA(user.id)])
      .then(([vs, fa]) => {
        clearTimeout(giveUp);
        setVehicles(vs);
        setActiveId(vs.length > 0 ? vs[0].id : null);
        setTwoFAData(fa);
        setDataLoaded(true);
      })
      .catch(() => {
        clearTimeout(giveUp);
        setTwoFAData({ enabled: false });
        setDataLoaded(true);
      });

    return () => clearTimeout(giveUp);
  }, []);

  // Debounced save whenever vehicles change
  const saveTimer = useRef(null);
  useEffect(() => {
    if (!dataLoaded) return;
    clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(async () => {
      await saveVehicles(user ? user.id : null, vehicles);
      setSaving(false);
    }, 800);
    return () => clearTimeout(saveTimer.current);
  }, [vehicles, dataLoaded]);

  // ALL hooks must come before any early return — Rules of Hooks
  const vehicle    = vehicles.find(v => v.id === activeId) || null;
  const schedule   = vehicle
    ? (vehicle.apiSchedule?.length > 0 ? vehicle.apiSchedule : getBuiltinSchedule(vehicle.make))
    : [];
  const isApiSched = !!(vehicle?.apiSchedule?.length);

  const statuses = useMemo(() => {
    if (!vehicle) return {};
    return Object.fromEntries(schedule.map(item => [item.id, getStatus(item, vehicle.currentMileage, vehicle.serviceLogs)]));
  }, [vehicle, schedule]);

  const stats = useMemo(() => {
    if (!vehicle) return null;
    const all = schedule.map(item => statuses[item.id]);
    return {
      overdue: all.filter(s => s.status === "overdue").length,
      soon:    all.filter(s => s.status === "soon").length,
      good:    all.filter(s => s.status === "good").length,
    };
  }, [vehicle, schedule, statuses]);

  // Now safe to early-return — all hooks have been called above
  if (!dataLoaded || twoFAData === null) return <LoadingScreen message="Loading your vehicles…"/>;

  // 2FA gate — if enabled and not yet verified this session, show verify screen
  if (twoFAData.enabled && !twoFAVerified) {
    return (
      <TwoFAVerifyScreen
        secret={twoFAData.secret}
        onVerified={() => setTwoFAVerified(true)}
        onCancel={() => {
          setTwoFAVerified(false);
          if (window.SB_READY && window.sbClient) window.sbClient.auth.signOut();
          onLogout();
        }}
      />
    );
  }

  function addVehicle(v)     { setVehicles(p => [...p, v]); setActiveId(v.id); setTab("schedule"); }
  function removeVehicle(id) { const u = vehicles.filter(v => v.id !== id); setVehicles(u); if (activeId === id) setActiveId(u[0]?.id || null); }
  function updateMileage(id, m) { setVehicles(p => p.map(v => v.id === id ? {...v, currentMileage: m} : v)); }
  function logService(entry) { setVehicles(p => p.map(v => v.id === activeId ? {...v, serviceLogs: [...v.serviceLogs, entry]} : v)); }
  function deleteLog(logId)  { setVehicles(p => p.map(v => v.id === activeId ? {...v, serviceLogs: v.serviceLogs.filter(l => l.id !== logId)} : v)); }
  function applyApiSchedule({vin, trim, apiSchedule, scheduleSource}) {
    setVehicles(p => p.map(v => v.id === activeId ? {...v, vin, trim, apiSchedule, scheduleSource: scheduleSource || v.scheduleSource, apiError: ""} : v));
    setFetchModal(false);
  }

  const filtered = schedule.filter(item => {
    const catOk = catFilter === "All" || item.category === catFilter;
    const s = statuses[item.id]?.status || "unknown";
    const stOk = stFilter === "All" || s === stFilter.toLowerCase();
    return catOk && stOk;
  });

  function sidebarStats(v) {
    const sch = v.apiSchedule?.length ? v.apiSchedule : getBuiltinSchedule(v.make);
    const sts = sch.map(item => getStatus(item, v.currentMileage, v.serviceLogs));
    return {od: sts.filter(s => s.status === "overdue").length, sn: sts.filter(s => s.status === "soon").length};
  }

  const isCloud    = window.SB_READY && user;
  // Show whatever the user logged in with (username or email)
  const loginDisplayId = sessionStorage.getItem("autolog_login_id") || user?.email || "";
  const userEmail  = user?.email || "";
  const userInitial = loginDisplayId ? loginDisplayId[0].toUpperCase() : "?";

  return (
    <div className="app-shell">

      {/* Mobile sidebar backdrop */}
      {menuOpen && <div className="fixed inset-0 bg-black bg-opacity-60 z-30 md:hidden" onClick={()=>setMenuOpen(false)}/>}

      {/* SIDEBAR */}
      <aside className={`sidebar ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* App header */}
        <div className="sidebar-header">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="logo-icon"><CarIcon size={20} className="text-white"/></div>
              <div>
                <div className="text-heading text-sm">AutoTrax</div>
                <div className="text-xs flex items-center gap-1" style={{color:'var(--text-muted)'}}>
                  {isCloud
                    ? <><CloudIcon size={10} style={{color:'var(--accent)'}}/> Cloud sync</>
                    : "Local storage"
                  }
                  {saving && <SpinnerIcon size={10} style={{color:'var(--text-muted)'}} className="ml-1"/>}
                </div>
              </div>
            </div>
            <button onClick={()=>setMenuOpen(false)} className="md:hidden btn-icon"><XIcon size={18}/></button>
          </div>
        </div>

        {/* Vehicle list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {vehicles.length === 0 && <p className="text-xs text-center mt-8 px-2 leading-relaxed" style={{color:'var(--text-muted)'}}>No vehicles yet. Add your first car to get started.</p>}
          {vehicles.map(v => {
            const {od, sn} = sidebarStats(v);
            const isActive = v.id === activeId;
            return (
              <div key={v.id} onClick={() => { setActiveId(v.id); setMenuOpen(false); }}
                className={`sidebar-item${isActive ? " active" : ""}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{color: isActive ? '#fff' : 'var(--text-primary)'}}>{v.nickname || `${v.year} ${v.make}`}</div>
                    <div className="text-xs truncate" style={{color: isActive ? 'var(--accent-light)' : 'var(--text-muted)'}}>{v.model} · {v.currentMileage.toLocaleString()} mi</div>
                    {v.apiSchedule?.length > 0 && <div className="text-xs mt-0.5" style={{color: isActive ? 'var(--accent-light)' : 'var(--accent)'}}>✦ OEM Data</div>}
                  </div>
                  <button onClick={e => {e.stopPropagation(); removeVehicle(v.id);}}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded" style={{color: isActive ? 'var(--accent-light)' : 'var(--text-muted)'}}>
                    <TrashIcon size={12}/>
                  </button>
                </div>
                {(od > 0 || sn > 0) && <div className="flex gap-1 mt-2 flex-wrap">
                  {od > 0 && <span className="sidebar-badge overdue">{od} overdue</span>}
                  {sn > 0 && <span className="sidebar-badge soon">{sn} due soon</span>}
                </div>}
              </div>
            );
          })}
        </div>

        {/* Add vehicle button */}
        <div className="sidebar-footer">
          <button onClick={() => { setShowAdd(true); setMenuOpen(false); }} className="btn btn-primary btn-block">
            <PlusIcon size={16}/> Add Vehicle
          </button>
        </div>

        {/* User account footer */}
        <div className="sidebar-footer">
          {isCloud ? (
            <div className="relative">
              <button onClick={() => setShowUser(p => !p)}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl transition-colors group" style={{color:'var(--text-primary)'}}>
                <div className="relative flex-shrink-0">
                  <div className="user-avatar">{userInitial}</div>
                  {twoFAData?.enabled && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{background:'var(--accent)'}}><ShieldIcon size={8} className="text-white"/></div>}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-xs font-medium truncate" style={{color:'var(--text-primary)'}}>{loginDisplayId}</div>
                  <div className="text-xs" style={{color:'var(--text-muted)'}}>{twoFAData?.enabled ? "2FA enabled" : "Signed in"}</div>
                </div>
                <UserIcon size={14} style={{color:'var(--text-muted)'}}/>
              </button>

              {showUser && (
                <div className="user-popover">
                  <div className="px-3 py-2" style={{borderBottom:'1px solid var(--border-default)'}}>
                    <div className="text-xs" style={{color:'var(--text-muted)'}}>Signed in as</div>
                    <div className="text-xs font-medium truncate" style={{color:'var(--text-primary)'}}>{loginDisplayId}</div>
                  </div>
                  {/* 2FA row */}
                  <div className="flex items-center justify-between px-3 py-2.5" style={{borderBottom:'1px solid var(--border-default)'}}>
                    <div className="flex items-center gap-2">
                      <ShieldIcon size={14} style={{color: twoFAData?.enabled ? 'var(--accent)' : 'var(--text-muted)'}}/>
                      <span className="text-xs font-medium" style={{color:'var(--text-secondary)'}}>2-Factor Auth</span>
                    </div>
                    {twoFAData?.enabled
                      ? <button onClick={() => { setShowUser(false); setShowTwoFAOff(true); }}
                          className="btn btn-primary btn-sm text-xs">
                          ON
                        </button>
                      : <button onClick={() => { setShowUser(false); setShowTwoFASetup(true); }}
                          className="btn btn-secondary btn-sm text-xs">
                          OFF
                        </button>
                    }
                  </div>
                  <button onClick={onLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors" style={{color:'var(--status-overdue)'}}>
                    <LogoutIcon size={14}/> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-xs" style={{color:'var(--text-muted)'}}>
                <UserIcon size={12}/> Local mode — no account
              </div>
              {!window.SB_READY && (
                <p className="text-xs leading-tight" style={{color:'var(--text-muted)'}}>Add Supabase config to enable cloud sync</p>
              )}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <ShieldIcon size={12} style={{color: twoFAData?.enabled ? 'var(--accent)' : 'var(--text-muted)'}}/>
                  <span className="text-xs" style={{color:'var(--text-muted)'}}>2FA</span>
                </div>
                {twoFAData?.enabled
                  ? <button onClick={() => setShowTwoFAOff(true)} className="btn btn-primary btn-sm text-xs">ON</button>
                  : <button onClick={() => setShowTwoFASetup(true)} className="btn btn-secondary btn-sm text-xs">OFF</button>
                }
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* Mobile top bar */}
        <div className="mobile-topbar">
          <button onClick={()=>setMenuOpen(true)} className="btn-icon flex-shrink-0">
            <MenuIcon size={20}/>
          </button>
          <div className="logo-icon sm"><CarIcon size={16} className="text-white"/></div>
          <div className="text-heading text-sm truncate flex-1">
            {vehicle ? (vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`) : "AutoTrax"}
          </div>
          {saving && <SpinnerIcon size={12} style={{color:'var(--text-muted)'}}/>}
        </div>
        {!vehicle ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative anim-fade-in">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{background:'var(--bg-surface)'}}><CarIcon size={36} style={{color:'var(--accent)'}}/></div>
            <h2 className="text-heading text-xl mb-2">Welcome to AutoTrax{isCloud && ", " + (loginDisplayId.includes("@") ? loginDisplayId.split("@")[0] : loginDisplayId)}!</h2>
            <p className="text-sm max-w-xs mb-6" style={{color:'var(--text-secondary)'}}>Add your vehicle to get a personalized maintenance schedule based on your car's make and mileage.</p>
            <button onClick={() => { setShowAdd(true); setMenuOpen(false); }} className="btn btn-primary">
              <PlusIcon size={18}/> Add Your First Vehicle
            </button>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <header className="main-header">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-heading text-lg sm:text-xl truncate">{vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}</h1>
                    {isApiSched
                      ? <span className="badge-oem"><SparkleIcon size={10}/> OEM Live Data</span>
                      : <span className="badge-source">Built-in</span>
                    }
                    {isApiSched && vehicle.scheduleSource === "supabase" && (
                      <span className="badge-source supabase">
                        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{background:'var(--status-good)'}}/> Supabase
                      </span>
                    )}
                    {isApiSched && vehicle.scheduleSource === "local" && (
                      <span className="badge-source local">
                        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{background:'var(--status-soon)'}}/> Local DB
                      </span>
                    )}
                    {isApiSched && !vehicle.scheduleSource && (
                      <span className="badge-source" title="Refresh OEM Schedule to identify source">
                        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{background:'var(--text-muted)'}}/> Source unknown
                      </span>
                    )}
                  </div>
                  {vehicle.nickname && <p className="text-sm" style={{color:'var(--text-secondary)'}}>{vehicle.year} {vehicle.make} {vehicle.model}</p>}
                  {vehicle.apiError && <p className="text-xs mt-0.5" style={{color:'var(--status-soon)'}}>⚠ {vehicle.apiError}</p>}
                  <MileageEditor value={vehicle.currentMileage} onSave={m => updateMileage(vehicle.id, m)}/>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {stats && <div className="flex gap-1.5 sm:gap-2">
                    {[
                      {label:"Overdue",   count:stats.overdue, cls:"stat-badge overdue"},
                      {label:"Due Soon",  count:stats.soon,    cls:"stat-badge soon"},
                      {label:"Good",      count:stats.good,    cls:"stat-badge good"},
                    ].map(({label,count,cls}) => (
                      <div key={label} className={cls}>
                        <div className="text-xl sm:text-2xl font-bold leading-tight">{count}</div>
                        <div className="text-xs font-medium whitespace-nowrap hidden sm:block">{label}</div>
                        <div className="text-xs font-medium whitespace-nowrap sm:hidden">{label.split(" ")[0]}</div>
                      </div>
                    ))}
                  </div>}
                  <button onClick={() => setFetchModal(true)}
                    className="btn btn-primary btn-sm">
                    <RefreshIcon size={12}/><span className="hidden sm:inline">{isApiSched ? "Refresh OEM Schedule" : "Fetch OEM Schedule"}</span><span className="sm:hidden">OEM</span>
                  </button>
                </div>
              </div>

              {/* TABS */}
              <div className="flex gap-1 mt-3 sm:mt-4">
                {[{id:"schedule",label:"Maintenance Schedule",shortLabel:"Schedule",Icon:WrenchIcon},{id:"history",label:"Service History",shortLabel:"History",Icon:HistoryIcon}].map(t=>(
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`tab-btn${tab === t.id ? " active" : ""}`}>
                    <t.Icon size={14}/><span className="hidden sm:inline"> {t.label}</span><span className="sm:hidden">{t.shortLabel}</span>
                  </button>
                ))}
              </div>
            </header>

            {/* SCHEDULE TAB */}
            {tab === "schedule" && (
              <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none" style={{scrollbarWidth:"none",msOverflowStyle:"none"}}>
                    <span className="text-xs font-medium flex-shrink-0" style={{color:'var(--text-muted)'}}>Category:</span>
                    {CATEGORIES.filter(c => c === "All" || schedule.some(s => s.category === c)).map(cat => (
                      <button key={cat} onClick={() => setCat(cat)}
                        className={`filter-chip${catFilter === cat ? " active" : ""}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 overflow-x-auto pb-1" style={{scrollbarWidth:"none",msOverflowStyle:"none"}}>
                    <span className="text-xs font-medium flex-shrink-0" style={{color:'var(--text-muted)'}}>Status:</span>
                    {["All","Overdue","Soon","Good","Unknown"].map(st => (
                      <button key={st} onClick={() => setSt(st)}
                        className={`filter-chip${stFilter === st ? " active" : ""}`}>
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  {filtered.length === 0 && <div className="text-center py-12 text-sm" style={{color:'var(--text-muted)'}}>No items match your filters.</div>}
                  {filtered.map(item => {
                    const s = statuses[item.id];
                    const sc = STATUS_CFG[s.status];
                    const pc = PRIORITY_CFG[item.priority];
                    return (
                      <div key={item.id} className={`service-row ${sc.cls} anim-slide-up`}>
                        {/* Mobile layout */}
                        <div className="flex items-start gap-3 sm:hidden">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${pc.dot}`}/>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                  <span className="text-sm font-semibold" style={{color:'var(--text-primary)'}}>{item.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                  <span className={`badge-category ${pc.cls}`}>{item.category}</span>
                                  {item.source === "api" && <span className="badge-oem">OEM</span>}
                                </div>
                                {item.note && <p className="text-xs truncate" style={{color:'var(--text-muted)'}}>{item.note}</p>}
                              </div>
                              <StatusBadge status={s.status}/>
                            </div>
                            <div className="mt-2"><ProgressBar pct={s.pct} status={s.status}/></div>
                            <div className="flex items-center justify-between mt-2 text-xs">
                              <div>
                                <span style={{color:'var(--text-muted)'}}>Remaining: </span>
                                <span className="font-bold" style={{color: s.status === "overdue" ? 'var(--status-overdue)' : s.status === "soon" ? 'var(--status-soon)' : 'var(--text-primary)'}}>
                                  {s.status === "overdue" ? `${fmtMi(Math.abs(s.remaining))} over` : s.remaining != null ? fmtMi(s.remaining) : "—"}
                                </span>
                              </div>
                              <button onClick={() => setLogModal({service: item})}
                                className="btn btn-success btn-sm">
                                <WrenchIcon size={12}/> Log
                              </button>
                            </div>
                          </div>
                        </div>
                        {/* Desktop layout */}
                        <div className="hidden sm:flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${pc.dot}`}/>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <span className="text-sm font-semibold" style={{color:'var(--text-primary)'}}>{item.name}</span>
                              <span className={`badge-category ${pc.cls}`}>{item.category}</span>
                              {item.source === "api" && <span className="badge-oem">OEM</span>}
                            </div>
                            {item.note && <p className="text-xs truncate" style={{color:'var(--text-muted)'}}>{item.note}</p>}
                            <div className="mt-2"><ProgressBar pct={s.pct} status={s.status}/></div>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0 text-xs">
                            <div className="text-center">
                              <div className="uppercase tracking-wide mb-0.5" style={{color:'var(--text-muted)'}}>Interval</div>
                              <div className="font-semibold" style={{color:'var(--text-primary)'}}>{fmtMi(item.interval)}</div>
                            </div>
                            <div className="text-center">
                              <div className="uppercase tracking-wide mb-0.5" style={{color:'var(--text-muted)'}}>Last Done</div>
                              <div className="font-semibold" style={{color:'var(--text-primary)'}}>{s.lastMi != null ? fmtMi(s.lastMi) : "Never"}</div>
                              {s.lastLog && <div style={{color:'var(--text-muted)'}}>{fmtDate(s.lastLog.date)}</div>}
                            </div>
                            <div className="text-center">
                              <div className="uppercase tracking-wide mb-0.5" style={{color:'var(--text-muted)'}}>Due At</div>
                              <div className="font-semibold" style={{color:'var(--text-primary)'}}>{fmtMi(s.dueAt)}</div>
                            </div>
                            <div className="text-center min-w-24">
                              <div className="uppercase tracking-wide mb-0.5" style={{color:'var(--text-muted)'}}>Remaining</div>
                              <div className="font-bold" style={{color: s.status === "overdue" ? 'var(--status-overdue)' : s.status === "soon" ? 'var(--status-soon)' : 'var(--text-primary)'}}>
                                {s.status === "overdue" ? `${fmtMi(Math.abs(s.remaining))} overdue` : s.remaining != null ? fmtMi(s.remaining) : "—"}
                              </div>
                            </div>
                            <StatusBadge status={s.status}/>
                            <button onClick={() => setLogModal({service: item})}
                              className="btn btn-success btn-sm whitespace-nowrap">
                              <WrenchIcon size={12}/> Log
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* HISTORY TAB */}
            {tab === "history" && (
              <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                {vehicle.serviceLogs.length === 0 ? (
                  <div className="text-center py-16" style={{color:'var(--text-muted)'}}>
                    <HistoryIcon size={40} className="mx-auto mb-3 opacity-30"/>
                    <p className="text-sm">No service logs yet.</p>
                    <p className="text-xs mt-1">Use the Log button on the Maintenance Schedule tab.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[...vehicle.serviceLogs].sort((a,b) => b.mileage - a.mileage).map(log => (
                      <div key={log.id} className="history-row anim-slide-up">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:'var(--bg-surface)'}}><CheckIcon size={16} style={{color:'var(--status-good)'}}/></div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold" style={{color:'var(--text-primary)'}}>{log.serviceName}</div>
                            {log.notes && <div className="text-xs mt-0.5 truncate" style={{color:'var(--text-muted)'}}>{log.notes}</div>}
                            {/* Mobile: date + mileage inline */}
                            <div className="sm:hidden flex items-center gap-3 mt-1 text-xs" style={{color:'var(--text-muted)'}}>
                              <span>{fmtDate(log.date)}</span>
                              <span>·</span>
                              <span>{log.mileage.toLocaleString()} mi</span>
                            </div>
                          </div>
                          {/* Desktop: separate columns */}
                          <div className="hidden sm:flex items-center gap-6 text-xs flex-shrink-0">
                            <div className="text-center"><div className="uppercase tracking-wide mb-0.5" style={{color:'var(--text-muted)'}}>Date</div><div className="font-semibold" style={{color:'var(--text-primary)'}}>{fmtDate(log.date)}</div></div>
                            <div className="text-center"><div className="uppercase tracking-wide mb-0.5" style={{color:'var(--text-muted)'}}>Mileage</div><div className="font-semibold" style={{color:'var(--text-primary)'}}>{log.mileage.toLocaleString()} mi</div></div>
                          </div>
                          <button onClick={() => deleteLog(log.id)} className="btn-icon" style={{color:'var(--text-muted)'}}><TrashIcon size={14}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* MODALS */}
      {showAdd    && <AddVehicleModal onAdd={addVehicle} onClose={() => setShowAdd(false)}/>}
      {logModal   && <LogServiceModal service={logModal.service} currentMileage={vehicle.currentMileage} onLog={logService} onClose={() => setLogModal(null)}/>}
      {fetchModal && vehicle && <FetchScheduleModal vehicle={vehicle} onSuccess={applyApiSchedule} onClose={() => setFetchModal(false)}/>}
      {showTwoFASetup && (
        <TwoFASetupModal
          userEmail={userEmail || "user"}
          uid={user?.id || null}
          onEnabled={d => { setTwoFAData(d); setTwoFAVerified(true); setShowTwoFASetup(false); }}
          onClose={() => setShowTwoFASetup(false)}
        />
      )}
      {showTwoFAOff && twoFAData?.enabled && (
        <TwoFADisableModal
          uid={user?.id || null}
          secret={twoFAData.secret}
          onDisabled={() => { setTwoFAData({ enabled: false }); setShowTwoFAOff(false); }}
          onClose={() => setShowTwoFAOff(false)}
        />
      )}
    </div>
  );
}

// ─── ROOT APP (handles auth gate) ────────────────────────────────
function App() {
  // undefined = checking auth, null = not logged in, User object = logged in
  const [user, setUser] = useState(window.SB_READY ? undefined : null);

  // When Supabase is not configured: show the setup screen every time until
  // the user actually configures Supabase. "Continue offline" only skips it
  // for the current session — next reload it will appear again.
  const [setupDone, setSetupDone] = useState(window.SB_READY);

  // Listen for Supabase auth state changes (login, logout, token refresh)
  useEffect(() => {
    if (!window.SB_READY) return;
    // Check current session on mount
    window.sbClient.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
    // Subscribe to future auth changes
    const { data: { subscription } } = window.sbClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Still checking Supabase auth state
  if (user === undefined) return <LoadingScreen message="Checking account…"/>;

  // Supabase config not set up — show setup screen every session
  if (!window.SB_READY && !setupDone) return (
    <SetupScreen onContinueOffline={() => setSetupDone(true)}/>
  );

  // Supabase configured but not logged in — show auth screen
  if (window.SB_READY && !user) return (
    <AuthScreen onAuth={u => setUser(u)}/>
  );

  // Logged in (cloud) or offline (localStorage) — show app
  return (
    <AppContent
      user={user}
      onLogout={() => {
        sessionStorage.removeItem("autolog_2fa_session");
        sessionStorage.removeItem("autolog_login_id");
        if (window.SB_READY && window.sbClient) window.sbClient.auth.signOut();
        setUser(null);
      }}
    />
  );
}

// ─── ERROR BOUNDARY ──────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(err) { return { error: err }; }
  render() {
    if (!this.state.error) return this.props.children;
    const msg = this.state.error?.message || String(this.state.error);
    return (
      <div className="screen-bg">
        <div className="auth-card text-center anim-slide-up" style={{maxWidth:'28rem'}}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{background:'rgba(239,68,68,0.15)'}}>
            <AlertIcon size={24} style={{color:'var(--status-overdue)'}}/>
          </div>
          <h2 className="text-heading text-lg mb-2">Something went wrong</h2>
          <p className="text-sm mb-4" style={{color:'var(--text-secondary)'}}>
            There was an error loading AutoTrax. This can happen if the Supabase database isn't set up yet, or if your account session expired.
          </p>
          <div className="rounded-lg px-4 py-3 text-xs font-mono text-left mb-5 break-all" style={{background:'var(--bg-deep)',color:'var(--text-secondary)',border:'1px solid var(--border-default)'}}>
            {msg}
          </div>
          <div className="flex gap-2">
            <button onClick={() => { if(window.SB_READY && window.sbClient) window.sbClient.auth.signOut(); window.location.reload(); }}
              className="btn btn-primary flex-1">
              Sign Out &amp; Retry
            </button>
            <button onClick={() => window.location.reload()}
              className="btn btn-secondary flex-1">
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary><App/></ErrorBoundary>
);
