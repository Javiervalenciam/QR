const SHEET_NAME = 'cupones';
const HEADERS = [
  'codigo',
  'promocion',
  'descripcion',
  'estado',
  'fecha_creacion',
  'fecha_redencion',
  'redimido_por',
  'telefono_cliente',
  'observacion',
  'url_redencion',
  // --- Módulo de entrega en feria (control separado de la redención) ---
  // Estas columnas se agregan al final para NO desplazar las existentes.
  'entrega_estado',     // '' | PENDIENTE | ENTREGADO
  'fecha_entrega',      // timestamp cuando se entrega físicamente
  'entregado_por',      // quién entregó (ej. "Stand")
  'comentario_entrega'  // nota libre (ej. "Detalle entregado")
];

const STATES = {
  AVAILABLE: 'DISPONIBLE',
  REDEEMED: 'REDIMIDO',
  VOID: 'ANULADO',
  DELETED: 'ELIMINADO'
};

// REDIMIDO != ENTREGADO. La entrega es un segundo control para la feria:
// el cliente puede redimir desde casa (estado=REDIMIDO) y la entrega del
// premio/descuento se confirma en el stand (entrega_estado=ENTREGADO).
const DELIVERY_STATES = {
  PENDING: 'PENDIENTE',
  DELIVERED: 'ENTREGADO'
};

const DEFAULT_ADMIN_PIN = '1234';
const DEFAULT_BUSINESS_NAME = 'Dulce Mezcla';
const DEFAULT_INSTAGRAM_URL = 'https://www.instagram.com/dulcemezcla.reposteria/';
const DEFAULT_WHATSAPP_URL = 'https://api.whatsapp.com/send?phone=573143495267&text=Quiero%20preguntar%20por%20tus%20deliciosas%20tortas%20%F0%9F%92%96';
// LOGO_URL queda VACÍO por defecto: la URL anterior (ibb.co/...) era una PÁGINA de ImgBB,
// no una imagen, por eso el logo nunca cargaba. El logo real va embebido abajo en base64,
// así no depende de ibb.co, Drive ni ninguna URL externa.
const DEFAULT_LOGO_URL = '';
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// Logo "Dulce Mezcla" embebido (PNG 200px cuantizado ~5.6KB). Fallback estable del frontend.
const DEFAULT_LOGO_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAMAAACahl6sAAAA/1BMVEXbpJ9hk5SXzcicoZ304eCxZWCgwr3Qwr6Tgn1ic3Q6j5F8x8RQfoLNXFV7wr6Rv8A3eXv69/D9wsPu7e3819ZYs7L0dnH5qKb5uLX759r3l5P9vsD2iYWNlpTya2fOdm71gnz2xLn0optruLbPa2NRrKxvp6auurf78d7Xlo3Rg3vR5dqtiIORubiNi4jOxsWux8WLeXazgnzT1s2qlZB2mZfViYGxeXOw19DIY13JvLjvYV2OpaJteHnvXFqrqKUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACKOzbIAAAAQHRSTlP/////////////////////////////////////////////////////////////////////////////////////73leyQAAFFdJREFUeNrlXQd72zi2pROnTNv3SEJEEVglN9mWu9Od//+vFpViAwhQlCezg/12IsqUhIPbDi4ugSBkLY7jsPFvHOrLcOgytv51n8vY57Lz2WAIiOkbYv+fe7XLXxNIPBHIP7PFrYvAOAwHuwwP8s1dIOGr4zoQkH/s5T/YRtotmG90LDf5uqkJl1Yg4YTANPzXcMpXeUXPYCYRdFnBiOc8kEQO085f10biNsI5BskroP2KcWRafP6lgITxdOWbN47ERhLz6zKtDtd6ZcOwmkt4MBrvcjnjIO9D8oP2kAwrV2yR6eGYuZtq1UBiH25xOGns7cT2AhL+c4BYLx1DN2btFYAc1kliEKkG8GF/KTigv2UolmipgCyXzlgmcddgmt87d4MRtZozlClhZYpEnNhHDwZvaAm8zcUxO3QgGxmEoaRyOBo/u31gEwwhFTcoh2a/+8JQUPDs3jiYm1jhyKG5m/3fE0cwBmPSiBreGOD5YotfEtsavQEQ3XNv8mbA8WC7ncztfg1CEMF7iZAXigYc+UFgVDbDqo1DQOyweqOrUkLgLdq3cTwGw+n2fFhegV9OsB250f4AWmDY9+FB9Yrj0XyYM43vRe7lvCi0YMAgkHA299tzsig6TEPAh63s637xQcRhQTIrjfcMevMhcSeNY4S5ax979fP6+rocuQUPG/zecaRHbT31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';

