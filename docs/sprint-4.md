# Sprint 4: salida y movimiento

Estado: implementado, validado y aprobado por el usuario.

## Como probar

1. Abrir el juego mediante un servidor HTTP local (por ejemplo, el del IDE) y pulsar Empezar a jugar.
2. Tirar el dado. Mientras todas las fichas esten en casa, un 1-5 muestra el resultado y pasa de jugador automaticamente.
3. Con un 6, pulsar Elegir ficha. Se resaltan las cuatro fichas del jugador activo.
4. Elegir un numero en su tarjeta: esa ficha sale a su casilla inicial, baja el contador de casa y el mismo jugador vuelve a tirar.
5. Con una ficha activa, elegirla para moverla exactamente el numero obtenido. Con otro 6 tambien se puede elegir una ficha que siga en casa.
6. Con una ficha en la salida, obtener otro 6: las fichas de casa deben quedar deshabilitadas. Mover la activa y comprobar que, con un nuevo 6, se puede sacar otra. Si el destino exacto de un movimiento tiene una ficha propia, ese movimiento tambien queda deshabilitado.
7. Probar Tab y Enter, tocar una ficha en movil y volver a Inicio mientras se elige ficha. La eleccion se conserva al entrar nuevamente.
8. Intentar pulsar otra ficha o el dado durante el movimiento: no debe iniciarse otra accion.

El dado sigue siendo aleatorio en el juego. La prueba automatica controla los resultados solo dentro de su navegador de prueba; no hay controles de depuracion en la interfaz.

## Pruebas reproducibles

Desde la raiz, con Node instalado:

```powershell
node --test tests/movement.test.mjs
```

Para la prueba de navegador se requiere Playwright y Edge. Puede instalarse Playwright en una carpeta temporal sin agregar dependencias al juego:

```powershell
npm install --prefix "$env:TEMP/pandasoft-validation" playwright --no-audit --no-fund
$env:PLAYWRIGHT_MODULE = "$env:TEMP/pandasoft-validation/node_modules/playwright"
node tests/sprint4.browser.cjs
```

La prueba inicia y cierra su propio servidor HTTP y navegador. Guarda capturas en `$env:TEMP/ludo-sprint4`. Se puede indicar otro canal de Chromium instalado mediante `PLAYWRIGHT_CHANNEL`.

## Resultado de validacion

- 13 pruebas de reglas aprobadas, incluyendo todos los avances legales para cada posicion y resultado 1-6.
- Edge: 1366x768 y 1024x600 sin desplazamiento; 390x844 y 320x640 sin desborde horizontal.
- Movimiento reducido probado en 320x640.
- Salida con 6, turnos sin movimiento, vuelta de turno, bloqueo de salida y destino ocupado por ficha propia y seis pasos consecutivos comprobados.
- Seleccion por teclado, tacto y tablero; fichas rivales no seleccionables; segundo clic bloqueado durante movimiento.
- Escape durante la tirada no interrumpe el estado; reentrada desde Inicio conserva la seleccion.
- Sin errores de JavaScript en estas pruebas.

## Limites de esta entrega

Capturas, ganador y reinicio tras victoria corresponden al Sprint 5. La ruta ya tiene un limite exacto al centro para evitar posiciones invalidas; las fichas que llegan alli dejan de moverse. Las partidas solo se conservan en memoria mientras la pagina sigue abierta.
