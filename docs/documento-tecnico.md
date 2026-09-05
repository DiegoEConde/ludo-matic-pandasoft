# Ludo Matic - Documento tecnico

**Version:** 0.1
**Estado:** Propuesta inicial para revision
**Plataforma objetivo:** Navegador web de escritorio y movil
**Idioma inicial:** Espanol

## 1. Objetivo

Crear una version web de Ludo Matic, visual, accesible y sencilla para ninos. La partida se juega en un tablero de cuatro colores y el desplazamiento de las fichas es automatico: la persona decide que ficha mover y la interfaz reproduce el recorrido.

El primer alcance sera una partida local de 4 jugadores en el mismo dispositivo. La arquitectura debe permitir agregar nombres configurables, bots y juego en red mas adelante sin rehacer las reglas.

## 2. Alcance de la primera version

### Incluido

- Pantalla principal con logo centrado, explicacion breve de reglas y boton de inicio.
- Tablero de Ludo con cuatro zonas: verde, rojo, azul y amarillo.
- Cuatro jugadores, cada uno con cuatro fichas.
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

1. Participan cuatro jugadores: verde, rojo, azul y amarillo.
2. Cada jugador empieza con cuatro fichas fuera del recorrido, en su zona de casa.
3. El orden inicial es verde, rojo, azul y amarillo, y los turnos avanzan en sentido horario.
4. En su turno, la persona pulsa el cubiculo central del dado.
5. El dado produce un numero entero aleatorio entre 1 y 6, ambos incluidos.
6. Una ficha en casa solo puede entrar en su casilla de salida al obtener un 6.
7. Al obtener un 6, si quedan fichas en casa, la persona puede sacar una ficha o mover una ficha ya activa seis casillas.
8. Si no hay movimientos validos, el turno termina automaticamente y pasa al siguiente jugador, salvo que corresponda el turno extra por 6.
9. Una ficha activa avanza exactamente el numero obtenido por el recorrido comun.
10. Al entrar en la columna final de su color, la ficha no puede ser capturada.
11. Para llegar al centro se necesita el numero exacto de casillas restantes. No se permite pasarse.
12. Si una ficha cae sobre una ficha rival en una casilla capturable, la rival vuelve a su casa.
13. Las fichas del mismo jugador pueden compartir casilla; no se implementan bloqueos especiales en v1.
14. Las fichas en casa y las fichas que ya llegaron al centro no son seleccionables para mover.
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

`setup -> waiting-roll -> rolling -> choosing-token -> moving -> resolving -> waiting-roll`.

Tambien existirán los estados terminales `won` y `paused` si luego se agrega pausa.

## 5. Arquitectura propuesta

Se usara una aplicacion web estatica con:

- **HTML semantico:** estructura de pantallas, tablero, tarjetas, dialogos y mensajes.
- **CSS moderno:** variables de color, Grid/Flexbox, responsive design, transiciones y animaciones.
- **JavaScript modular:** estado del juego, reglas puras, generador de dado, controlador de turnos, renderizado y animaciones.
- **Sin backend en v1:** toda la partida vive en memoria del navegador.

La estructura prevista es:

```text
/
  index.html
  css/
    styles.css
  js/
    app.js
    game/
      constants.js
      state.js
      rules.js
      board.js
    ui/
      screens.js
      boardView.js
      diceModal.js
      playerCard.js
  docs/
    documento-tecnico.md
    roadmap.md
```

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