function setup() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('PIN_ADMIN')) props.setProperty('PIN_ADMIN', DEFAULT_ADMIN_PIN);
  if (!props.getProperty('BUSINESS_NAME')) props.setProperty('BUSINESS_NAME', DEFAULT_BUSINESS_NAME);
  if (!props.getProperty('INSTAGRAM_URL')) props.setProperty('INSTAGRAM_URL', DEFAULT_INSTAGRAM_URL);
  if (!props.getProperty('WHATSAPP_URL')) props.setProperty('WHATSAPP_URL', DEFAULT_WHATSAPP_URL);
  if (!props.getProperty('LOGO_URL')) props.setProperty('LOGO_URL', DEFAULT_LOGO_URL);

  const sheet = getSheet_();
  ensureHeaders_(sheet);

  if (sheet.getLastRow() === 1) {
    const code = 'DULCE-DEMO01';
    sheet.appendRow([
      code,
      'Promocion de ejemplo',
      'Cupón demo para probar el flujo antes de generar lotes reales.',
      STATES.AVAILABLE,
      now_(),
      '',
      '',
      '',
      'Puedes anular este cupón cuando termines las pruebas.',
      buildCouponUrl_(code),
      '', // entrega_estado (vacío hasta redimir)
      '', // fecha_entrega
      '', // entregado_por
      ''  // comentario_entrega
    ]);
  }

  return {
    ok: true,
    message: 'Configuración lista. Revisa PIN_ADMIN y los datos de marca en PropertiesService.',
    sheetName: SHEET_NAME
  };
}

