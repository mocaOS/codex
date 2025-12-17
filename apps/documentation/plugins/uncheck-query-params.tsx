import type { ZudokuPlugin } from "zudoku";

/**
 * Plugin to uncheck all query parameters by default in the Zudoku playground.
 * This plugin injects client-side JavaScript that runs after the playground loads
 * to ensure all query parameter checkboxes start unchecked.
 */
const uncheckQueryParamsPlugin: ZudokuPlugin = {
  initialize: async () => {
    // No async initialization needed
  },

  getHead: () => {
    return (
      <script
        key="zudoku-uncheck-query-params"
        id="zudoku-uncheck-query-params"
      >
        {`
            (function() {
              // Only run on /api/** routes
              if (!window.location.pathname.startsWith('/api')) {
                return;
              }

              function uncheckQueryParams() {
                document.querySelectorAll('input[type="checkbox"][name^="queryParams"][name$=".active"]').forEach(function(input) {
                  const button = input.closest('.group')?.querySelector('button[role="checkbox"][data-slot="checkbox"]');
                  if (button && (button.getAttribute('aria-checked') === 'true' || button.getAttribute('data-state') === 'checked')) {
                    button.click();
                  }
                });
              }

              function setupDialogWatcher(dialog) {
                if (!dialog.querySelector('input[type="checkbox"][name^="queryParams"]')) return;
                
                const observer = new MutationObserver(function(mutations) {
                  mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.target.getAttribute('data-state') === 'open') {
                      setTimeout(uncheckQueryParams, 100);
                      setTimeout(uncheckQueryParams, 500);
                    }
                    if (mutation.addedNodes.length > 0) {
                      setTimeout(uncheckQueryParams, 100);
                    }
                  });
                });
                
                observer.observe(dialog, { attributes: true, attributeFilter: ['data-state'], childList: true, subtree: true });
                
                if (dialog.getAttribute('data-state') === 'open') {
                  setTimeout(uncheckQueryParams, 100);
                }
              }

              const mainObserver = new MutationObserver(function() {
                document.querySelectorAll('div[role="dialog"]').forEach(setupDialogWatcher);
              });

              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                  mainObserver.observe(document.body, { childList: true, subtree: true });
                  document.querySelectorAll('div[role="dialog"]').forEach(setupDialogWatcher);
                });
              } else {
                mainObserver.observe(document.body, { childList: true, subtree: true });
                document.querySelectorAll('div[role="dialog"]').forEach(setupDialogWatcher);
              }
            })();
        `}
      </script>
    );
  },
};

export default uncheckQueryParamsPlugin;
