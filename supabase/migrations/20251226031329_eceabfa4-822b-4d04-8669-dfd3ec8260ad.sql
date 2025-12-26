-- Create rate_limits table to track request counts
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  action_type text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action_time 
ON public.rate_limits (user_id, action_type, created_at DESC);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS policy: users can only see their own rate limit records
CREATE POLICY "Users can view own rate limits"
ON public.rate_limits
FOR SELECT
USING (auth.uid() = user_id);

-- RLS policy: system can insert rate limit records for authenticated users
CREATE POLICY "Authenticated users can insert rate limits"
ON public.rate_limits
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Function to check rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id uuid,
  p_action_type text,
  p_max_count integer,
  p_window_minutes integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
BEGIN
  SELECT COUNT(*) INTO current_count
  FROM public.rate_limits
  WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND created_at > (now() - (p_window_minutes || ' minutes')::interval);
  
  RETURN current_count < p_max_count;
END;
$$;

-- Function to record rate limit entry
CREATE OR REPLACE FUNCTION public.record_rate_limit(
  p_user_id uuid,
  p_action_type text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.rate_limits (user_id, action_type)
  VALUES (p_user_id, p_action_type);
END;
$$;

-- Trigger function for withdrawal rate limiting (max 5 per day)
CREATE OR REPLACE FUNCTION public.check_withdrawal_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT check_rate_limit(NEW.user_id, 'withdrawal', 5, 1440) THEN
    RAISE EXCEPTION 'Rate limit exceeded: Maximum 5 withdrawal requests per day';
  END IF;
  
  PERFORM record_rate_limit(NEW.user_id, 'withdrawal');
  RETURN NEW;
END;
$$;

-- Trigger function for support message rate limiting (max 10 per hour)
CREATE OR REPLACE FUNCTION public.check_support_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT check_rate_limit(NEW.user_id, 'support', 10, 60) THEN
    RAISE EXCEPTION 'Rate limit exceeded: Maximum 10 support messages per hour';
  END IF;
  
  PERFORM record_rate_limit(NEW.user_id, 'support');
  RETURN NEW;
END;
$$;

-- Trigger function for watch history rate limiting (max 30 per hour)
CREATE OR REPLACE FUNCTION public.check_watch_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT check_rate_limit(NEW.user_id, 'watch', 30, 60) THEN
    RAISE EXCEPTION 'Rate limit exceeded: Maximum 30 ad completions per hour';
  END IF;
  
  PERFORM record_rate_limit(NEW.user_id, 'watch');
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER enforce_withdrawal_rate_limit
  BEFORE INSERT ON public.withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION public.check_withdrawal_rate_limit();

CREATE TRIGGER enforce_support_rate_limit
  BEFORE INSERT ON public.support_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.check_support_rate_limit();

CREATE TRIGGER enforce_watch_rate_limit
  BEFORE INSERT ON public.watch_history
  FOR EACH ROW
  EXECUTE FUNCTION public.check_watch_rate_limit();

-- Cleanup function for old rate limit records (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE created_at < (now() - interval '24 hours');
END;
$$;