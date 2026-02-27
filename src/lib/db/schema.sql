-- AI Visibility Checker - Database Schema
-- Run this against your Neon database to set up tables

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  website_url TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audits table
CREATE TABLE IF NOT EXISTS audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES brands(id),
  status TEXT DEFAULT 'pending',
  visibility_score INTEGER,
  score_breakdown JSONB,
  competitor_data JSONB,
  gap_data JSONB,
  recommendation_data JSONB,
  raw_responses JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- AI Queries table
CREATE TABLE IF NOT EXISTS ai_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID REFERENCES audits(id),
  platform TEXT NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT,
  brand_mentioned BOOLEAN,
  mention_sentiment TEXT,
  mention_position INTEGER,
  competitors_mentioned JSONB,
  cached BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email captures
CREATE TABLE IF NOT EXISTS email_captures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID REFERENCES audits(id),
  email TEXT NOT NULL,
  brand_name TEXT,
  opted_in BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audits_brand ON audits(brand_id);
CREATE INDEX IF NOT EXISTS idx_audits_status ON audits(status);
CREATE INDEX IF NOT EXISTS idx_queries_audit ON ai_queries(audit_id);
CREATE INDEX IF NOT EXISTS idx_email_captures_email ON email_captures(email);
