-- Insert new script-related settings for Adsterra integration
INSERT INTO app_settings (key, value, description) VALUES 
  ('global_head_script', '', 'Custom script/code to inject in the <head> tag on all pages'),
  ('home_page_script', '', 'Custom script/code to inject on the Home/Landing page'),
  ('dashboard_page_script', '', 'Custom script/code to inject on the Dashboard page'),
  ('watch_page_script', '', 'Custom script/code to inject on the Watch Ads page')
ON CONFLICT (key) DO NOTHING;