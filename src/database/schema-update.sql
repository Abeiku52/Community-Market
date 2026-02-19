-- Schema Updates for New Features
-- Run this after the main schema.sql

-- 1. Add anonymous bidding support
-- Update users table to remove password requirement for email-only auth
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ADD COLUMN auth_method VARCHAR(20) DEFAULT 'password' CHECK (auth_method IN ('password', 'email_only'));
ALTER TABLE users ADD COLUMN last_login TIMESTAMP;

-- 2. Create bids table for anonymous bidding
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  is_anonymous BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'accepted', 'rejected', 'withdrawn')),
  message TEXT CHECK (message IS NULL OR LENGTH(message) <= 500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bids_listing_id ON bids(listing_id);
CREATE INDEX idx_bids_bidder_id ON bids(bidder_id);
CREATE INDEX idx_bids_status ON bids(status);

-- Trigger for bids updated_at
CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON bids
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Add admin activity log
CREATE TABLE admin_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_activity_admin_id ON admin_activity_log(admin_id);
CREATE INDEX idx_admin_activity_created_at ON admin_activity_log(created_at);

-- 4. Add system settings table for admin configuration
CREATE TABLE system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO system_settings (key, value, description) VALUES
  ('allowed_email_domain', '"lincoln.edu.gh"', 'Allowed email domain for registration'),
  ('bidding_enabled', 'true', 'Enable/disable bidding feature'),
  ('max_bids_per_listing', '50', 'Maximum number of bids per listing'),
  ('auto_accept_bid_threshold', 'null', 'Auto-accept bids at or above this amount (null = disabled)');

-- 5. Add listing bidding settings
ALTER TABLE listings ADD COLUMN bidding_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN minimum_bid DECIMAL(10, 2);
ALTER TABLE listings ADD COLUMN bid_increment DECIMAL(10, 2) DEFAULT 1.00;
ALTER TABLE listings ADD COLUMN highest_bid_id UUID REFERENCES bids(id);

-- 6. Create view for anonymous bids (seller can see all, others see anonymized)
CREATE OR REPLACE VIEW bid_details AS
SELECT 
  b.id,
  b.listing_id,
  b.amount,
  b.status,
  b.message,
  b.created_at,
  b.updated_at,
  CASE 
    WHEN b.is_anonymous THEN NULL 
    ELSE b.bidder_id 
  END as bidder_id,
  CASE 
    WHEN b.is_anonymous THEN 'Anonymous Bidder' 
    ELSE u.name 
  END as bidder_name,
  b.is_anonymous
FROM bids b
LEFT JOIN users u ON b.bidder_id = u.id;

-- 7. Add notification types for bidding
ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN ('new_message', 'listing_inquiry', 'review_received', 'departure_reminder', 
                  'new_bid', 'bid_accepted', 'bid_rejected', 'outbid'));

-- 8. Create function to update highest bid
CREATE OR REPLACE FUNCTION update_highest_bid()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE listings 
  SET highest_bid_id = (
    SELECT id FROM bids 
    WHERE listing_id = NEW.listing_id 
      AND status = 'active'
    ORDER BY amount DESC 
    LIMIT 1
  )
  WHERE id = NEW.listing_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_listing_highest_bid 
  AFTER INSERT OR UPDATE ON bids
  FOR EACH ROW 
  EXECUTE FUNCTION update_highest_bid();

-- 9. Add indexes for performance
CREATE INDEX idx_listings_bidding_enabled ON listings(bidding_enabled) WHERE bidding_enabled = TRUE;
CREATE INDEX idx_bids_listing_amount ON bids(listing_id, amount DESC);

COMMENT ON TABLE bids IS 'Stores bids for listings with bidding enabled';
COMMENT ON COLUMN bids.is_anonymous IS 'If true, bidder identity is hidden from everyone except the seller';
COMMENT ON TABLE admin_activity_log IS 'Logs all admin actions for audit trail';
