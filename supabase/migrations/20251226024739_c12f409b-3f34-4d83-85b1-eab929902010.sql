-- Drop the existing public read policy
DROP POLICY IF EXISTS "Anyone can read settings" ON public.app_settings;

-- Create a new policy that only allows authenticated users to read settings
CREATE POLICY "Authenticated users can read settings" 
ON public.app_settings 
FOR SELECT 
USING (auth.uid() IS NOT NULL);