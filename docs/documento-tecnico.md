# Ludo Matic - Documento tecnico

**Version:** 1.0
**Estado:** v1 implementada y validada automaticamente; pendiente de aceptacion manual
**Plataforma objetivo:** Navegador web de escritorio y movil
**Idioma inicial:** Espanol

## 1. Objetivo

Crear una version web de Ludo Matic, visual, accesible y sencilla para ninos. La partida se juega en un tablero de cuatro colores y el desplazamiento de las fichas es automatico: la persona decide que ficha mover y la interfaz reproduce el recorrido.

La partida local permite elegir de 2 a 4 jugadores en el mismo dispositivo. La arquitectura debe permitir agregar nombres configurables, bots y juego en red mas adelante sin rehacer las reglas.

## 2. Alcance de la primera version

### Incluido

- Pantalla principal con logo centrado, explicacion breve de reglas y boton de inicio.
- Tablero de Ludo con cuatro zonas: verde, rojo, azul y amarillo.
- Selector inicial de 2, 3 o 4 jugadores, cada uno con cuatro fichas.
- Tarjetas de jugador ubicadas en los extremos de la pantalla.
- Nombre del jugador seleccionado desde una lista configurable.
- Indicacion visual del color, fichas en casa y fichas en el tablero.
- Turnos en sentido horario.
- Dado D6 virtual con animacion y resultado aleatorio del 1 al 6.
- Salida de una ficha con un 6.
- Seleccion de una ficha valida y movimiento automatico casilla a casilla.
- Resaltado de las fichas que pueden moverse.
- Captura de fichas rivales.
- Casillas de llegada seguras y entrada exacta al centro.
- Turno extra al sacar 6.
- Celebracion visual y aviso de turno extra.
- Deteccion de ganador cuando sus cuatro fichas llegan al centro.
- Resumen de cada sprint y pasos de prueba.

### Fuera del primer alcance

- Multijugador online.
- Registro de cuentas y persistencia en servidor.
- Chat, ranking y monetizacion.
- Sonidos con licencia o assets externos no aprobados.
- Variantes de reglas configurables desde la interfaz.

## 3. Reglas funcionales de Ludo Matic v1

Estas reglas fijan una unica variante para evitar ambiguedades durante el desarrollo. Las reglas podran parametrizarse mas adelante.

1. Participan de 2 a 4 jugadores. Con 2 se usan azul y rojo, enfrentados; con 3 se agrega amarillo; con 4, verde.
2. Cada jugador empieza con cuatro fichas fuera del recorrido, en su zona de casa.
3. Empieza azul; los turnos avanzan en sentido horario solamente entre los participantes.
4. En su turno, la persona pulsa el cubiculo central del dado.
5. El dado produce un numero entero aleatorio entre 1 y 6, ambos incluidos.
6. Una ficha en casa solo puede entrar en su casilla de salida al obtener un 6.
7. Al obtener un 6, si quedan fichas en casa, la persona puede sacar una ficha o mover una ficha ya activa seis casillas.
8. Si no hay movimientos validos, el turno termina automaticamente y pasa al siguiente jugador, salvo que corresponda el turno extra por 6.
9. Una ficha activa avanza exactamente el numero obtenido por el recorrido comun.
10. Al entrar en la columna final de su color, la ficha no puede ser capturada.
11. Para llegar al centro se necesita el numero exacto de casillas restantes. No se permite pasarse.
12. Si una ficha termina sobre una ficha rival en el recorrido comun, la rival vuelve a su casa. Las casillas de salida tambien son capturables; solo las columnas finales, casa y fichas terminadas estan protegidas. Pasar por encima no captura.
13. Una ficha no puede terminar en una casilla ocupada por otra del mismo jugador. Esto incluye la salida: si esta ocupada por una propia, un 6 no permite sacar otra. Se permite pasar por encima si el destino esta libre de fichas propias. Las fichas terminadas no bloquean el centro.
14. Las fichas en casa solo son seleccionables para salir con 6 si la salida esta libre de fichas propias. Las que ya llegaron al centro no se seleccionan.
15. Obtener un 6 concede un turno extra despues de resolver el movimiento. La celebracion debe indicarlo claramente.
16. Gana el primer jugador que lleva sus cuatro fichas al centro. La partida termina con una pantalla de victoria y opcion de reiniciar.

