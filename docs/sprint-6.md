# Sprint 6: celebracion, feedback y accesibilidad

Estado: implementado, validado y aprobado por el usuario.

## Como probar

1. Abrir el juego con el servidor HTTP local del IDE e iniciar una partida.
2. Obtener un 6: aparece una insignia de turno extra con una animacion breve y el dado resaltado. Elegir una ficha y comprobar que vuelve a tirar el mismo jugador.
3. Obtener 1-5 con todas las fichas en casa: el mensaje explica que hace falta un 6. Continuar permite avanzar de inmediato; esperar 8 segundos pasa automaticamente. La explicacion queda visible en el tablero.
4. Capturar una rival: vuelve a casa, su boton queda marcado con un contorno discontinuo y el mensaje identifica la captura.
5. Llegar justo al centro: la ficha terminada queda resaltada con su marca de llegada y aumenta el contador.
6. Usar Tab, Shift+Tab y Enter para tirar y elegir fichas. Comprobar el foco visible, Escape y volver al inicio. El dialogo nativo conserva la modalidad.
7. Activar la preferencia del sistema de reducir movimiento: las celebraciones y los resaltados siguen siendo comprensibles sin animaciones.
8. Completar una partida y reiniciar: se limpian los resaltados de la partida anterior.

## Pruebas reproducibles

Con Node, Edge y Playwright instalado en la carpeta temporal usada en los sprints anteriores:

~~~powershell
node --test tests/movement.test.mjs tests/resolution.test.mjs
$env:PLAYWRIGHT_MODULE = "$env:TEMP/pandasoft-validation/node_modules/playwright"
node tests/sprint4.browser.cjs
node tests/sprint6.browser.cjs
~~~

La prueba del Sprint 6 extiende el recorrido completo del Sprint 5: capturas en las cuatro salidas, llegadas, victoria y reinicio mediante controles reales. Agrega insignia del 6, anuncio del resultado, foco de dialogo, ayuda sin movimientos, espera automatica y resaltados. Cubre 1366x768, 1024x600, 390x844 y 320x640, con movimiento reducido en el ultimo caso. Las capturas se guardan en la carpeta temporal ludo-sprint6.

## Resultado de validacion

- 23 pruebas de reglas aprobadas.
- Sprint 6 y regresion del Sprint 4 aprobados en Edge en los cuatro tamanos indicados.
- Sin errores de JavaScript ni desborde horizontal; escritorio sin desplazamiento en los tamanos probados.
- Sintaxis de JavaScript y diferencias de Git verificadas.

## Limites

La semantica accesible y el foco se verifican en Edge; queda recomendable la escucha manual con un lector de pantalla real. El Sprint 7 conserva la revision final de dispositivos, textos y entrega v1. Las partidas siguen en memoria y se pierden al recargar.
