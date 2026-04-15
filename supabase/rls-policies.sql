-- ============================================
-- SinergiLaut - Row Level Security Policies
-- Run AFTER schema.sql
-- Last updated: 2026-04-15
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_milestones ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Helper Functions
-- ============================================

-- Get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() = 'admin';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user owns a community
CREATE OR REPLACE FUNCTION owns_community(community_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM communities WHERE id = community_id AND owner_id = auth.uid());
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- PROFILES policies
-- ============================================

DROP POLICY IF EXISTS "Profiles are publicly readable" ON profiles;
CREATE POLICY "Profiles are publicly readable"
  ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin can update any profile" ON profiles;
CREATE POLICY "Admin can update any profile"
  ON profiles FOR UPDATE USING (is_admin());

-- ============================================
-- COMMUNITIES policies
-- ============================================

-- Public can read verified, non-suspended communities
DROP POLICY IF EXISTS "Public can read verified communities" ON communities;
CREATE POLICY "Public can read verified communities"
  ON communities FOR SELECT
  USING (is_verified = true AND is_suspended = false);

-- Admin can read all communities
DROP POLICY IF EXISTS "Admin can read all communities" ON communities;
CREATE POLICY "Admin can read all communities"
  ON communities FOR SELECT USING (is_admin());

-- Community owner can read their own community
DROP POLICY IF EXISTS "Community owner can read own community" ON communities;
CREATE POLICY "Community owner can read own community"
  ON communities FOR SELECT USING (owner_id = auth.uid());

-- Community owners can update their own community
DROP POLICY IF EXISTS "Community owner can update own" ON communities;
CREATE POLICY "Community owner can update own"
  ON communities FOR UPDATE USING (owner_id = auth.uid());

-- Admin can update any community
DROP POLICY IF EXISTS "Admin can update any community" ON communities;
CREATE POLICY "Admin can update any community"
  ON communities FOR UPDATE USING (is_admin());

-- Authenticated users can create communities
DROP POLICY IF EXISTS "Authenticated users can create communities" ON communities;
CREATE POLICY "Authenticated users can create communities"
  ON communities FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

-- ============================================
-- COMMUNITY VERIFICATIONS policies
-- ============================================

DROP POLICY IF EXISTS "Admin can read all verifications" ON community_verifications;
CREATE POLICY "Admin can read all verifications"
  ON community_verifications FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Community owner can read own verification" ON community_verifications;
CREATE POLICY "Community owner can read own verification"
  ON community_verifications FOR SELECT
  USING (EXISTS (SELECT 1 FROM communities c WHERE c.id = community_id AND c.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Admin can update verifications" ON community_verifications;
CREATE POLICY "Admin can update verifications"
  ON community_verifications FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Authenticated users can create verification" ON community_verifications;
CREATE POLICY "Authenticated users can create verification"
  ON community_verifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- ACTIVITIES policies
-- ============================================

DROP POLICY IF EXISTS "Public can view published activities" ON activities;
CREATE POLICY "Public can view published activities"
  ON activities FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Admin can view all activities" ON activities;
CREATE POLICY "Admin can view all activities"
  ON activities FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Community can view own activities" ON activities;
CREATE POLICY "Community can view own activities"
  ON activities FOR SELECT
  USING (owns_community(community_id));

DROP POLICY IF EXISTS "Community can create activities" ON activities;
CREATE POLICY "Community can create activities"
  ON activities FOR INSERT
  WITH CHECK (owns_community(community_id));

DROP POLICY IF EXISTS "Community can update own activities" ON activities;
CREATE POLICY "Community can update own activities"
  ON activities FOR UPDATE USING (owns_community(community_id));

DROP POLICY IF EXISTS "Admin can update any activity" ON activities;
CREATE POLICY "Admin can update any activity"
  ON activities FOR UPDATE USING (is_admin());

-- ============================================
-- VOLUNTEER REGISTRATIONS policies
-- ============================================

DROP POLICY IF EXISTS "Users can view own volunteer registrations" ON volunteer_registrations;
CREATE POLICY "Users can view own volunteer registrations"
  ON volunteer_registrations FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Community can view activity volunteer registrations" ON volunteer_registrations;
CREATE POLICY "Community can view activity volunteer registrations"
  ON volunteer_registrations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM activities a
    WHERE a.id = activity_id AND owns_community(a.community_id)
  ));

