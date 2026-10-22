'use strict';
// Initialize store-origin app metadata from the authenticated user's installed list.
// Runtime privileges always depend on main-process installed app checks.
(() => {
 const api=window.airOS?.appStore,registry=window.airAppRegistry;
 if(!api||!registry)return;
 api.installed().then(entries=>registry.syncInstalled(entries)).catch(error=>console.warn('Installed Air-OS apps unavailable:',error));
})();
