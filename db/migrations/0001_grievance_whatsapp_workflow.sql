ALTER TABLE grievances
  ADD COLUMN source ENUM('web', 'whatsapp', 'office') NOT NULL DEFAULT 'web' AFTER reference_number,
  ADD COLUMN whatsapp_number VARCHAR(20) NULL AFTER source,
  ADD COLUMN ward VARCHAR(50) NULL AFTER whatsapp_number,
  ADD COLUMN priority ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium' AFTER ward,
  ADD COLUMN ai_summary TEXT NULL AFTER priority,
  ADD COLUMN ai_category VARCHAR(80) NULL AFTER ai_summary,
  ADD COLUMN sla_due_at TIMESTAMP NULL AFTER ai_category,
  ADD COLUMN latest_update TEXT NULL AFTER sla_due_at;
