-- VVDT core PostgreSQL schema
-- Designed for daily KPI capture, validation, weighted scoring, reporting, and auditability.

CREATE TABLE roles (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(32) UNIQUE NOT NULL,
  name VARCHAR(80) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE role_module_permissions (
  id BIGSERIAL PRIMARY KEY,
  role_id BIGINT NOT NULL REFERENCES roles(id),
  module_key VARCHAR(40) NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (role_id, module_key)
);

CREATE TABLE branches (
  sort_code VARCHAR(32) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  classification VARCHAR(20) NOT NULL CHECK (classification IN ('Small', 'Medium', 'Big')),
  zone_name VARCHAR(120) NOT NULL DEFAULT 'Coastal Zone',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO branches (sort_code, name, classification, zone_name) VALUES
  ('3396', 'Bagamoyo', 'Medium', 'Coastal Zone'),
  ('3339', 'Bunju', 'Small', 'Coastal Zone'),
  ('3340', 'Buza', 'Small', 'Coastal Zone'),
  ('3608', 'Chalinze', 'Small', 'Coastal Zone'),
  ('3385', 'Dar Village', 'Big', 'Coastal Zone'),
  ('3603', 'Ikwiriri', 'Small', 'Coastal Zone'),
  ('4222', 'JN Hydropower', 'Small', 'Coastal Zone'),
  ('3364', 'Kibaha', 'Big', 'Coastal Zone'),
  ('3330', 'Kinondoni', 'Small', 'Coastal Zone'),
  ('3642', 'Kisarawe', 'Small', 'Coastal Zone'),
  ('3601', 'Mafia', 'Small', 'Coastal Zone'),
  ('4280', 'Magomeni', 'Small', 'Coastal Zone'),
  ('3351', 'Mbagala', 'Medium', 'Coastal Zone'),
  ('3358', 'Mbande', 'Small', 'Coastal Zone'),
  ('3362', 'Mbezi Beach', 'Medium', 'Coastal Zone'),
  ('3352', 'Mbezi Chini', 'Small', 'Coastal Zone'),
  ('3472', 'Michenzani Mall', 'Small', 'Coastal Zone'),
  ('3374', 'Mikocheni', 'Medium', 'Coastal Zone'),
  ('4294', 'Mkuranga', 'Small', 'Coastal Zone'),
  ('4286', 'Mlandizi', 'Small', 'Coastal Zone'),
  ('3304', 'Msasani', 'Small', 'Coastal Zone'),
  ('3356', 'Mtoni Kijichi', 'Small', 'Coastal Zone'),
  ('4288', 'Mwananyamala', 'Small', 'Coastal Zone'),
  ('4281', 'Mwenge', 'Medium', 'Coastal Zone'),
  ('3397', 'Oysterbay', 'Big', 'Coastal Zone'),
  ('4282', 'Pemba', 'Small', 'Coastal Zone'),
  ('4216', 'Tandika', 'Small', 'Coastal Zone'),
  ('3302', 'Tegeta', 'Big', 'Coastal Zone'),
  ('3355', 'Temeke', 'Medium', 'Coastal Zone'),
  ('3336', 'Temeke Taifa', 'Small', 'Coastal Zone'),
  ('3191', 'Wete', 'Medium', 'Coastal Zone'),
  ('3369', 'Zanzibar', 'Big', 'Coastal Zone');

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  staff_no VARCHAR(40) UNIQUE NOT NULL,
  full_name VARCHAR(160) NOT NULL,
  phone VARCHAR(40) UNIQUE NOT NULL,
  role_id BIGINT NOT NULL REFERENCES roles(id),
  branch_sort_code VARCHAR(32) REFERENCES branches(sort_code),
  staff_profile VARCHAR(40) CHECK (
    staff_profile IN ('MBB', 'RO', 'MCE', 'TL', 'Premier RM', 'SO', 'Freelancer', 'Digital Champion')
  ),
  supervisor_id BIGINT REFERENCES users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE branch_hierarchy (
  id BIGSERIAL PRIMARY KEY,
  branch_sort_code VARCHAR(32) NOT NULL REFERENCES branches(sort_code),
  bqa_id BIGINT REFERENCES users(id),
  bm_id BIGINT REFERENCES users(id),
  zbm_id BIGINT REFERENCES users(id),
  zm_id BIGINT REFERENCES users(id),
  effective_from DATE NOT NULL,
  effective_to DATE
);

CREATE TABLE kpis (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(40) UNIQUE NOT NULL,
  name VARCHAR(160) NOT NULL,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('Daily', 'Weekly', 'Monthly')),
  unit VARCHAR(40) NOT NULL,
  applies_to VARCHAR(20) NOT NULL CHECK (applies_to IN ('Individual', 'Branch', 'Both')),
  is_scored BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE targets (
  id BIGSERIAL PRIMARY KEY,
  kpi_id BIGINT NOT NULL REFERENCES kpis(id),
  branch_classification VARCHAR(20) CHECK (branch_classification IN ('Small', 'Medium', 'Big')),
  staff_profile VARCHAR(40),
  target_value NUMERIC(18, 2) NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE kpi_weights (
  id BIGSERIAL PRIMARY KEY,
  kpi_id BIGINT NOT NULL REFERENCES kpis(id),
  role_id BIGINT REFERENCES roles(id),
  branch_classification VARCHAR(20) CHECK (branch_classification IN ('Small', 'Medium', 'Big')),
  weight_percent NUMERIC(5, 2) NOT NULL CHECK (weight_percent >= 0 AND weight_percent <= 100),
  effective_from DATE NOT NULL,
  effective_to DATE,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE performance_entries (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  branch_sort_code VARCHAR(32) NOT NULL REFERENCES branches(sort_code),
  kpi_id BIGINT NOT NULL REFERENCES kpis(id),
  entry_date DATE NOT NULL,
  actual_value NUMERIC(18, 2) NOT NULL DEFAULT 0,
  deposit_value NUMERIC(18, 2),
  evidence_note TEXT,
  status VARCHAR(40) NOT NULL DEFAULT 'Submitted' CHECK (
    status IN (
      'Draft',
      'Submitted',
      'BQA Approved',
      'Returned with Comments',
      'Rejected',
      'Submitted to BM',
      'BM Approved',
      'BM Returned'
    )
  ),
  submitted_at TIMESTAMPTZ,
  validated_by BIGINT REFERENCES users(id),
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, kpi_id, entry_date)
);

CREATE TABLE entry_workflow_comments (
  id BIGSERIAL PRIMARY KEY,
  entry_id BIGINT NOT NULL REFERENCES performance_entries(id),
  actor_id BIGINT REFERENCES users(id),
  status VARCHAR(40) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE branch_reports (
  id BIGSERIAL PRIMARY KEY,
  branch_sort_code VARCHAR(32) NOT NULL REFERENCES branches(sort_code),
  report_date DATE NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Submitted to BM' CHECK (
    status IN ('Submitted to BM', 'BM Approved', 'BM Returned')
  ),
  bqa_comment TEXT,
  bm_comment TEXT,
  submitted_by BIGINT REFERENCES users(id),
  reviewed_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE branch_report_entries (
  branch_report_id BIGINT NOT NULL REFERENCES branch_reports(id),
  performance_entry_id BIGINT NOT NULL REFERENCES performance_entries(id),
  PRIMARY KEY (branch_report_id, performance_entry_id)
);

CREATE TABLE performance_scores (
  id BIGSERIAL PRIMARY KEY,
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('Staff', 'Branch', 'Segment', 'Zone')),
  entity_id BIGINT NOT NULL,
  score_date DATE NOT NULL,
  period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('Daily', 'Weekly', 'Monthly', 'Quarterly')),
  achievement_percent NUMERIC(7, 2) NOT NULL,
  weighted_score NUMERIC(7, 2) NOT NULL,
  final_index NUMERIC(7, 2) NOT NULL,
  category VARCHAR(40) NOT NULL,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reports (
  id BIGSERIAL PRIMARY KEY,
  report_type VARCHAR(40) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  generated_by BIGINT REFERENCES users(id),
  file_url TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_id BIGINT REFERENCES users(id),
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id BIGINT,
  before_data JSONB,
  after_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_entries_branch_date ON performance_entries(branch_sort_code, entry_date);
CREATE INDEX idx_entries_user_date ON performance_entries(user_id, entry_date);
CREATE INDEX idx_branch_reports_status ON branch_reports(branch_sort_code, status, report_date);
CREATE INDEX idx_scores_entity_period ON performance_scores(entity_type, entity_id, period_type, score_date);
CREATE INDEX idx_audit_actor_created ON audit_logs(actor_id, created_at);
