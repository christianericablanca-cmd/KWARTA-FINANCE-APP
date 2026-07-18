-- Fundex Seed Data for user: christiane.ricablanca@gmail.com
-- Run this AFTER supabase-fresh-setup.sql

-- Insert categories
INSERT INTO categories (user_id, name, type, icon, color) VALUES
  ('a1ce2d3e-fc53-495a-bc51-6f4f62cb151b', 'Salary', 'income', '💼', '#10B981'),
  ('a1ce2d3e-fc53-495a-bc51-6f4f62cb151b', 'Freelance', 'income', '💻', '#3B82F6'),
  ('a1ce2d3e-fc53-495a-bc51-6f4f62cb151b', 'Investment', 'income', '📈', '#8B5CF6'),
  ('a1ce2d3e-fc53-495a-bc51-6f4f62cb151b', 'Interest', 'income', '💰', '#10B981'),
  ('a1ce2d3e-fc53-495a-bc51-6f4f62cb151b', 'Food', 'expense', '🍔', '#EF4444'),
  ('a1ce2d3e-fc53-495a-bc51-6f4f62cb151b', 'Transportation', 'expense', '🚗', '#F59E0B'),
  ('a1ce2d3e-fc53-495a-bc51-6f4f62cb151b', 'Bills', 'expense', '📄', '#6366F1'),
  ('a1ce2d3e-fc53-495a-bc51-6f4f62cb151b', 'Shopping', 'expense', '🛍️', '#EC4899'),
  ('a1ce2d3e-fc53-495a-bc51-6f4f62cb151b', 'Entertainment', 'expense', '🎬', '#14B8A6'),
  ('a1ce2d3e-fc53-495a-bc51-6f4f62cb151b', 'Healthcare', 'expense', '🏥', '#F97316'),
  ('a1ce2d3e-fc53-495a-bc51-6f4f62cb151b', 'Education', 'expense', '📚', '#06B6D4'),
  ('a1ce2d3e-fc53-495a-bc51-6f4f62cb151b', 'Travel', 'expense', '✈️', '#8B5CF6');

-- Insert accounts
INSERT INTO accounts (user_id, name, type, balance, available_balance, currency, institution) VALUES
  ('a1ce2d3e-fc53-495a-bc51-6f4f62cb151b', 'Cash', 'cash', 5000, 5000, '₱', 'Personal'),
  ('a1ce2d3e-fc53-495a-bc51-6f4f62cb151b', 'BDO Savings', 'bank', 125000, 120000, '₱', 'BDO'),
  ('a1ce2d3e-fc53-495a-bc51-6f4f62cb151b', 'GCash', 'ewallet', 8500, 8500, '₱', 'GCash');

-- Insert welcome transaction
INSERT INTO transactions (user_id, amount, category_id, account_id, date, notes, tags, type)
SELECT 
  'a1ce2d3e-fc53-495a-bc51-6f4f62cb151b',
  50000,
  c.id,
  a.id,
  CURRENT_DATE,
  'Welcome to Fundex!',
  ARRAY['welcome'],
  'income'
FROM categories c, accounts a
WHERE c.name = 'Salary' AND a.name = 'Cash'
LIMIT 1;