function doGet(e) {
  const params = (e && e.parameter) || {};
  const file = params.delivery === '1'
    ? 'delivery'
    : params.admin === '1'
      ? 'admin'
      : params.print === '1'
        ? 'qr-print'
        : 'index';
  const template = HtmlService.createTemplateFromFile(file);
  template.initialCode = normalizeCode_(params.code || '');
  template.branding = getBrandingConfig_();
  // URL pública absoluta (/exec). Necesaria porque dentro del iframe sandbox
  // (googleusercontent.com/userCodeAppPanel) los enlaces relativos como
  // "?delivery=1" se resuelven contra esa URL interna y abren una página vacía.
  template.webAppUrl = getWebAppUrl_();
  template.pageTitle = file === 'admin'
    ? 'Panel de cupones'
    : file === 'qr-print'
      ? 'Imprimir QR'
      : file === 'delivery'
        ? 'Validar entrega'
        : 'Cupón promocional';

  return template
    .evaluate()
    .setTitle(template.pageTitle)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getCouponPublic(code) {
  setupIfNeeded_();
  const normalizedCode = normalizeCode_(code);
  if (!isValidCode_(normalizedCode)) {
    return fail_('Código inválido.');
  }

  const sheet = getSheet_();
  const found = findCouponByCode_(normalizedCode, sheet);
  if (!found) return fail_('No encontramos este cupón.');
  const map = headerMap_(sheet);

  return {
    ok: true,
    coupon: rowToCoupon_(found.values, found.rowNumber, map),
    webAppUrl: getWebAppUrl_(),
    branding: getBrandingConfig_()
  };
}

function redeemCouponSimple(code) {
  setupIfNeeded_();
  const normalizedCode = normalizeCode_(code);
  if (!isValidCode_(normalizedCode)) return fail_('Código inválido.');

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const sheet = getSheet_();
    const found = findCouponByCode_(normalizedCode, sheet);
    if (!found) return fail_('No encontramos este cupón.');

    const map = headerMap_(sheet);
    const currentState = String(found.values[map.estado] || '').trim().toUpperCase();

    if (currentState === STATES.REDEEMED) {
      return fail_('Este cupón ya fue redimido.', rowToCoupon_(found.values, found.rowNumber, map));
    }

    if (currentState === STATES.VOID || currentState === STATES.DELETED) {
      return fail_('Este cupón no está disponible.', rowToCoupon_(found.values, found.rowNumber, map));
    }

    if (currentState !== STATES.AVAILABLE) {
      return fail_('El estado del cupón no permite redención.', rowToCoupon_(found.values, found.rowNumber, map));
    }

    const row = found.rowNumber;
    const values = found.values.slice();
    values[map.estado] = STATES.REDEEMED;
    values[map.fecha_redencion] = now_();
    values[map.redimido_por] = 'AUTO';
    // Al redimir, si el cupón aún no tiene estado de entrega, queda PENDIENTE
    // de entregar en el stand. NUNCA se pisa un ENTREGADO previo.
    if (map.entrega_estado !== undefined) {
      const currentDelivery = String(values[map.entrega_estado] || '').trim().toUpperCase();
      if (currentDelivery !== DELIVERY_STATES.DELIVERED) {
        values[map.entrega_estado] = DELIVERY_STATES.PENDING;
      }
    }
    sheet.getRange(row, 1, 1, HEADERS.length).setValues([values]);

    return {
      ok: true,
      message: 'Cupón redimido correctamente.',
      coupon: rowToCoupon_(values, row, map)
    };
  } catch (err) {
    return fail_('No se pudo redimir el cupón: ' + err.message);
  } finally {
    try {
      lock.releaseLock();
    } catch (err) {
      // La liberación puede fallar si el lock nunca fue tomado.
    }
  }
}

function redeemCoupon(code) {
  return redeemCouponSimple(code);
}

// ============================================================================
// MÓDULO DE ENTREGA (feria) — control separado de la redención.
// Todos los endpoints revalidan PIN_ADMIN en el servidor (nunca confiar en el
// cliente) y nunca borran datos: solo escriben las columnas de entrega.
// ============================================================================

// Consulta un cupón para el equipo del stand. Requiere PIN_ADMIN.
// Devuelve { ok, message, coupon } — coupon incluye entrega_estado/fecha_entrega.
function getCouponForDelivery(code, adminPin) {
  setupIfNeeded_();
  if (!isValidAdminPin_(adminPin)) return fail_('PIN de administrador incorrecto.');

  const normalizedCode = normalizeCode_(code);
  if (!isValidCode_(normalizedCode)) return fail_('Código inválido.');

  const sheet = getSheet_();
  const found = findCouponByCode_(normalizedCode, sheet);
  if (!found) return fail_('No encontramos este cupón.');

  const map = headerMap_(sheet);
  const coupon = rowToCoupon_(found.values, found.rowNumber, map);

  return {
    ok: true,
    message: deliveryMessageFor_(coupon),
    coupon: coupon
  };
}

