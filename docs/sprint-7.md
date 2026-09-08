# Sprint 7: pruebas, pulido y entrega v1

Estado: implementado y validado automaticamente; pendiente de aceptacion manual del usuario.

## Entrega

- Servidor local sin dependencias, comandos npm y README con instrucciones de ejecucion, pruebas y archivos de distribucion.
- Reglas iniciales con tildes corregidas y espaciado para notebooks de poca altura, incluso sin las fuentes externas.
- Dialogo del dado compacto para movil horizontal, con la accion visible.
- Boton Continuar partida cuando se vuelve a Inicio durante una partida.
- La intro deja de bloquear la interfaz tras 5 segundos aunque el logo se demore.
- Documento tecnico actualizado con version, estructura y fases reales; corregida la regla que describia la seleccion de fichas en casa.

## Validacion automatica

npm test ejecuta las reglas. npm run test:browser ejecuta tests/sprint7.browser.cjs y reutiliza la partida completa del Sprint 6 con seis tamanos:

| Pantalla | Movimiento |
| --- | --- |
| 1366x768 | Normal |
| 1024x600 | Normal |
| 390x844 | Normal |
| 320x640 | Reducido |
| 844x390 | Normal, horizontal |
| 768x1024 | Normal, tablet |

Se comprueban portada sin fuentes externas, MIME de modulos, rutas del servidor, doble evento de tirada y seleccion, Escape, continuidad al volver a Inicio, recarga, logo demorado, capturas en las cuatro salidas, llegada exacta, victoria y reinicio. Se revisan desbordes y foco. Las capturas de inicio, dado, tablero y victoria quedan en la carpeta temporal ludo-sprint7.

## Resultados registrados

- 23 pruebas de reglas aprobadas con npm test.
- Pruebas de inicio, navegacion y doble evento aprobadas en los seis tamanos.
- Seis partidas completas aprobadas, con captura, llegada, victoria y reinicio.
- Servidor local y liberacion de la intro con recurso demorado aprobados.
- Sin errores JavaScript ni desborde horizontal en las pruebas; portada y tablero sin desplazamiento en los dos tamanos de escritorio.
- Boton del dado visible sin desplazar el dialogo, incluido horizontal.
- Revision visual de capturas de portada de notebook y dado horizontal; sintaxis JavaScript y git diff --check aprobados.

## Revision manual de aceptacion

1. Ejecutar npm start y abrir http://127.0.0.1:4173.
2. Jugar entre cuatro personas; comprobar que nombres, dado y fichas se entienden sin explicacion adicional.
3. Sacar fichas, capturar una rival, entrar al carril seguro y llevar cuatro fichas al centro con llegada exacta.
4. Volver a Inicio durante una seleccion, usar Continuar partida y completar la jugada.
5. Revisar la victoria, volver a Inicio, abrir Ver resultado y elegir Jugar otra vez.
6. Repetir las acciones principales con teclado y con la preferencia de movimiento reducido; revisar en un movil real y escuchar los anuncios con un lector de pantalla.

Las partidas completas de la suite son automaticas mediante controles reales del navegador. La partida entre personas, los dispositivos fisicos y la escucha con lector de pantalla quedan para la revision manual del usuario; no se presentan como pruebas ya realizadas.

## Limites de v1

Partida local en memoria, cuatro nombres provisionales, sin bots ni red. Recargar inicia de nuevo. Las fuentes externas tienen alternativas del sistema. La validacion automatica se realiza en Edge con viewports y tacto emulados; no certifica Safari, Firefox ni dispositivos fisicos. No se ha publicado el sitio. Ver README.md para ejecutar y distribuir los archivos estaticos.
