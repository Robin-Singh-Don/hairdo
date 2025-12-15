-- ============================================
-- SUPABASE APPOINTMENTS SCHEMA
-- ============================================
-- Complete database schema for appointment management
-- This replaces TempDB and enables real data persistence
-- ============================================

-- ============================================
-- 1. APPOINTMENTS TABLE
-- ============================================
-- Main table for storing all appointments

CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Customer Information
  customer_id UUID NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  
  -- Employee/Staff Information
  employee_id UUID NOT NULL,
  employee_name VARCHAR(255) NOT NULL,
  
  -- Business Information
  business_id UUID NOT NULL,
  
  -- Service Information
  service_id VARCHAR(100) NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  
  -- Appointment Timing
  date DATE NOT NULL, -- YYYY-MM-DD format
  start_time TIME NOT NULL, -- HH:MM format (24-hour)
  end_time TIME NOT NULL, -- HH:MM format (24-hour)
  duration INTEGER NOT NULL, -- Duration in minutes
  
  -- Appointment Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- Possible values: 'pending', 'confirmed', 'checked-in', 'in-service', 'completed', 'cancelled', 'no-show'
  
  -- Pricing
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  
  -- Additional Information
  notes TEXT,
  special_requests TEXT,
  
  -- Customer Feedback (after appointment)
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_review TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT valid_duration CHECK (duration > 0),
  CONSTRAINT valid_price CHECK (price >= 0)
);

-- ============================================
-- 2. INDEXES FOR PERFORMANCE
-- ============================================

-- Index for querying by business
CREATE INDEX IF NOT EXISTS idx_appointments_business_id ON appointments(business_id);
CREATE INDEX IF NOT EXISTS idx_appointments_business_date ON appointments(business_id, date);

-- Index for querying by employee
CREATE INDEX IF NOT EXISTS idx_appointments_employee_id ON appointments(employee_id);
CREATE INDEX IF NOT EXISTS idx_appointments_employee_date ON appointments(employee_id, date);

-- Index for querying by customer
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_date ON appointments(customer_id, date);

-- Index for querying by date
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_date_status ON appointments(date, status);

-- Index for querying by status
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_appointments_business_employee_date ON appointments(business_id, employee_id, date);

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can view all appointments for their business
CREATE POLICY "Owners can view business appointments"
  ON appointments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.user_type = 'owner'
      AND profiles.business_id = appointments.business_id
    )
  );

-- Policy: Employees can view their own appointments
CREATE POLICY "Employees can view their appointments"
  ON appointments
  FOR SELECT
  USING (
    employee_id IN (
      SELECT id FROM employees
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Customers can view their own appointments
CREATE POLICY "Customers can view their appointments"
  ON appointments
  FOR SELECT
  USING (
    customer_id = auth.uid()
  );

-- Policy: Owners can insert appointments for their business
CREATE POLICY "Owners can create appointments"
  ON appointments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.user_type = 'owner'
      AND profiles.business_id = appointments.business_id
    )
  );

-- Policy: Employees can create appointments (for walk-ins, etc.)
CREATE POLICY "Employees can create appointments"
  ON appointments
  FOR INSERT
  WITH CHECK (
    employee_id IN (
      SELECT id FROM employees
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Customers can create appointments
CREATE POLICY "Customers can create appointments"
  ON appointments
  FOR INSERT
  WITH CHECK (
    customer_id = auth.uid()
  );

-- Policy: Owners can update appointments for their business
CREATE POLICY "Owners can update business appointments"
  ON appointments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.user_type = 'owner'
      AND profiles.business_id = appointments.business_id
    )
  );

-- Policy: Employees can update their own appointments
CREATE POLICY "Employees can update their appointments"
  ON appointments
  FOR UPDATE
  USING (
    employee_id IN (
      SELECT id FROM employees
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Customers can update their own appointments (limited fields)
CREATE POLICY "Customers can update their appointments"
  ON appointments
  FOR UPDATE
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- Policy: Owners can delete appointments for their business
CREATE POLICY "Owners can delete business appointments"
  ON appointments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.user_type = 'owner'
      AND profiles.business_id = appointments.business_id
    )
  );

-- Policy: Employees can delete their own appointments (with restrictions)
CREATE POLICY "Employees can delete their appointments"
  ON appointments
  FOR DELETE
  USING (
    employee_id IN (
      SELECT id FROM employees
      WHERE user_id = auth.uid()
    )
    AND status IN ('pending', 'confirmed') -- Can only delete future appointments
  );

-- ============================================
-- 4. TRIGGERS FOR AUTO-UPDATE
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_appointments_updated_at_trigger
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_appointments_updated_at();

-- ============================================
-- 5. EMPLOYEES TABLE (if not exists)
-- ============================================
-- Table for storing employee/staff information

CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL,
  
  -- Employee Information
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  profile_image TEXT,
  
  -- Employee Details
  employee_id VARCHAR(100) UNIQUE, -- Employee ID/Code
  position VARCHAR(100),
  role VARCHAR(50) DEFAULT 'employee',
  
  -- Compensation
  hourly_rate DECIMAL(10, 2) DEFAULT 0.00,
  commission_rate DECIMAL(5, 2) DEFAULT 0.00, -- Percentage
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  hire_date DATE,
  
  -- Specialization
  specialization TEXT[], -- Array of specializations
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for employees
CREATE INDEX IF NOT EXISTS idx_employees_business_id ON employees(business_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(is_active);

-- RLS for employees
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view their own profile"
  ON employees
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Owners can view business employees"
  ON employees
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.user_type = 'owner'
      AND profiles.business_id = employees.business_id
    )
  );

-- ============================================
-- 6. CLIENTS TABLE (if not exists)
-- ============================================
-- Table for storing client/customer information

CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  business_id UUID NOT NULL,
  
  -- Client Information
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  profile_image TEXT,
  
  -- Client Details
  is_verified BOOLEAN DEFAULT false,
  client_tag VARCHAR(50), -- VIP, Regular, New, etc.
  
  -- Statistics (can be calculated, but cached for performance)
  total_visits INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0.00,
  last_visit DATE,
  average_spend DECIMAL(10, 2) DEFAULT 0.00,
  visit_frequency VARCHAR(50), -- Weekly, Bi-weekly, Monthly, etc.
  loyalty_points INTEGER DEFAULT 0,
  
  -- Preferences
  preferred_services TEXT[],
  preferred_employee_id UUID REFERENCES employees(id),
  notes TEXT,
  
  -- Personal Information
  birthday DATE,
  address TEXT,
  allergies TEXT,
  emergency_contact TEXT,
  
  -- Timestamps
  join_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for clients
CREATE INDEX IF NOT EXISTS idx_clients_business_id ON clients(business_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- RLS for clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their own profile"
  ON clients
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Owners can view business clients"
  ON clients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.user_type = 'owner'
      AND profiles.business_id = clients.business_id
    )
  );

CREATE POLICY "Employees can view business clients"
  ON clients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
      AND employees.business_id = clients.business_id
    )
  );

-- ============================================
-- 7. HELPER FUNCTIONS
-- ============================================

-- Function to calculate daily revenue for a business
CREATE OR REPLACE FUNCTION calculate_daily_revenue(
  p_business_id UUID,
  p_date DATE
)
RETURNS DECIMAL(10, 2) AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(price)
     FROM appointments
     WHERE business_id = p_business_id
     AND date = p_date
     AND status = 'completed'),
    0.00
  );
END;
$$ LANGUAGE plpgsql;

-- Function to calculate employee earnings for a date
CREATE OR REPLACE FUNCTION calculate_employee_earnings(
  p_employee_id UUID,
  p_date DATE
)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
  v_total_revenue DECIMAL(10, 2);
  v_hourly_rate DECIMAL(10, 2);
  v_commission_rate DECIMAL(5, 2);
  v_hours_worked DECIMAL(10, 2);
  v_earnings DECIMAL(10, 2);
BEGIN
  -- Get total revenue from completed appointments
  SELECT COALESCE(SUM(price), 0.00) INTO v_total_revenue
  FROM appointments
  WHERE employee_id = p_employee_id
  AND date = p_date
  AND status = 'completed';
  
  -- Get employee hourly rate and commission
  SELECT hourly_rate, commission_rate INTO v_hourly_rate, v_commission_rate
  FROM employees
  WHERE id = p_employee_id;
  
  -- Calculate hours worked (sum of durations)
  SELECT COALESCE(SUM(duration) / 60.0, 0.0) INTO v_hours_worked
  FROM appointments
  WHERE employee_id = p_employee_id
  AND date = p_date
  AND status = 'completed';
  
  -- Calculate earnings: (hours * hourly_rate) + (revenue * commission_rate / 100)
  v_earnings := (v_hours_worked * COALESCE(v_hourly_rate, 0.00)) + 
                (v_total_revenue * COALESCE(v_commission_rate, 0.00) / 100.0);
  
  RETURN COALESCE(v_earnings, 0.00);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE appointments IS 'Main table for storing all appointment bookings';
COMMENT ON TABLE employees IS 'Table for storing employee/staff information';
COMMENT ON TABLE clients IS 'Table for storing client/customer information';

COMMENT ON COLUMN appointments.status IS 'Appointment status: pending, confirmed, checked-in, in-service, completed, cancelled, no-show';
COMMENT ON COLUMN appointments.date IS 'Appointment date in YYYY-MM-DD format';
COMMENT ON COLUMN appointments.start_time IS 'Appointment start time in HH:MM format (24-hour)';
COMMENT ON COLUMN appointments.end_time IS 'Appointment end time in HH:MM format (24-hour)';
COMMENT ON COLUMN appointments.duration IS 'Appointment duration in minutes';

-- ============================================
-- END OF SCHEMA
-- ============================================