// Marca un cupón como ENTREGADO. Requiere PIN_ADMIN + LockService.
// payload: { pin, codigo, entregado_por?, comentario_entrega? }
function markCouponDelivered(payload) {
  setupIfNeeded_();
  payload = payload || {};
  if (!isValidAdminPin_(payload.pin)) return fail_('PIN de administrador incorrecto.');

  const code = normalizeCode_(payload.codigo || '');
  if (!isValidCode_(code)) return fail_('Código inválido.');

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const sheet = getSheet_();
    const found = findCouponByCode_(code, sheet);
    if (!found) return fail_('No encontramos este cupón.');

    const map = headerMap_(sheet);
    const values = found.values.slice();
    const state = String(values[map.estado] || '').trim().toUpperCase();
    const delivery = String(values[map.entrega_estado] || '').trim().toUpperCase();

    if (state === STATES.DELETED) {
      return fail_('Cupón eliminado: no se puede entregar.', rowToCoupon_(values, found.rowNumber, map));
    }
    if (state === STATES.VOID) {
      return fail_('Cupón anulado: no se puede entregar.', rowToCoupon_(values, found.rowNumber, map));
    }
    if (state === STATES.AVAILABLE) {
      return fail_('Este cupón aún no ha sido redimido. No se puede entregar.', rowToCoupon_(values, found.rowNumber, map));
    }
    if (state !== STATES.REDEEMED) {
      return fail_('El estado del cupón no permite entrega.', rowToCoupon_(values, found.rowNumber, map));
    }
    if (delivery === DELIVERY_STATES.DELIVERED) {
      return fail_('Este cupón ya fue entregado.', rowToCoupon_(values, found.rowNumber, map));
    }

    values[map.entrega_estado] = DELIVERY_STATES.DELIVERED;
    values[map.fecha_entrega] = now_();
    if (map.entregado_por !== undefined) {
      values[map.entregado_por] = cleanText_(payload.entregado_por || 'Stand');
    }
    if (map.comentario_entrega !== undefined) {
      values[map.comentario_entrega] = cleanText_(payload.comentario_entrega || '');
    }
    sheet.getRange(found.rowNumber, 1, 1, HEADERS.length).setValues([values]);

    const coupon = rowToCoupon_(values, found.rowNumber, map);
    return {
      ok: true,
      message: 'Entrega confirmada.',
      coupon: coupon
    };
  } catch (err) {
    return fail_('No se pudo marcar la entrega: ' + err.message);
  } finally {
    try {
      lock.releaseLock();
    } catch (err) {
      // La liberación puede fallar si el lock nunca fue tomado.
    }
  }
}

// Opcional: guarda datos del cliente sin tocar estado/entrega. Requiere PIN.
// payload: { pin, codigo, cliente_nombre?, cliente_telefono? }
function updateCouponClientInfo(payload) {
  setupIfNeeded_();
  payload = payload || {};
  if (!isValidAdminPin_(payload.pin)) return fail_('PIN de administrador incorrecto.');

  const code = normalizeCode_(payload.codigo || '');
  if (!isValidCode_(code)) return fail_('Código inválido.');

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const sheet = getSheet_();
    const found = findCouponByCode_(code, sheet);
    if (!found) return fail_('No encontramos este cupón.');

    const map = headerMap_(sheet);
    const values = found.values.slice();
    if (payload.cliente_telefono !== undefined && map.telefono_cliente !== undefined) {
      values[map.telefono_cliente] = cleanText_(payload.cliente_telefono || '');
    }
    if (payload.cliente_nombre !== undefined && map.redimido_por !== undefined) {
      values[map.redimido_por] = cleanText_(payload.cliente_nombre || values[map.redimido_por] || '');
    }
    sheet.getRange(found.rowNumber, 1, 1, HEADERS.length).setValues([values]);

    return {
      ok: true,
      message: 'Datos del cliente actualizados.',
      coupon: rowToCoupon_(values, found.rowNumber, map)
    };
  } catch (err) {
    return fail_('No se pudieron guardar los datos: ' + err.message);
  } finally {
    try {
      lock.releaseLock();
    } catch (err) {
      // La liberación puede fallar si el lock nunca fue tomado.
    }
  }
}

// Mensaje contextual de entrega según estado/entrega del cupón.
function deliveryMessageFor_(coupon) {
  const state = String(coupon.estado || '').trim().toUpperCase();
  const delivery = String(coupon.entrega_estado || '').trim().toUpperCase();
  if (state === STATES.DELETED) return 'Cupón eliminado.';
  if (state === STATES.VOID) return 'Cupón anulado.';
  if (state === STATES.AVAILABLE) return 'Este cupón aún no ha sido redimido.';
  if (state === STATES.REDEEMED && delivery === DELIVERY_STATES.DELIVERED) return 'Este cupón ya fue entregado.';
  if (state === STATES.REDEEMED) return 'Cupón válido para entregar.';
  return 'Estado del cupón no reconocido.';
}

