import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';

export function GlobalBodyScript() {
  const [script, setScript] = useState<string>('');
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGlobalBodyScript = async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'global_body_script')
        .maybeSingle();

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

  if (!script || !isVisible) return null;

  return (
    <div 
      className="global-body-script fixed bottom-0 left-0 right-0 z-50 max-h-16 sm:max-h-24 md:max-h-32 overflow-hidden"
      data-script-key="global_body_script"
    >
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 z-[60] w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors"
        aria-label="Close ad"
      >
        <X className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>
      <div ref={containerRef} className="[&_img]:max-h-16 sm:[&_img]:max-h-24 md:[&_img]:max-h-32 [&_img]:object-cover [&_iframe]:max-h-16 sm:[&_iframe]:max-h-24 md:[&_iframe]:max-h-32" />
    </div>
  );
}
