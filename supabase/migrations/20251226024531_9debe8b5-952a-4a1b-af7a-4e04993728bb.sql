-- Remove sensitive tracking columns from watch_history table
-- These columns (ip_address, device_info) are not used in the application
-- and pose unnecessary privacy risks

ALTER TABLE public.watch_history DROP COLUMN IF EXISTS ip_address;
ALTER TABLE public.watch_history DROP COLUMN IF EXISTS device_info;