function getAdminDashboard(pin, filters) {
  setupIfNeeded_();
  if (!isValidAdminPin_(pin)) return fail_('PIN de administrador incorrecto.');

  const all = readCoupons_();
  const summary = summarize_(all);
  const state = cleanState_((filters && filters.estado) || '');
  const query = normalizeCode_((filters && filters.busqueda) || '');
  // Filtro de entrega: '' (todos) | PENDIENTE | ENTREGADO. Solo afecta REDIMIDOS.
  const deliveryFilter = cleanDeliveryState_((filters && filters.entrega) || '');

  const coupons = all.filter(function (coupon) {
    const matchesState = !state || coupon.estado === state;
    const isVisibleByDefault = state || coupon.estado !== STATES.DELETED;
    const matchesQuery = !query || coupon.codigo.indexOf(query) !== -1;
    let matchesDelivery = true;
    if (deliveryFilter) {
      const delivery = String(coupon.entrega_estado || '').trim().toUpperCase();
      if (deliveryFilter === DELIVERY_STATES.DELIVERED) {
        matchesDelivery = delivery === DELIVERY_STATES.DELIVERED;
      } else {
        // PENDIENTE = redimido y aún no entregado.
        matchesDelivery = coupon.estado === STATES.REDEEMED && delivery !== DELIVERY_STATES.DELIVERED;
      }
    }
    return matchesState && isVisibleByDefault && matchesQuery && matchesDelivery;
  });

  return {
    ok: true,
    summary: summary,
    coupons: coupons,
    webAppUrl: getWebAppUrl_(),
    branding: getBrandingConfig_()
  };
}

function generateCoupons(payload) {
  setupIfNeeded_();
  payload = payload || {};
  if (!isValidAdminPin_(payload.pin)) return fail_('PIN de administrador incorrecto.');

  const quantity = Math.max(1, Math.min(1000, Number(payload.cantidad || 1)));
  const prefix = normalizePrefix_(payload.prefijo || 'DULCE');
  const promo = cleanText_(payload.promocion || 'Promoción de repostería');
  const description = cleanText_(payload.descripcion || '');

  const sheet = getSheet_();
  const existing = existingCodes_(sheet);
  const created = [];
  const rows = [];

  for (let i = 0; i < quantity; i++) {
    const code = nextUniqueCode_(prefix, existing);
    existing[code] = true;
    created.push(code);
    rows.push([
      code,
      promo,
      description,
      STATES.AVAILABLE,
      now_(),
      '',
      '',
      '',
      '',
      buildCouponUrl_(code),
      '', // entrega_estado (vacío al generar; pasa a PENDIENTE al redimir)
      '', // fecha_entrega
      '', // entregado_por
      ''  // comentario_entrega
    ]);
  }

  if (rows.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows);
  }

  return {
    ok: true,
    message: 'Códigos generados: ' + rows.length,
    created: created,
    summary: summarize_(readCoupons_())
  };
}

