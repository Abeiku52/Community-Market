-- Add listing interests table for anonymous bidding
CREATE TABLE IF NOT EXISTS listing_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(listing_id, user_id)
);

CREATE INDEX idx_listing_interests_listing_id ON listing_interests(listing_id);
CREATE INDEX idx_listing_interests_user_id ON listing_interests(user_id);

-- Update notification types to include new types
-- Note: The notification type is stored as VARCHAR, so no schema change needed
-- Just documenting the new types:
-- 'new_listing' - Someone in your domain posted a listing
-- 'listing_interest' - Someone is interested in your listing
