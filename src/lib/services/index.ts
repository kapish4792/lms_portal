/**
 * Service Layer — src/lib/services/
 *
 * These thin async wrappers are the ONLY callsites that touch the config files
 * (and later, the real API). Pages/components import from services, not from
 * config directly.
 *
 * Swap strategy (when backend is ready):
 *   1. In each service, replace `return Promise.resolve(STATIC_DATA)` with
 *      `return fetch('/api/...').then(r => r.json())`.
 *   2. Zero UI changes required — all consumers already `await` the service call.
 *
 * Barrel export — import everything from "@/lib/services".
 */

export { fontService } from "./font-service";
export { roleService } from "./role-service";
export { navService } from "./nav-service";