function updateCouponStatus(payload) {
  setupIfNeeded_();
  payload = payload || {};
  if (!isValidAdminPin_(payload.pin)) return fail_('PIN de administrador incorrecto.');

  const code = normalizeCode_(payload.codigo || '');
  const action = String(payload.action || '').toLowerCase();
  if (!isValidCode_(code)) return fail_('Código inválido.');

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const sheet = getSheet_();
    const found = findCouponByCode_(code, sheet);
    if (!found) return fail_('No encontramos este cupón.');

    const map = headerMap_(sheet);
    const values = found.values.slice();
    const currentState = String(values[map.estado] || '').trim().toUpperCase();

    if (action === 'anular') {
      if (currentState === STATES.REDEEMED) return fail_('No se puede anular un cupón ya redimido.');
      if (currentState === STATES.DELETED) return fail_('No se puede anular un cupón eliminado.');
      values[map.estado] = STATES.VOID;
      values[map.observacion] = cleanText_(payload.observacion || values[map.observacion] || '');
    } else if (action === 'reactivar') {
      if (currentState === STATES.REDEEMED) return fail_('No se puede reactivar un cupón ya redimido.');
      if (currentState === STATES.DELETED) return fail_('No se puede reactivar un cupón eliminado.');
      values[map.estado] = STATES.AVAILABLE;
      values[map.fecha_redencion] = '';
      values[map.redimido_por] = '';
      values[map.telefono_cliente] = '';
    } else {
      return fail_('Acción no permitida.');
    }

    sheet.getRange(found.rowNumber, 1, 1, HEADERS.length).setValues([values]);
    return {
      ok: true,
      message: 'Estado actualizado.',
      coupon: rowToCoupon_(values, found.rowNumber, map),
      summary: summarize_(readCoupons_())
    };
  } catch (err) {
    return fail_('No se pudo actualizar el cupón: ' + err.message);
  } finally {
    try {
      lock.releaseLock();
    } catch (err) {
      // Ver comentario equivalente en redeemCoupon.
    }
  }
}

function deleteCoupon(code, adminPin) {
  return deleteCouponsBulk([code], adminPin);
}

function deleteCouponsBulk(codes, adminPin) {
  setupIfNeeded_();
  if (!isValidAdminPin_(adminPin)) return fail_('PIN de administrador incorrecto.');

  const normalizedCodes = (codes || [])
    .map(function (code) {
      return normalizeCode_(code);
    })
    .filter(function (code, index, list) {
      return isValidCode_(code) && list.indexOf(code) === index;
    });

  if (!normalizedCodes.length) return fail_('No hay cupones válidos para eliminar.');

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const sheet = getSheet_();
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return fail_('No hay cupones para eliminar.');

    const map = headerMap_(sheet);
    const data = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
    const codeSet = {};
    normalizedCodes.forEach(function (code) {
      codeSet[code] = true;
    });

    let updated = 0;
    data.forEach(function (row) {
      const rowCode = normalizeCode_(row[map.codigo]);
      if (!codeSet[rowCode]) return;
      if (String(row[map.estado] || '').trim().toUpperCase() === STATES.DELETED) return;
      row[map.estado] = STATES.DELETED;
      row[map.observacion] = cleanText_((row[map.observacion] || '') + ' Eliminado: ' + now_());
      updated++;
    });

    if (updated) {
      sheet.getRange(2, 1, data.length, HEADERS.length).setValues(data);
    }

    return {
      ok: true,
      message: 'Cupones marcados como ELIMINADO: ' + updated,
      updated: updated,
      summary: summarize_(readCoupons_())
    };
  } catch (err) {
    return fail_('No se pudieron eliminar los cupones: ' + err.message);
  } finally {
    try {
      lock.releaseLock();
    } catch (err) {
      // La liberación puede fallar si el lock nunca fue tomado.
    }
  }
}

function getPrintableCoupons(pin, filters) {
  const result = getAdminDashboard(pin, filters || {});
  if (!result.ok) return result;

  return {
    ok: true,
    coupons: result.coupons,
    summary: result.summary,
    webAppUrl: result.webAppUrl,
    branding: result.branding || getBrandingConfig_()
  };
}

function repairCouponUrls() {
  setupIfNeeded_();
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return {
      ok: true,
      message: 'No hay cupones para reparar.',
      updated: 0
    };
  }

  const map = headerMap_(sheet);
  const data = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  let updated = 0;

  data.forEach(function (row) {
    const code = normalizeCode_(row[map.codigo]);
    if (!code) return;
    const nextUrl = buildCouponUrl_(code);
    if (row[map.url_redencion] !== nextUrl) {
      row[map.url_redencion] = nextUrl;
      updated++;
    }
  });

  sheet.getRange(2, 1, data.length, HEADERS.length).setValues(data);
  return {
    ok: true,
    message: 'URLs de redención reparadas: ' + updated,
    updated: updated
  };
}

