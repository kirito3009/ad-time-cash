-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a function to encrypt payment details using a server-side key
-- This function uses SECURITY DEFINER to access the encryption key securely
CREATE OR REPLACE FUNCTION public.encrypt_payment_details(payment_data text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encryption_key text := 'lovable_payment_enc_key_2024';
BEGIN
  RETURN encode(pgp_sym_encrypt(payment_data, encryption_key), 'base64');
END;
$$;

-- Create a function to decrypt payment details (admin only)
CREATE OR REPLACE FUNCTION public.decrypt_payment_details(encrypted_data text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encryption_key text := 'lovable_payment_enc_key_2024';
BEGIN
  -- Only admins can decrypt
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: Only admins can decrypt payment details';
  END IF;
  
  RETURN pgp_sym_decrypt(decode(encrypted_data, 'base64'), encryption_key);
END;
$$;

-- Create a trigger function to auto-encrypt payment details on insert/update
CREATE OR REPLACE FUNCTION public.encrypt_withdrawal_payment_details()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encryption_key text := 'lovable_payment_enc_key_2024';
BEGIN
  -- Encrypt payment_details if it's being set and doesn't look encrypted (base64)
  IF NEW.payment_details IS NOT NULL AND NEW.payment_details != '' THEN
    -- Check if already encrypted (base64 encoded pgp data starts with specific pattern)
    IF NOT (NEW.payment_details ~ '^[A-Za-z0-9+/]+=*$' AND length(NEW.payment_details) > 100) THEN
      NEW.payment_details := encode(pgp_sym_encrypt(NEW.payment_details, encryption_key), 'base64');
    END IF;
  END IF;
  
  -- Encrypt payment_method as well
  IF NEW.payment_method IS NOT NULL AND NEW.payment_method != '' THEN
    IF NOT (NEW.payment_method ~ '^[A-Za-z0-9+/]+=*$' AND length(NEW.payment_method) > 100) THEN
      NEW.payment_method := encode(pgp_sym_encrypt(NEW.payment_method, encryption_key), 'base64');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic encryption on withdrawals table
DROP TRIGGER IF EXISTS encrypt_payment_on_insert ON public.withdrawals;
CREATE TRIGGER encrypt_payment_on_insert
  BEFORE INSERT ON public.withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_withdrawal_payment_details();

DROP TRIGGER IF EXISTS encrypt_payment_on_update ON public.withdrawals;
CREATE TRIGGER encrypt_payment_on_update
  BEFORE UPDATE ON public.withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_withdrawal_payment_details();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.encrypt_payment_details(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrypt_payment_details(text) TO authenticated;