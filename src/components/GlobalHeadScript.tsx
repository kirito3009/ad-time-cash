import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function GlobalHeadScript() {
  const [script, setScript] = useState<string>('');

  useEffect(() => {
    const fetchGlobalScript = async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'global_head_script')
        .single();

      if (data?.value) {
        setScript(data.value);
      }
    };

    fetchGlobalScript();
  }, []);

  useEffect(() => {
    if (!script) return;

    // Create a container for the scripts
    const container = document.createElement('div');
    container.innerHTML = script;

    // Extract and execute scripts
    const scripts = container.querySelectorAll('script');
    scripts.forEach((originalScript) => {
      const newScript = document.createElement('script');
      
      // Copy attributes
      Array.from(originalScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      // Copy inline content
      if (originalScript.innerHTML) {
        newScript.innerHTML = originalScript.innerHTML;
      }
      
      document.head.appendChild(newScript);
    });

    // Handle non-script elements (like meta tags, links)
    const nonScriptElements = Array.from(container.children).filter(
      (el) => el.tagName.toLowerCase() !== 'script'
    );
    nonScriptElements.forEach((el) => {
      document.head.appendChild(el.cloneNode(true));
    });

    // Cleanup function
    return () => {
      scripts.forEach((_, index) => {
        const scriptElements = document.head.querySelectorAll('script[data-global-head="true"]');
        scriptElements.forEach((el) => el.remove());
      });
    };
  }, [script]);

  return null;
}
