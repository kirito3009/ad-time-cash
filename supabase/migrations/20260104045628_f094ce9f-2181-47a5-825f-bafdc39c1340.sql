-- Add streak columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS current_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_streak_date date;

-- Create function to update user streak
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_date date;
  v_current_streak integer;
  v_longest_streak integer;
  v_today date := CURRENT_DATE;
  v_bonus numeric := 0;
BEGIN
  -- Get current streak data
  SELECT last_streak_date, current_streak, longest_streak 
  INTO v_last_date, v_current_streak, v_longest_streak
  FROM public.profiles 
  WHERE id = p_user_id;

  -- If already updated today, do nothing
  IF v_last_date = v_today THEN
    RETURN;
  END IF;

  -- Calculate new streak
  IF v_last_date = v_today - 1 THEN
    -- Consecutive day - increment streak
    v_current_streak := COALESCE(v_current_streak, 0) + 1;
  ELSIF v_last_date IS NULL OR v_last_date < v_today - 1 THEN
    -- Streak broken or first time - reset to 1
    v_current_streak := 1;
  END IF;

  -- Update longest streak if needed
  IF v_current_streak > COALESCE(v_longest_streak, 0) THEN
    v_longest_streak := v_current_streak;
  END IF;

  -- Calculate milestone bonuses
  IF v_current_streak = 7 THEN
    v_bonus := 0.50;
  ELSIF v_current_streak = 14 THEN
    v_bonus := 1.00;
  ELSIF v_current_streak = 30 THEN
    v_bonus := 3.00;
  ELSIF v_current_streak = 100 THEN
    v_bonus := 10.00;
  END IF;

  -- Update profile with new streak data and bonus
  UPDATE public.profiles
  SET 
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_streak_date = v_today,
    total_earnings = total_earnings + v_bonus,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;

-- Create trigger to update streak on watch completion
CREATE OR REPLACE FUNCTION public.trigger_update_streak()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.completed = true THEN
    PERFORM update_user_streak(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS on_watch_completed_streak ON public.watch_history;
CREATE TRIGGER on_watch_completed_streak
  AFTER INSERT ON public.watch_history
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_streak();