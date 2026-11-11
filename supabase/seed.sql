-- ==============================================================================
-- Cricket Auction League - Seed Data
-- ==============================================================================

-- 1. Default Tournament Settings
INSERT INTO tournament_settings (
  tournament_name,
  registration_fee,
  upi_id,
  upi_qr_path,
  maximum_player_capacity,
  registration_open,
  registration_instructions
) VALUES (
  'Cricket Auction League 2026',
  500,
  'cricketauctionleague@okhdfcbank',
  NULL,
  100,
  true,
  'Scan the official tournament QR code or copy the UPI ID. Pay ₹500 from your UPI app (Google Pay, PhonePe, Paytm). Copy the 12-digit UTR and upload the payment confirmation screenshot.'
)
ON CONFLICT DO NOTHING;

-- 2. Sample Players
INSERT INTO players (
  id,
  registration_id,
  full_name,
  email,
  mobile,
  date_of_birth,
  city,
  address,
  profile_photo_path,
  playing_role,
  batting_style,
  bowling_arm,
  bowling_type,
  experience_level,
  previous_team_name,
  previous_captain_name,
  previous_tournament,
  previous_tournament_name,
  additional_information,
  emergency_contact_name,
  emergency_relationship,
  emergency_mobile,
  registration_status
) VALUES 
(
  'a1111111-1111-1111-1111-111111111111',
  'CAL-2026-000001',
  'Rohit Sharma',
  'rohit.sharma@example.com',
  '+91 98765 43210',
  '1998-04-30',
  'Mumbai',
  'A-402, Sea Green Heights, Shivaji Park Lane, Dadar West, Mumbai 400028',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  'batsman',
  'right_hand',
  'right_arm',
  'spin',
  '5_plus_years',
  'Shivaji Park Strikers',
  'Pravin Tambe',
  true,
  'Mumbai Premier League 2024',
  'Top run scorer in local T20 cup with 342 runs in 7 innings at 148.5 strike rate.',
  'Suresh Sharma',
  'Father',
  '+91 98765 11223',
  'approved'
),
(
  'b2222222-2222-2222-2222-222222222222',
  'CAL-2026-000002',
  'Jasprit Bumrah',
  'jasprit.b@example.com',
  '+91 98111 22334',
  '1999-12-06',
  'Ahmedabad',
  'B-12, Heritage Enclave, Drive-In Road, Ahmedabad 380054',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'bowler',
  'right_hand',
  'right_arm',
  'fast',
  '5_plus_years',
  'Gujarat Lions Club',
  'Parthiv Patel',
  true,
  'Gujarat T20 Trophy',
  'Right-arm express pacer with yorker accuracy and economy under 6.5 in death overs.',
  'Daljit Kaur',
  'Mother',
  '+91 98111 99887',
  'under_review'
),
(
  'c3333333-3333-3333-3333-333333333333',
  'CAL-2026-000003',
  'Ravindra Jadeja',
  'ravindra.j@example.com',
  '+91 98222 33445',
  '1997-08-15',
  'Rajkot',
  'Rajkot Cricket Academy Campus, Kalawad Road, Rajkot 360005',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'all_rounder',
  'left_hand',
  'left_arm',
  'spin',
  '5_plus_years',
  'Saurashtra Stars',
  'Jaydev Unadkat',
  true,
  'Saurashtra Premier Cup',
  'Left-arm orthodox spinner and hard-hitting middle order batsman, elite fielding stats.',
  'Anirudh Jadeja',
  'Father',
  '+91 98222 88776',
  'approved'
),
(
  'd4444444-4444-4444-4444-444444444444',
  'CAL-2026-000004',
  'Rishabh Pant',
  'rishabh.p@example.com',
  '+91 98333 44556',
  '2001-10-04',
  'Delhi',
  'House 14, Roorkee Road, Civil Lines, Delhi 110054',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  'wicketkeeper',
  'left_hand',
  'do_not_bowl',
  'not_applicable',
  '3_5_years',
  'Delhi Challengers',
  'Ishant Sharma',
  true,
  'Delhi Club Championship',
  'Aggressive left-handed wicketkeeper batsman, 28 dismissals and 410 runs last season.',
  'Saroj Pant',
  'Mother',
  '+91 98333 77665',
  'under_review'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Sample Payments corresponding to sample players
INSERT INTO payments (
  id,
  player_id,
  amount,
  currency,
  payment_method,
  utr_number,
  screenshot_path,
  payment_status,
  verified_at
) VALUES 
(
  'p1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  500,
  'INR',
  'UPI',
  '403928174629',
  'payments/CAL-2026-000001/upi_receipt_500.png',
  'verified',
  NOW() - INTERVAL '1 day'
),
(
  'p2222222-2222-2222-2222-222222222222',
  'b2222222-2222-2222-2222-222222222222',
  500,
  'INR',
  'UPI',
  '403928174630',
  'payments/CAL-2026-000002/upi_receipt_bumrah.png',
  'pending_verification',
  NULL
),
(
  'p3333333-3333-3333-3333-333333333333',
  'c3333333-3333-3333-3333-333333333333',
  500,
  'INR',
  'UPI',
  '403928174631',
  'payments/CAL-2026-000003/upi_receipt_jadeja.png',
  'verified',
  NOW() - INTERVAL '6 hours'
),
(
  'p4444444-4444-4444-4444-444444444444',
  'd4444444-4444-4444-4444-444444444444',
  500,
  'INR',
  'UPI',
  '403928174632',
  'payments/CAL-2026-000004/upi_receipt_pant.png',
  'pending_verification',
  NULL
)
ON CONFLICT (id) DO NOTHING;
