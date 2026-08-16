# TechStore Analytics Premium — versión dinámica

Esta versión corrige los indicadores estáticos y agrega analítica local en tiempo real para pruebas.

## Qué cambia

- El carrito muestra el número real de productos agregados.
- El contador vuelve a 0 después de completar una compra porque el carrito se vacía correctamente.
- Usuarios locales, sesiones, conversión, compras, ingresos y eventos se actualizan automáticamente.
- Las compras simuladas quedan guardadas en `localStorage` de este navegador.
- Se muestra un historial de las últimas compras simuladas.
- Se agrega un botón para reiniciar los datos demo.
- Los eventos siguen preparados para Google Analytics 4.

## Cómo se calculan los indicadores locales

- **Usuarios locales:** 1 por navegador mientras no borres el almacenamiento local.
- **Sesiones:** 1 por sesión/pestaña del navegador.
- **Conversión:** compras simuladas / sesiones.
- **Compras:** número de eventos `purchase` completados.
- **Ingresos:** suma de los valores de las compras simuladas.
- **Eventos:** interacciones registradas por el sitio.

> Estos indicadores son de prueba local. Cuando se conecte GA4, Google Analytics centralizará los datos reales de todos los visitantes del sitio publicado.

## Actualizar tu proyecto actual

Sustituye `index.html`, `styles.css` y `script.js` por los archivos de esta versión. Conserva `config.js` y la carpeta `assets`.
