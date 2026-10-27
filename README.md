# Herramienta gratuita de cupones QR para repostería

Proyecto simple para Google Sheets + Google Apps Script. Permite generar, visualizar, imprimir, compartir y redimir cupones promocionales únicos con QR, sin servidor propio, sin Firebase, sin Node y sin APIs pagas.

## Archivos

- `Code.gs`: backend de Apps Script, acceso a Google Sheets, generación, redención simple, estados y seguridad del panel por PIN.
- `index.html`: pantalla pública del cupón escaneado desde QR.
- `admin.html`: panel administrativo protegido por PIN.
- `qr-print.html`: vista imprimible de QR.
- `styles.html`: estilos responsive mobile-first.
- `scripts.html`: JavaScript compartido, botones de compartir y generador QR local.
- `README.md`: instrucciones de instalación, despliegue y prueba.

## Estructura de la hoja

La hoja se llama `cupones` y usa estas columnas:

`codigo`, `promocion`, `descripcion`, `estado`, `fecha_creacion`, `fecha_redencion`, `redimido_por`, `telefono_cliente`, `observacion`, `url_redencion`

Estados permitidos:

- `DISPONIBLE`
- `REDIMIDO`
- `ANULADO`

## Instalación paso a paso

1. Crea un Google Sheet nuevo.
2. Abre `Extensiones > Apps Script`.
3. Crea estos archivos en Apps Script y pega el contenido correspondiente:
   - `Code.gs`
   - `index.html`
   - `admin.html`
   - `qr-print.html`
   - `styles.html`
   - `scripts.html`
4. En Apps Script abre `Configuración del proyecto > Propiedades de secuencia de comandos`.
5. Agrega estas propiedades:
   - `PIN_ADMIN`: PIN para generar, listar, anular, reactivar e imprimir QR. Ejemplo: `8392`.
   - `BUSINESS_NAME`: `Dulce Mezcla`
   - `INSTAGRAM_URL`: `https://www.instagram.com/dulcemezcla.reposteria/`
   - `WHATSAPP_URL`: `https://api.whatsapp.com/send?phone=573143495267&text=Quiero%20preguntar%20por%20tus%20deliciosas%20tortas%20%F0%9F%92%96`
   - `LOGO_URL`: URL pública HTTPS del logo. Puede quedar vacía y se mostrará un monograma `DM`.
   - `SPREADSHEET_ID`: opcional si el script está vinculado al Sheet. Si usas script independiente, pega el ID del Google Sheet.
6. Ejecuta la función `setup()` desde el editor de Apps Script.
7. Acepta permisos de Google cuando los solicite.
8. Publica la Web App:
   - `Implementar > Nueva implementación`
   - Tipo: `Aplicación web`
   - Ejecutar como: `Yo`
   - Quién tiene acceso: `Cualquier persona con el enlace`
9. Copia la URL publicada. Debe verse parecido a:
   `https://script.google.com/macros/s/ID_DEPLOYMENT/exec`
10. Si ya tenías cupones creados antes de publicar esta versión, ejecuta `repairCouponUrls()` después del despliegue para regenerar sus enlaces.
11. Abre la URL con `?admin=1` para entrar al panel:
   `https://script.google.com/macros/s/ID_DEPLOYMENT/exec?admin=1`

## Primer uso

1. Entra al panel admin con `?admin=1`.
2. Escribe el `PIN_ADMIN`.
3. En "Generar códigos", selecciona:
   - Cantidad: `100`
   - Prefijo: `DULCE` o `MEZCLA`
   - Promoción: nombre corto de la promoción
   - Descripción: condiciones del cupón
4. Pulsa `Generar lote`.
5. Abre `Imprimir QR`.
6. Carga los QR con el `PIN_ADMIN`.
7. Imprime la hoja.

## Cómo probar el flujo completo

1. En el panel admin, genera `3` códigos.
2. En el listado, pulsa `Ver QR` en uno de ellos.
3. Abre el enlace del cupón o escanea el QR desde el celular.
4. La pantalla pública debe mostrar `Cupón válido`.
5. Pulsa `Redimir cupón`.
6. Debe cambiar a `REDIMIDO` y guardar la fecha/hora.
7. Vuelve a abrir el mismo QR.
8. Debe mostrar `Este cupón ya fue redimido`.
9. Intenta redimirlo otra vez.
10. Debe bloquearlo y no modificar de nuevo la fila.

## Seguridad simple incluida

- `PIN_ADMIN` configurable en `PropertiesService`.
- Validación básica de formato de código.
- Validación de estado antes de redimir.
- `LockService` para evitar doble redención simultánea.
- El público no edita directamente la hoja.
- Los cambios administrativos de estado requieren `PIN_ADMIN`.
- Sanitización básica de textos recibidos.

Nota importante: la redención pública ahora es de un clic. La protección real contra doble uso está en el servidor: se valida el estado en Google Sheets y se usa `LockService` antes de marcar el cupón como `REDIMIDO`.

## Compartir cupones

Cada cupón tiene botones para:

- WhatsApp: `https://wa.me/?text=TEXTO`
- Correo: `mailto:?subject=Tu cupón de descuento&body=TEXTO`
- Telegram: `https://t.me/share/url?url=URL_CUPON&text=TEXTO`
- Compartir nativo con `navigator.share()` si el navegador lo soporta.
- Descargar QR individual en formato SVG desde el panel admin.
- Descargar todos los QR visibles del listado como archivos SVG individuales.
- Vista imprimible para imprimir o guardar como PDF una hoja de QR.

No se usa WhatsApp Business API ni ninguna API paga.

## Límites gratuitos de Google Apps Script

Para unos 1000 cupones esta solución es adecuada. Ten presentes estos límites prácticos:

- Apps Script tiene cuotas diarias de ejecución y lectura/escritura.
- Las llamadas simultáneas son limitadas, aunque `LockService` ayuda a proteger la redención.
- La Web App puede tardar un poco si imprimes o renderizas 1000 QR de una vez.
- Google puede pedir reautorización si cambias permisos o propietario.

## Mejoras futuras opcionales

- Agregar exportación CSV desde el panel admin.
- Agregar fecha de vencimiento por promoción.
- Agregar una columna de sucursal o vendedor.
- Agregar búsqueda por teléfono del cliente.
- Agregar una vista solo para caja con foco exclusivo en redimir.