function setupIfNeeded_() {
  getSheet_();
}

function getSheet_() {
  const props = PropertiesService.getScriptProperties();
  const spreadsheetId = props.getProperty('SPREADSHEET_ID');
  const ss = spreadsheetId ? SpreadsheetApp.openById(spreadsheetId) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('No hay Google Sheet activo. Configura SPREADSHEET_ID en PropertiesService.');
  }

  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  ensureHeaders_(sheet);
  return sheet;
}

function ensureHeaders_(sheet) {
  // Garantiza que la hoja tenga al menos tantas columnas físicas como HEADERS,
  // para que leer/escribir las columnas nuevas de entrega nunca quede fuera de
  // rango en hojas antiguas que se hubieran recortado a 10 columnas.
  if (sheet.getMaxColumns() < HEADERS.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), HEADERS.length - sheet.getMaxColumns());
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  } else {
    const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
    const needsHeaders = HEADERS.some(function (header, index) {
      return String(firstRow[index] || '').trim() !== header;
    });
    if (needsHeaders) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    }
  }
  sheet.setFrozenRows(1);
}

function readCoupons_() {
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const map = headerMap_(sheet);

  return sheet
    .getRange(2, 1, lastRow - 1, HEADERS.length)
    .getValues()
    .map(function (row, index) {
      return rowToCoupon_(row, index + 2, map);
    })
    .filter(function (coupon) {
      return coupon.codigo;
    });
}

function findCouponByCode_(code, sheet) {
  sheet = sheet || getSheet_();
  const normalizedCode = normalizeCode_(code);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  const data = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  const map = headerMap_(sheet);
  for (let i = 0; i < data.length; i++) {
    if (normalizeCode_(data[i][map.codigo]) === normalizedCode) {
      return {
        rowNumber: i + 2,
        values: data[i]
      };
    }
  }
  return null;
}

function rowToCoupon_(row, rowNumber, map) {
  map = map || headerMap_(getSheet_());
  const coupon = {};
  HEADERS.forEach(function (header) {
    coupon[header] = row[map[header]] === undefined ? '' : String(row[map[header]]);
  });
  coupon.rowNumber = rowNumber;
  if (coupon.codigo) coupon.url_redencion = buildCouponUrl_(coupon.codigo);
  return coupon;
}

function headerMap_(sheet) {
  const headers = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const map = {};
  headers.forEach(function (header, index) {
    map[String(header).trim()] = index;
  });
  return map;
}

function existingCodes_(sheet) {
  const lastRow = sheet.getLastRow();
  const codes = {};
  if (lastRow < 2) return codes;
  const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  values.forEach(function (row) {
    const code = normalizeCode_(row[0]);
    if (code) codes[code] = true;
  });
  return codes;
}

function nextUniqueCode_(prefix, existing) {
  for (let attempts = 0; attempts < 1000; attempts++) {
    const code = prefix + '-' + randomSuffix_(6);
    if (!existing[code]) return code;
  }
  throw new Error('No se pudo generar un código único. Intenta de nuevo.');
}

function randomSuffix_(length) {
  let output = '';
  for (let i = 0; i < length; i++) {
    output += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
  }
  return output;
}

// Fuente ÚNICA de URLs públicas de cupón. Siempre /exec, nunca /dev.
function buildCouponUrl_(code) {
  const base = getWebAppUrl_();
  const cleanCode = encodeURIComponent(normalizeCode_(code));
  return base ? base + '?code=' + cleanCode : 'PEGA_AQUI_LA_URL_PUBLICADA?code=' + cleanCode;
}

function buildRedemptionUrl_(code) {
  return buildCouponUrl_(code);
}