## 4. Modelo de dominio

### Entidades

- `Player`: id, nombre, color, orden, fichas.
- `Token`: id, jugador, estado y posicion logica.
- `GameState`: fase, jugadores, jugador en turno, ultimo dado, movimientos posibles y ganador.
- `Board`: recorrido comun, salidas, columnas finales, centro y casillas seguras.

### Estados de una ficha

- `home`: esta en la zona del jugador.
- `active`: esta en el recorrido o en la columna final.
- `finished`: llego al centro.

La posicion se guardara con una coordenada logica, independiente de los pixeles de la interfaz. La vista traducira esa posicion a una casilla del tablero.

### Fases de la partida

`waiting-roll -> rolling -> roll-result -> choosing-token -> moving -> waiting-roll`. La victoria termina en `won`; no hay pausa implementada.

Las fases propuestas anteriormente setup y resolving no se almacenan: la inicializacion y la resolucion se realizan directamente.

## 5. Arquitectura vigente

La aplicacion web estatica utiliza:

- **HTML semantico:** estructura de pantallas, tablero, tarjetas, dialogos y mensajes.
- **CSS moderno:** variables de color, Grid/Flexbox, responsive design, transiciones y animaciones.
- **JavaScript modular:** estado del juego, reglas puras, generador de dado, controlador de turnos, renderizado y animaciones.
- **Sin backend en v1:** toda la partida vive en memoria del navegador.

La estructura vigente es:

~~~text
/
  index.html
  PandaSoftLogo.png
  package.json
  README.md
  css/styles.css
  js/app.js
  js/branding.js
  js/game/state.mjs
  js/game/rules.mjs
  js/game/board.mjs
  scripts/serve.cjs
  tests/
  docs/
~~~

No se incorporara un framework en la primera iteracion: HTML, CSS y JavaScript nativos son suficientes para una experiencia local y reducen dependencias. Se evaluara incorporar una libreria solo si las animaciones o el estado lo justifican.

## 6. Experiencia de usuario

### Pantalla principal

- Logo de Ludo Matic centrado en la zona superior.
- Tarjeta de reglas escrita con frases cortas y lenguaje infantil.
- Boton principal `Empezar a jugar`.
- Contraste visible y controles utilizables con teclado.

### Pantalla de partida

- Tablero grande en el centro.
- Cuatro tarjetas alrededor del tablero, adaptadas a escritorio y apiladas de forma legible en movil.
- La tarjeta activa tendra borde, brillo y texto de turno.
- El centro del tablero sera el control del dado durante el turno.
- Un mensaje de estado explicara siempre la siguiente accion: tirar, elegir ficha o esperar.

### Dado y movimiento

Al pulsar el centro se abre un dialogo visual con un D6 animado. La animacion no decide el resultado: el resultado se genera en JavaScript y luego se muestra. Despues de tirar, las fichas validas tendran un glow y solo ellas responderan a la seleccion. La ficha avanzara automaticamente con una animacion corta por casilla.

Al obtener 6 se mostrara una celebracion breve con destellos de color, texto grande y una indicacion de turno extra. La animacion no bloqueara el control mas tiempo del necesario.

## 7. Accesibilidad y responsive

- HTML semantico y dialogos con foco controlado.
- Estados comunicados con texto y color, nunca solo con color.
- Soporte de teclado para iniciar, tirar y elegir ficha.
- `prefers-reduced-motion` para reducir animaciones.
- Tablero con tamano limitado por el viewport y tarjetas sin solaparse.
- Pruebas en movil vertical, movil horizontal y escritorio.

## 8. Calidad y pruebas

Las reglas se probaran separadas de la interfaz. Casos minimos:

- El dado solo devuelve valores de 1 a 6.
- Una ficha no sale con 1-5.
- Una ficha sale con 6.
- Se eligen correctamente las fichas validas.
- El movimiento recorre exactamente N casillas.
- No se permite superar la llegada.
- Una captura devuelve la ficha rival a casa.
- Las columnas finales no permiten capturas.
- Un 6 conserva el turno y un resultado distinto lo cambia.
- Cuatro fichas terminadas producen un ganador.
- El tablero se visualiza sin solapamientos en los breakpoints definidos.

