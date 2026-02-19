-- Migration: Add new features (Favorites, Views, Offers, etc.)
-- Date: 2026-02-19

-- 1. Favorites/Wishlist Table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, listing_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_listing_id ON favorites(listing_id);

-- 2. Listing Views Table
CREATE TABLE IF NOT EXISTS listing_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_listing_views_listing_id ON listing_views(listing_id);
CREATE INDEX idx_listing_views_user_id ON listing_views(user_id);

-- 3. Offers/Negotiation Table
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  offer_amount DECIMAL(10, 2) NOT NULL CHECK (offer_amount > 0),
  message TEXT CHECK (LENGTH(message) <= 500),
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'countered', 'withdrawn')),
  counter_amount DECIMAL(10, 2) CHECK (counter_amount IS NULL OR counter_amount > 0),
  counter_message TEXT CHECK (counter_message IS NULL OR LENGTH(counter_message) <= 500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP
);

CREATE INDEX idx_offers_listing_id ON offers(listing_id);
CREATE INDEX idx_offers_buyer_id ON offers(buyer_id);
CREATE INDEX idx_offers_seller_id ON offers(seller_id);
CREATE INDEX idx_offers_status ON offers(status);

-- 4. Saved Searches Table
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  search_params JSONB NOT NULL,
  notify_on_match BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_saved_searches_user_id ON saved_searches(user_id);

-- 5. User Following Table
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following_id ON user_follows(following_id);

-- 6. Add view_count to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- 7. Add share_count to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;

-- 8. Add favorite_count to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS favorite_count INTEGER DEFAULT 0;

-- 9. Listing Interests Table (already exists, but let's ensure it has all fields)
-- This tracks when users click "I'm Interested"
CREATE TABLE IF NOT EXISTS listing_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT CHECK (LENGTH(message) <= 500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(listing_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_listing_interests_listing_id ON listing_interests(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_interests_user_id ON listing_interests(user_id);

-- 10. Update notification types to include new features
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN (
    'new_message', 
    'listing_inquiry', 
    'review_received', 
    'departure_reminder',
    'new_offer',
    'offer_accepted',
    'offer_rejected',
    'offer_countered',
    'new_follower',
    'followed_user_new_listing',
    'saved_search_match',
    'listing_sold'
  ));

-- 11. Add notification preferences for new features
ALTER TABLE notification_preferences 
  ADD COLUMN IF NOT EXISTS email_new_offer BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS email_offer_response BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS email_new_follower BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS email_saved_search_match BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS in_app_new_offer BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS in_app_offer_response BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS in_app_new_follower BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS in_app_saved_search_match BOOLEAN DEFAULT TRUE;

-- 12. Function to increment view count
CREATE OR REPLACE FUNCTION increment_listing_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE listings 
  SET view_count = view_count + 1 
  WHERE id = NEW.listing_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for view count
DROP TRIGGER IF EXISTS trigger_increment_listing_views ON listing_views;
CREATE TRIGGER trigger_increment_listing_views
  AFTER INSERT ON listing_views
  FOR EACH ROW
  EXECUTE FUNCTION increment_listing_views();

-- 13. Function to update favorite count
CREATE OR REPLACE FUNCTION update_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE listings 
    SET favorite_count = favorite_count + 1 
    WHERE id = NEW.listing_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE listings 
    SET favorite_count = favorite_count - 1 
    WHERE id = OLD.listing_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for favorite count
DROP TRIGGER IF EXISTS trigger_update_favorite_count ON favorites;
CREATE TRIGGER trigger_update_favorite_count
  AFTER INSERT OR DELETE ON favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_favorite_count();

COMMENT ON TABLE favorites IS 'User favorites/wishlist for listings';
COMMENT ON TABLE listing_views IS 'Track listing views for analytics';
COMMENT ON TABLE offers IS 'Buyer offers and seller counter-offers';
COMMENT ON TABLE saved_searches IS 'User saved search filters';
COMMENT ON TABLE user_follows IS 'User following system';
