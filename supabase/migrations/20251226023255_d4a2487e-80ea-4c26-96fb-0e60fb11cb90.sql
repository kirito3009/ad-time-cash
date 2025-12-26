-- Remove email and name columns from support_messages (prevent data harvesting)
-- Use user profile data instead for authenticated users

-- First, drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can create messages" ON public.support_messages;

-- Create a secure RPC function to get support message sender info for admins
CREATE OR REPLACE FUNCTION public.get_support_message_sender_info(_user_id UUID)
RETURNS TABLE(email TEXT, full_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can get sender info
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Access denied: Only admins can view sender information';
  END IF;
  
  RETURN QUERY
  SELECT u.email::TEXT, p.full_name
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE u.id = _user_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_support_message_sender_info(UUID) TO authenticated;

-- Remove email and name columns from support_messages
ALTER TABLE public.support_messages DROP COLUMN IF EXISTS email;
ALTER TABLE public.support_messages DROP COLUMN IF EXISTS name;

-- Make user_id required (authentication required)
ALTER TABLE public.support_messages ALTER COLUMN user_id SET NOT NULL;

-- Create new strict INSERT policy - only authenticated users can create their own messages
CREATE POLICY "Authenticated users can create own messages"
ON public.support_messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Keep existing view policy (already correct: users can only view their own)
-- "Users can view own messages" policy already uses (auth.uid() = user_id)