## 9. Criterios de aceptacion de v1

Una persona puede abrir el sitio, entender las reglas, iniciar una partida, tirar el dado, sacar fichas, moverlas, capturar, llegar al centro y ganar sin editar datos ni recargar la pagina. La experiencia debe ser usable con raton y teclado, y verse correctamente en escritorio y movil.

## 10. Fuentes y decisiones

La investigacion inicial tomo como referencia la descripcion general y las reglas publicadas en [Wikipedia: Ludo](https://en.wikipedia.org/wiki/Ludo), consultada el 5 de septiembre de 2026. Esa fuente tambien advierte que existen variantes regionales; por eso este documento fija las decisiones de v1 y no presenta todas las variantes como obligatorias.

La expresion "desplazamiento automatico" se interpreta como animacion automatica de la ficha despues de que el jugador elige que ficha mover. La tirada y la eleccion siguen siendo acciones del jugador.

## 11. Implementacion vigente al cerrar el Sprint 4

El codigo sigue siendo HTML/CSS y JavaScript nativos. Se mantienen los refinamientos de PandaSoft y del dado aprobados antes de este sprint.

- `js/game/board.mjs`: coordenadas de la cruz, recorrido comun y ruta por color.
- `js/game/state.mjs`: jugadores y fabrica de estado; cada partida obtiene cuatro fichas independientes por participante.
- `js/game/rules.mjs`: funciones puras para pasos legales, seleccion y siguiente jugador.
- `js/app.js`: renderizado, dado, foco, seleccion y secuencia de movimiento.
- `js/branding.js`: intro independiente de la partida.
- `tests/movement.test.mjs` y `tests/sprint4.browser.cjs`: reglas y regresion de interfaz.

Cada ficha guarda `progress`: -1 significa casa; 0 es su salida; 1-50 son los pasos restantes del recorrido comun; 51-56 pertenecen al carril propio; 57 es el centro. Cada ruta individual utiliza 51 de las 52 casillas comunes antes de desviarse a su carril. El 6 saca una ficha a la salida (un paso visual), o mueve seis casillas una ficha activa.

Las fases implementadas son `waiting-roll -> rolling -> roll-result -> choosing-token -> moving -> waiting-roll`. Si no hay seleccion legal, se omiten eleccion y movimiento: el resultado permanece 8000 ms (actualizado en Sprint 6) y luego se resuelve el turno, o puede continuarse con el boton. El resultado se decide antes de animar el dado. El turno extra por 6 se aplica al resolver la accion, nunca antes.

Durante el movimiento se bloquean dado, fichas e Inicio. La seleccion se valida contra las reglas incluso si se dispara un evento manualmente. Volver al inicio durante una eleccion conserva el estado en memoria. La recarga inicia una partida nueva; no hay persistencia.

Al cerrar el Sprint 4 quedo preparado el limite exacto al centro. Las capturas y la victoria se completaron en el Sprint 5, descrito a continuacion.

## 12. Resolucion y cierre de partida: Sprint 5

La funcion pura `resolveMove(state, tokenId)` valida la fase y seleccion y devuelve los pasos visuales, las fichas capturadas, la llegada y el nuevo estado. Nunca modifica el estado recibido. Las capturas comparan coordenadas fisicas del recorrido, no indices relativos de colores diferentes. Solo se evalua la casilla final, y solo cuando ambas fichas estan en el recorrido comun (progreso 0-50).

La vista calcula la resolucion antes de animar. Al completar los pasos aplica el estado resuelto y actualiza contadores y mensajes. Una captura devuelve la rival a progreso -1. Una llegada exacta establece progreso 57, retira la ficha del tablero y muestra una marca de completado en la tarjeta.

El estado incorpora `winnerId`. Con cuatro fichas terminadas del mismo jugador se pasa a `won`, se bloquean nuevas tiradas y selecciones y se abre un dialogo modal con el resultado. Una victoria tiene prioridad sobre el turno extra del 6. Los resultados quedan disponibles al volver desde Inicio mientras la pagina permanezca abierta.

Jugar otra vez restaura `createGameState()`, cancela el temporizador pendiente de pase, limpia el resultado del dado, devuelve todas las fichas a casa y enfoca el dado de Sol. No se recarga la pagina ni se pierde la identidad visual.

Las pruebas del Sprint 5 cubren una partida completa con resultados controlados exclusivamente por el navegador de prueba; el producto no expone un modo de trucos ni un acceso global al estado. Ver `tests/resolution.test.mjs` y `tests/sprint5.browser.cjs`.

## 13. Feedback y accesibilidad: Sprint 6

La presentacion mantiene las reglas puras del Sprint 5. El 6 muestra una insignia textual y una animacion breve. Los eventos de captura y llegada usan data-feedback en el estado visible y clases en las fichas de las tarjetas, limpiadas al iniciar otra tirada o reiniciar.

El mensaje accesible del dado incluye su resultado numerico y la accion siguiente. El dialogo referencia ese mensaje mediante aria-describedby. El pase sin jugadas espera 8 segundos, permite Continuar y conserva la explicacion en el tablero. Los efectos repetidos terminan antes de 5 segundos; la preferencia de movimiento reducido elimina animaciones y transiciones. La prueba tests/sprint6.browser.cjs verifica estas interacciones durante una partida completa.

## 14. Entrega v1: Sprint 7

package.json define npm start, npm test y npm run test:browser. El servidor local no agrega dependencias y sirve solo los recursos del juego. La prueba final agrega portada sin fuentes externas, movil horizontal, tablet, doble evento, recarga y logo demorado a la partida completa del Sprint 6. El boton de portada distingue una partida en curso y la intro libera la interfaz como maximo a los 5 segundos.

README.md contiene los requisitos de ejecucion y la guia de entrega estatica. Los ajustes CSS finales compactan las reglas en notebooks bajos y el dialogo del dado en horizontal.

## 15. Seleccion de participantes

createGameState(playerCount = 4) valida cantidades 2, 3 y 4. El estado guarda players con los participantes y tokens con sus fichas. currentPlayerIndex apunta a esa lista, y nextPlayerIndex recibe su longitud tanto al mover como al pasar sin jugadas. Los resultados de victoria y las tarjetas incluyen solo participantes. El tablero conserva su geometria y sus cuatro carriles.

Los radios de Inicio mantienen una eleccion pendiente. Cambiar la cantidad no modifica la partida hasta pulsar Empezar nueva partida. Elegir otra vez la cantidad actual permite continuarla. Reiniciar desde victoria conserva los participantes. Las pruebas players.test.mjs y players.browser.cjs cubren esta ampliacion.

### Distribucion de colores corregida

Azul (Rio) ocupa la esquina superior izquierda, amarillo (Mia) la superior derecha, rojo (Luna) la inferior derecha y verde (Sol) la inferior izquierda. Azul y rojo quedan enfrentados. Con dos jugadores participan azul y rojo; se incorpora amarillo para tres y verde para cuatro. Las rutas, carriles, tarjetas y turnos comparten ese orden horario; los nombres permanecen asociados a su color original.

## 16. Nombres editables y guardados

El selector js/name-picker.js crea un combobox por participante, en orden de incorporacion azul, rojo, amarillo y verde. Ofrece Eri, Melina, Diego y Gustavo; los nombres escritos se filtran sin distinguir mayusculas ni tildes. La lista flotante muestra hasta seis filas de 44 px y scroll; puede abrirse hacia arriba si falta espacio. Tiene etiquetas, listbox, opcion activa y controles de teclado.

js/game/names.mjs normaliza los nombres, evita duplicados y maneja la clave localStorage ludo-matic.names.v1. Los datos invalidos no bloquean el juego. Si no se puede guardar se mantiene la lista en memoria y se informa al usuario. Los nombres se guardan al elegir una opcion nueva, pulsar Enter o iniciar una partida; no se guardan fragmentos por cada letra.

createGameState(playerCount, names) recibe nombres por color. Toda la interfaz consulta los nombres del estado de partida, incluidas las capturas y la victoria. Cambiar nombres en Inicio actualiza los participantes al continuar y conserva las fichas; cambiar cantidad reinicia la partida. La revancha mantiene los nombres. La lista guardada persiste al recargar; las asignaciones por color y el avance de la partida siguen en memoria.

Pruebas: names.test.mjs (normalizacion, persistencia y nombres del estado) y names.browser.cjs (lista, scroll, teclado, recarga, partidas completas y guardado bloqueado).
