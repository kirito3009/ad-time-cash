import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PageScriptBlockProps {
  settingKey: 'home_page_script' | 'dashboard_page_script' | 'watch_page_script';
  className?: string;
}

export function PageScriptBlock({ settingKey, className = '' }: PageScriptBlockProps) {
  const [script, setScript] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchScript = async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', settingKey)
        .single();

      if (data?.value) {
        setScript(data.value);
      }
    };

    fetchScript();
  }, [settingKey]);

  useEffect(() => {
    if (!script || !containerRef.current) return;

    // Clear previous content
    containerRef.current.innerHTML = '';

    // Parse the HTML/script content
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = script;

    // Clone non-script elements first
    Array.from(tempContainer.children).forEach((child) => {
      if (child.tagName.toLowerCase() !== 'script') {
        containerRef.current?.appendChild(child.cloneNode(true));
      }
    });

    // Handle scripts separately (they need to be created dynamically to execute)
    const scripts = tempContainer.querySelectorAll('script');
    scripts.forEach((originalScript) => {
      const newScript = document.createElement('script');
      
      // Copy all attributes
      Array.from(originalScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      // Copy inline content
      if (originalScript.innerHTML) {
        newScript.innerHTML = originalScript.innerHTML;
      }
      
      containerRef.current?.appendChild(newScript);
    });
  }, [script]);

  if (!script) return null;

  return (
    <div 
      ref={containerRef} 
      className={`page-script-block ${className}`}
      data-script-key={settingKey}
    />
  );
}
