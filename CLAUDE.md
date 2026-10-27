# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A zero-infrastructure QR coupon system for a bakery ("Dulce Mezcla"), built entirely on **Google Sheets + Google Apps Script**. It generates, displays, prints, shares, and redeems single-use promotional coupons. No server, no Node, no build step, no paid APIs. UI text and domain data are in Spanish.

## How it runs (no local toolchain)

There is **no build, lint, or test command** — this is not a Node project. Code runs inside Google Apps Script. To develop or deploy:

1. Create a Google Sheet, open `Extensiones > Apps Script`.
2. Create matching files in the Apps Script editor and paste contents: `Code.gs`, plus `index.html`, `admin.html`, `qr-print.html`, `styles.html`, `scripts.html` (the `.html` files are Apps Script HTML files, not standalone web pages).
3. Set Script Properties (`Configuración del proyecto > Propiedades`): `PIN_ADMIN`, `BUSINESS_NAME`, `INSTAGRAM_URL`, `WHATSAPP_URL`, `LOGO_URL`, and `SPREADSHEET_ID` (only needed if the script is standalone, not bound to the Sheet).
4. Run `setup()` once from the editor and accept permissions.
5. `Implementar > Nueva implementación` → type *Aplicación web*, execute as *Yo*, access *Cualquier persona con el enlace*.
6. After deploying, run `repairCouponUrls()` if coupons were created before the current deployment (regenerates their redemption URLs from the live Web App URL).

Testing is **manual only**, against a live deployment — see README.md "Cómo probar el flujo completo". There is no way to run this code outside Apps Script.

`httpsdocs.google.com...txt` holds live deployment values (Sheet ID, deployment URL, PIN) for the current instance — operational notes, not code.

## Architecture

**Single Web App entry point.** `doGet(e)` in `Code.gs` routes by query param to one of three templates: `?admin=1` → `admin.html`, `?print=1` → `qr-print.html`, otherwise `index.html` (public coupon view, reached via `?code=...`). Each template is server-rendered with `HtmlService` and receives `initialCode`, `branding`, and `pageTitle` as template variables.

**Client ↔ server bridge.** The frontend never touches the Sheet directly. All data flows through `google.script.run`, wrapped in `scripts.html`'s `callServer(functionName, ...args)` promise helper. Server functions called from the client: `getCouponPublic`, `redeemCouponSimple`, `getAdminDashboard`, `generateCoupons`, `updateCouponStatus`, `deleteCoupon` / `deleteCouponsBulk`, `getPrintableCoupons`.

**`scripts.html` is the shared frontend library**, `include()`-d into all three pages. It contains the `callServer` bridge, HTML escaping, branding/share helpers, inline SVG icons, and `QrLocal` — a **from-scratch QR encoder** (Reed-Solomon ECC, masking, version 1–9) that renders SVGs entirely in the browser. No external QR library or API is used; if a redemption URL is too long for version 9, `QrLocal` throws. `styles.html` is shared CSS, also `include()`-d.

**Data model — the Sheet IS the database.** One sheet named `cupones` with fixed columns defined by `HEADERS` in `Code.gs`: `codigo, promocion, descripcion, estado, fecha_creacion, fecha_redencion, redimido_por, telefono_cliente, observacion, url_redencion`. Rows are read/written via positional column indices resolved by `headerMap_()`. `ensureHeaders_()` self-heals the header row.

**State machine.** `STATES` = `DISPONIBLE` → `REDIMIDO` (terminal), plus `ANULADO` (void, reactivatable back to DISPONIBLE) and `ELIMINADO` (soft delete — rows are never physically removed; deletion marks state and appends a timestamp to `observacion`). State transitions are enforced server-side in `redeemCouponSimple` and `updateCouponStatus`.

## Conventions and invariants

- **Trailing-underscore functions are private/server-internal** (`getSheet_`, `findCouponByCode_`, `cleanText_`, etc.). Functions without it are either the Web App lifecycle (`doGet`, `setup`) or RPC endpoints callable from the client.
- **Security model is intentionally minimal**: a single shared `PIN_ADMIN` checked server-side on *every* admin action via `isValidAdminPin_` (never trust the client). Public redemption is unauthenticated and one-click — the real double-redemption guard is `LockService.getScriptLock()` + server-side state re-check, not the UI. Any new admin endpoint must re-validate the PIN itself.
- **Always sanitize Sheet-bound text** through `cleanText_` (strips `<>`, caps length) and URLs through `cleanUrl_` (HTTPS-only). Codes go through `normalizeCode_` / `isValidCode_` (pattern `PREFIX-XXXXXX`, charset excludes ambiguous chars like O/0/I/1 via `CODE_CHARS`).
- **Redemption URLs are derived, not stored as source of truth**: `buildCouponUrl_` reads the live Web App URL from `ScriptApp.getService().getUrl()` and forces `/dev`→`/exec`. `rowToCoupon_` recomputes `url_redencion` on every read, so the stored column is effectively a cache (hence `repairCouponUrls()`).
- **Branding is config-driven** from Script Properties via `getBrandingConfig_()`, passed to every page and mirrored client-side by `normalizeBranding()`. A missing `LOGO_URL` falls back to a "DM" monogram.
- When editing the QR encoder in `scripts.html`, the `ECC` and `ALIGN` tables and the Galois-field setup are tightly coupled — changes there affect scannability and have no test harness, so verify by scanning a generated QR on a real device.
