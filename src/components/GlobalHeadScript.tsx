import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const HEAD_SAFE_TAGS = new Set(['meta', 'link', 'style', 'title', 'base']);

function copyAttributes(from: Element, to: HTMLElement) {
  Array.from(from.attributes).forEach((attr) => {
    to.setAttribute(attr.name, attr.value);
  });
}

function escapeAttrValue(value: string) {
  return value.split('"').join('\\"');
}

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

    // Remove any previously injected nodes
    document
      .querySelectorAll<HTMLElement>('[data-global-head="true"]')
      .forEach((el) => el.remove());

    const container = document.createElement('div');
    container.innerHTML = script;

    // If the global script contains an Adsterra "invoke.js" snippet (which is meant
    // to be placed in the page body with a container div), we skip injecting it here.
    const hasInvokeContainer = !!container.querySelector('[id^="container-"]');

    const injected: HTMLElement[] = [];

    // Inject scripts (head only)
    const scripts = container.querySelectorAll('script');
    scripts.forEach((originalScript) => {
      const src = originalScript.getAttribute('src');

      // Skip Adsterra invoke scripts when the snippet also contains a container div.
      if (src && hasInvokeContainer && /effectivegatecpm\.com\/.+\/invoke\.js/i.test(src)) {
        return;
      }

      if (src) {
        const selector = `script[src="${escapeAttrValue(src)}"]`;
        if (document.querySelector(selector)) return;
      }

      const id = originalScript.getAttribute('id');
      if (id && document.getElementById(id)) return;

      const newScript = document.createElement('script');
      copyAttributes(originalScript, newScript);
      newScript.setAttribute('data-global-head', 'true');

      if (originalScript.innerHTML) {
        newScript.innerHTML = originalScript.innerHTML;
      }

      document.head.appendChild(newScript);
      injected.push(newScript);
    });

    // Inject ONLY head-safe elements (meta/link/style/title/base)
    Array.from(container.children).forEach((child) => {
      const tag = child.tagName.toLowerCase();
      if (tag === 'script') return;
      if (!HEAD_SAFE_TAGS.has(tag)) return;

      const cloned = child.cloneNode(true) as HTMLElement;
      cloned.setAttribute('data-global-head', 'true');
      document.head.appendChild(cloned);
      injected.push(cloned);
    });

    return () => {
      injected.forEach((el) => el.remove());
    };
  }, [script]);

  return null;
}

