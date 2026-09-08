# Sprint 5: capturas, llegada y victoria

Estado: implementado, validado y aprobado por el usuario.

## Como probar

1. Abrir el juego mediante el servidor HTTP local del IDE e iniciar una partida.
2. Sacar fichas y avanzar. Al terminar exactamente sobre una rival en el recorrido comun, la rival vuelve a casa y aparece el mensaje de captura. Pasar por encima no captura.
3. Si una rival ocupa tu salida, sacar una ficha con 6 la captura. Si la ocupa una ficha propia, no se permite sacar otra.
4. Recorrer el tablero y entrar en el carril del color propio. Alli la ficha queda protegida.
5. Llegar al centro con el numero exacto. Un resultado mayor deja esa ficha deshabilitada; una llegada valida aumenta el contador y marca la ficha como terminada.
6. Llevar las cuatro fichas al centro. Debe aparecer el ganador, con el dado y las fichas bloqueados.
7. Elegir Volver al inicio, o usar Escape, y pulsar Ver resultado para consultar la victoria otra vez.
8. Pulsar Jugar otra vez. Deben volver las dieciseis fichas a casa, comenzar Sol y funcionar una nueva tirada.

Los turnos extra corresponden solo al 6; capturar o llegar al centro no agrega tiradas por si mismo. Ganar termina la partida aunque el ultimo resultado sea 6.

## Pruebas reproducibles

Desde la raiz del proyecto:

```powershell
node --test tests/movement.test.mjs tests/resolution.test.mjs
```

Con Playwright instalado y Edge disponible:

```powershell
npm install --prefix "$env:TEMP/pandasoft-validation" playwright --no-audit --no-fund
$env:PLAYWRIGHT_MODULE = "$env:TEMP/pandasoft-validation/node_modules/playwright"
node tests/sprint4.browser.cjs
node tests/sprint5.browser.cjs
```

Cada prueba inicia y cierra su propio servidor local y navegador. La del Sprint 5 controla el reloj y los resultados solo dentro de esa sesion de prueba, para recorrer una partida completa sin esperas manuales. No inyecta posiciones de fichas: las mueve a traves de los controles del juego.

## Validacion

- 23 pruebas de reglas aprobadas.
- Regresion de salida, seleccion, movimiento, casilla propia ocupada y navegacion.
- Capturas en las cuatro salidas mediante jugadas reales, llegada exacta de cuatro fichas, victoria y reinicio.
- Edge en 1366x768, 1024x600, 390x844 y 320x640, con movimiento reducido en el ultimo caso.
- Sin desplazamiento de escritorio ni desborde horizontal en los tamanos comprobados.
- Capturas de victoria en `$env:TEMP/ludo-sprint5`.

## Pendiente

El Sprint 6 agrega celebraciones y refina el feedback y la accesibilidad. El Sprint 7 completa el pulido y la revision de entrega v1. La partida sigue guardada solo en memoria: recargar la pagina inicia una nueva.