DROP POLICY IF EXISTS "Admin can view all volunteer registrations" ON volunteer_registrations;
CREATE POLICY "Admin can view all volunteer registrations"
  ON volunteer_registrations FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Authenticated users can register as volunteer" ON volunteer_registrations;
CREATE POLICY "Authenticated users can register as volunteer"
  ON volunteer_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Community can update volunteer status" ON volunteer_registrations;
CREATE POLICY "Community can update volunteer status"
  ON volunteer_registrations FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM activities a
    WHERE a.id = activity_id AND owns_community(a.community_id)
  ));

-- ============================================
-- DONATIONS policies
-- ============================================

DROP POLICY IF EXISTS "Public can view public donations" ON donations;
CREATE POLICY "Public can view public donations"
  ON donations FOR SELECT
  USING (status = 'completed' AND is_anonymous = false);

DROP POLICY IF EXISTS "Users can view own donations" ON donations;
CREATE POLICY "Users can view own donations"
  ON donations FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Community can view activity donations" ON donations;
CREATE POLICY "Community can view activity donations"
  ON donations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM activities a
    WHERE a.id = activity_id AND owns_community(a.community_id)
  ));

DROP POLICY IF EXISTS "Admin can view all donations" ON donations;
CREATE POLICY "Admin can view all donations"
  ON donations FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Anyone can create donations" ON donations;
CREATE POLICY "Anyone can create donations"
  ON donations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can update donations" ON donations;
CREATE POLICY "Admin can update donations"
  ON donations FOR UPDATE USING (is_admin());

-- Allow service role to update donations (for Midtrans webhook)
DROP POLICY IF EXISTS "Service role can update donations" ON donations;
CREATE POLICY "Service role can update donations"
  ON donations FOR UPDATE WITH CHECK (true);

-- ============================================
-- DONATION ITEMS policies
-- ============================================

DROP POLICY IF EXISTS "View donation items if can view donation" ON donation_items;
CREATE POLICY "View donation items if can view donation"
  ON donation_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM donations d
    WHERE d.id = donation_id AND (
      d.user_id = auth.uid() OR
      is_admin() OR
      EXISTS (SELECT 1 FROM activities a WHERE a.id = d.activity_id AND owns_community(a.community_id))
    )
  ));

DROP POLICY IF EXISTS "Anyone can insert donation items" ON donation_items;
CREATE POLICY "Anyone can insert donation items"
  ON donation_items FOR INSERT WITH CHECK (true);

-- ============================================
-- DISBURSEMENTS policies
-- ============================================

DROP POLICY IF EXISTS "Admin can view all disbursements" ON disbursements;
CREATE POLICY "Admin can view all disbursements"
  ON disbursements FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Community can view own disbursements" ON disbursements;
CREATE POLICY "Community can view own disbursements"
  ON disbursements FOR SELECT
  USING (owns_community(community_id));

DROP POLICY IF EXISTS "Admin can create disbursements" ON disbursements;
CREATE POLICY "Admin can create disbursements"
  ON disbursements FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin can update disbursements" ON disbursements;
CREATE POLICY "Admin can update disbursements"
  ON disbursements FOR UPDATE USING (is_admin());

-- ============================================
-- REPORTS policies
-- ============================================

DROP POLICY IF EXISTS "Public can view validated reports" ON reports;
CREATE POLICY "Public can view validated reports"
  ON reports FOR SELECT USING (status = 'validated');

DROP POLICY IF EXISTS "Community can view own reports" ON reports;
CREATE POLICY "Community can view own reports"
  ON reports FOR SELECT USING (owns_community(community_id));

DROP POLICY IF EXISTS "Admin can view all reports" ON reports;
CREATE POLICY "Admin can view all reports"
  ON reports FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Community can create reports" ON reports;
CREATE POLICY "Community can create reports"
  ON reports FOR INSERT
  WITH CHECK (owns_community(community_id) AND submitted_by = auth.uid());

