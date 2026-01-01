import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function GlobalBodyScript() {
  const [script, setScript] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGlobalBodyScript = async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'global_body_script')
        .single();

      if (data?.value) {
        setScript(data.value);
      }
    };

    fetchGlobalBodyScript();
  }, []);

  useEffect(() => {
    if (!script || !containerRef.current) return;

    // Clear previous content
    containerRef.current.innerHTML = '';

    // Parse the HTML/script content
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = script;

    // Clone non-script elements first (like container divs)
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
      className="global-body-script fixed bottom-0 left-0 right-0 z-50"
      data-script-key="global_body_script"
    />
  );
}
