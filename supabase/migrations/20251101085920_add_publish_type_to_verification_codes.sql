/*
  # Add 'publish' type to verification_codes table

  1. Changes
    - Modify CHECK constraint on verification_codes.type column
    - Allow 'publish' in addition to existing 'create' and 'manage' types
    - This is required for the email verification flow during job publication

  2. Security
    - No changes to RLS policies
    - Maintains existing security model
*/

-- Drop existing constraint
ALTER TABLE verification_codes 
DROP CONSTRAINT IF EXISTS verification_codes_type_check;

-- Add new constraint that includes 'publish'
ALTER TABLE verification_codes
ADD CONSTRAINT verification_codes_type_check 
CHECK (type = ANY (ARRAY['create'::text, 'manage'::text, 'publish'::text]));