DROP POLICY IF EXISTS "Community can update own reports" ON reports;
CREATE POLICY "Community can update own reports"
  ON reports FOR UPDATE
  USING (owns_community(community_id) AND status IN ('draft', 'submitted'));

DROP POLICY IF EXISTS "Admin can update any report" ON reports;
CREATE POLICY "Admin can update any report"
  ON reports FOR UPDATE USING (is_admin());

-- ============================================
-- REPORT FILES policies
-- ============================================

DROP POLICY IF EXISTS "Public can view files of validated reports" ON report_files;
CREATE POLICY "Public can view files of validated reports"
  ON report_files FOR SELECT
  USING (EXISTS (SELECT 1 FROM reports r WHERE r.id = report_id AND r.status = 'validated'));

DROP POLICY IF EXISTS "Community can view own report files" ON report_files;
CREATE POLICY "Community can view own report files"
  ON report_files FOR SELECT
  USING (EXISTS (SELECT 1 FROM reports r WHERE r.id = report_id AND owns_community(r.community_id)));

DROP POLICY IF EXISTS "Admin can view all report files" ON report_files;
CREATE POLICY "Admin can view all report files"
  ON report_files FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Community can insert report files" ON report_files;
CREATE POLICY "Community can insert report files"
  ON report_files FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM reports r WHERE r.id = report_id AND owns_community(r.community_id)));

-- ============================================
-- SANCTIONS policies
-- ============================================

DROP POLICY IF EXISTS "Admin can manage sanctions" ON sanctions;
CREATE POLICY "Admin can manage sanctions"
  ON sanctions FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Community can view own sanctions" ON sanctions;
CREATE POLICY "Community can view own sanctions"
  ON sanctions FOR SELECT USING (owns_community(community_id));

-- ============================================
-- FEEDBACKS policies
-- ============================================

DROP POLICY IF EXISTS "Public can read public feedbacks" ON feedbacks;
CREATE POLICY "Public can read public feedbacks"
  ON feedbacks FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can view own feedbacks" ON feedbacks;
CREATE POLICY "Users can view own feedbacks"
  ON feedbacks FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Attended volunteers can create feedback" ON feedbacks;
CREATE POLICY "Attended volunteers can create feedback"
  ON feedbacks FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM volunteer_registrations vr
      WHERE vr.activity_id = feedbacks.activity_id
        AND vr.user_id = auth.uid()
        AND vr.status = 'attended'
    )
  );

DROP POLICY IF EXISTS "Attended volunteers can update own feedback" ON feedbacks;
CREATE POLICY "Attended volunteers can update own feedback"
  ON feedbacks FOR UPDATE
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM volunteer_registrations vr
      WHERE vr.activity_id = feedbacks.activity_id
        AND vr.user_id = auth.uid()
        AND vr.status = 'attended'
    )
  );

-- ============================================
-- NOTIFICATIONS policies
-- ============================================

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT WITH CHECK (true);

-- ============================================
-- AUDIT LOGS policies
-- ============================================

DROP POLICY IF EXISTS "Admin can view audit logs" ON audit_logs;
CREATE POLICY "Admin can view audit logs"
  ON audit_logs FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Service role can insert audit logs" ON audit_logs;
CREATE POLICY "Service role can insert audit logs"
  ON audit_logs FOR INSERT WITH CHECK (true);

-- ============================================
-- JOURNEY MILESTONES policies
-- ============================================

DROP POLICY IF EXISTS "Public can read published milestones" ON journey_milestones;
CREATE POLICY "Public can read published milestones"
  ON journey_milestones FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Admin can read all milestones" ON journey_milestones;
CREATE POLICY "Admin can read all milestones"
  ON journey_milestones FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admin can create milestones" ON journey_milestones;
CREATE POLICY "Admin can create milestones"
  ON journey_milestones FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin can update milestones" ON journey_milestones;
CREATE POLICY "Admin can update milestones"
  ON journey_milestones FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Admin can delete milestones" ON journey_milestones;
CREATE POLICY "Admin can delete milestones"
  ON journey_milestones FOR DELETE USING (is_admin());