function getWebAppUrl_() {
  // Si se define PUBLIC_WEBAPP_URL en Script Properties, esa manda (útil cuando el
  // despliegue /exec difiere del getUrl() del editor). Si no, usamos getUrl() forzando /exec.
  const configured = (PropertiesService.getScriptProperties().getProperty('PUBLIC_WEBAPP_URL') || '').trim();
  if (configured) return configured.replace('/dev', '/exec');
  try {
    return (ScriptApp.getService().getUrl() || '').replace('/dev', '/exec');
  } catch (err) {
    return '';
  }
}

function getBrandingConfig_() {
  const props = PropertiesService.getScriptProperties();
  return {
    businessName: cleanText_(props.getProperty('BUSINESS_NAME') || DEFAULT_BUSINESS_NAME),
    instagramUrl: cleanUrl_(props.getProperty('INSTAGRAM_URL') || DEFAULT_INSTAGRAM_URL),
    whatsappUrl: cleanUrl_(props.getProperty('WHATSAPP_URL') || DEFAULT_WHATSAPP_URL),
    logoUrl: cleanLogoUrl_(props.getProperty('LOGO_URL') || DEFAULT_LOGO_URL),
    logoDataUri: DEFAULT_LOGO_DATA_URI
  };
}

function summarize_(coupons) {
  const summary = {
    total: coupons.length,
    disponibles: 0,
    redimidos: 0,
    anulados: 0,
    eliminados: 0,
    pendientes_entrega: 0,
    entregados: 0
  };
  coupons.forEach(function (coupon) {
    if (coupon.estado === STATES.AVAILABLE) summary.disponibles++;
    if (coupon.estado === STATES.REDEEMED) summary.redimidos++;
    if (coupon.estado === STATES.VOID) summary.anulados++;
    if (coupon.estado === STATES.DELETED) summary.eliminados++;
    // Entrega solo aplica a cupones REDIMIDOS.
    if (coupon.estado === STATES.REDEEMED) {
      const delivery = String(coupon.entrega_estado || '').trim().toUpperCase();
      if (delivery === DELIVERY_STATES.DELIVERED) summary.entregados++;
      else summary.pendientes_entrega++;
    }
  });
  return summary;
}

function isValidAdminPin_(pin) {
  return String(pin || '') === String(PropertiesService.getScriptProperties().getProperty('PIN_ADMIN') || DEFAULT_ADMIN_PIN);
}

function isValidCode_(code) {
  return /^[A-Z0-9]+-[A-Z0-9]{6,12}$/.test(normalizeCode_(code));
}

function normalizeCode_(code) {
  return String(code || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .slice(0, 40);
}

function normalizePrefix_(prefix) {
  const clean = String(prefix || 'DULCE').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
  return clean || 'DULCE';
}

function cleanState_(state) {
  const clean = String(state || '').trim().toUpperCase();
  return [STATES.AVAILABLE, STATES.REDEEMED, STATES.VOID, STATES.DELETED].indexOf(clean) >= 0 ? clean : '';
}

function cleanDeliveryState_(state) {
  const clean = String(state || '').trim().toUpperCase();
  return [DELIVERY_STATES.PENDING, DELIVERY_STATES.DELIVERED].indexOf(clean) >= 0 ? clean : '';
}

function cleanText_(value) {
  return String(value || '').trim().replace(/[<>]/g, '').slice(0, 500);
}

function cleanUrl_(value) {
  const url = String(value || '').trim();
  return /^https:\/\/[^\s<>"]+$/i.test(url) ? url.slice(0, 1000) : '';
}

// Solo acepta LOGO_URL si apunta a una IMAGEN directa (png/jpg/webp/gif/svg).
// Así descarta páginas como https://ibb.co/xxxx (que no son imágenes y nunca cargan)
// y deja que el frontend use el logo embebido en base64.
function cleanLogoUrl_(value) {
  const url = cleanUrl_(value);
  if (!url) return '';
  return /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(url) ? url : '';
}

function now_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

function fail_(message, coupon) {
  const output = {
    ok: false,
    message: message || 'Ocurrió un error.'
  };
  if (coupon) output.coupon = coupon;
  return output;
}
