-- Enable Realtime for notifications table
-- Run this in Supabase SQL Editor once
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Enable Realtime for activities table (for live funding_raised updates)
ALTER PUBLICATION supabase_realtime ADD TABLE activities;
