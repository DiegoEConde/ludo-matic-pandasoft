# Ludo Matic - Roadmap de sprints

**Version:** 0.1
**Cadencia:** sprints cortos, revisables uno por uno
**Regla de avance:** al terminar cada sprint se entrega un resumen y una guia de prueba. El siguiente sprint comienza solo despues de la aprobacion del usuario.

## Flujo de cada sprint

1. Implementar un objetivo pequeño y comprobable.
2. Ejecutar la validacion tecnica y la prueba manual indicada.
3. Informar que se hizo, como probarlo y que queda pendiente.
4. Esperar aprobacion antes de iniciar el siguiente sprint.

## Sprint 0 - Documentacion y decisiones

**Estado:** Propuesto

### Objetivo del Sprint 0

Fijar el alcance, las reglas de Ludo Matic v1, la arquitectura inicial y los criterios de aceptacion.

### Entregables

- Documento tecnico.
- Roadmap de sprints.
- Registro de decisiones sobre variantes del juego.

### Validacion

Leer ambos documentos y confirmar que la variante de reglas y el alcance son correctos.

## Sprint 1 - Base visual y pantalla principal

**Estado:** Completado, pendiente de aprobacion

### Objetivo del Sprint 1

Crear la primera experiencia navegable sin logica de partida.

### Funcionalidades

- Estructura HTML inicial.
- Identidad visual y logo tipografico temporal.
- Pantalla principal responsive.
- Tarjeta de reglas para ninos.
- Boton para entrar al tablero.
- Navegacion entre inicio y partida vacia.

### Criterio de terminado

La pantalla se entiende sin explicacion adicional y se ve correctamente en movil y escritorio.

### Entrega del Sprint 2

- Pantalla principal con logo tipografico y marca visual propia.
- Refinamiento de identidad: motivo de cuatro colores, textura de tablero y variables cromaticas reutilizables.
- Tipografia de marca Baloo 2, redondeada y con sombra de juguete; textos de interfaz en Comic Sans.
- Logo renovado como ficha-tablero amarilla, con cuatro fichas, centro LM y silueta propia.
- Separacion vertical reforzada entre el logo y el nombre para mejorar la lectura de marca.
- Eliminada la leyenda superior para dar mas presencia al nombre del programa.
- Intro de PandaSoft con pantalla negra, entrada suave del logo y transicion de salida de 2 segundos.
- Marca PandaSoft fija en la esquina inferior derecha, visible en inicio y mesa, con ajuste responsive.
- Tarjeta de reglas breves para ninos.
- Boton de inicio con feedback visual y acceso por teclado.
- Pantalla de mesa de transicion para preparar el tablero del Sprint 2.
- Navegacion de ida y vuelta entre inicio y mesa.

## Sprint 2 - Tablero y jugadores

**Estado:** Completado, pendiente de aprobacion

### Objetivo del Sprint 2

Representar el tablero completo y las cuatro zonas de jugador.

### Funcionalidades del Sprint 2

- Tablero de recorrido comun, columnas finales y centro.
- Colores verde, rojo, azul y amarillo.
- Cuatro tarjetas en los extremos.
- Nombres desde una lista temporal configurable.
- Cuatro fichas por jugador en casa.
- Indicador visual del jugador activo.

### Criterio de terminado del Sprint 2

El tablero es legible, estable y no se solapa en los breakpoints definidos.

### Entrega

- Tablero visual de Ludo en cuadrícula 15x15.
- Cuatro zonas de casa en verde, rojo, azul y amarillo.
- Recorrido comun, carriles finales y centro del tablero.
- Dado central preparado para la logica del Sprint 3.
- Tarjetas de Sol, Luna, Rio y Mia como nombres temporales.
- Cuatro fichas visibles en casa para cada jugador.
- Indicador visual del jugador activo.
- Distribucion responsive validada en escritorio y movil.
- Encabezado de partida refinado con logo de Ludo Matic, leyenda `A jugar` y turno visible.
- Tablero visual adaptado a la silueta de cruz del Ludo, con espacio exterior para las fichas de cada jugador.
- Tablero sin sombreado, con borde negro notorio.
- Tarjetas de jugador ampliadas para lectura infantil, con nombres y fichas de mayor escala.
- Contorno negro continuo alrededor de toda la cruz del tablero.
- Tarjeta activa con efecto glow pulsante.
- Indicador de turno aumentado y reforzado en negrita.

**Siguiente paso:** Sprint 3 bloqueado hasta aprobar Sprint 2

## Sprint 3 - Motor de estado y dado

**Estado:** En progreso, pendiente de aprobacion

### Objetivo del Sprint 3

Implementar el ciclo de turno y la tirada D6 sin mover fichas aun.

### Funcionalidades del Sprint 3

- Estado inicial de la partida.
- Orden de turnos.
- Control central del dado.
- Modal con animacion D6.
- Resultado aleatorio 1-6.
- Mensaje de estado y bloqueo durante la tirada.
- Turno extra conceptual al obtener 6.

### Criterio de terminado del Sprint 3

Cada tirada cambia el estado de forma valida y nunca produce valores fuera de rango.

### Entrega parcial

- Estado inicial con orden de Sol, Luna, Rio y Mia.
- Dado central conectado a un modal con animacion.
- Resultado aleatorio entre 1 y 6.
- Bloqueo del dado mientras gira.
- Mensaje de turno extra al obtener 6.
- Cambio visual del jugador activo despues de resolver la tirada.
- Boton `Inicio` ampliado y adaptado a la interfaz infantil.
- Dado modal corregido con caras visuales reales del 1 al 6, sincronizadas con el resultado.
- Dado rediseñado como cubo 3D con seis caras, perspectiva y rotación de referencia realista.
- Cara final aislada y renderizada al frente para mostrar exactamente los puntos del resultado, sin mezclar caras.

## Sprint 4 - Salida y movimiento automatico

### Objetivo del Sprint 4

Permitir sacar y mover fichas con la animacion solicitada.

### Funcionalidades del Sprint 4

- Salida de una ficha con 6.
- Calculo de fichas validas.
- Glow sobre fichas seleccionables.
- Seleccion de ficha.
- Movimiento automatico casilla a casilla.
- Actualizacion de fichas en casa y en tablero.
- Cambio de turno despues de resolver.

### Criterio de terminado del Sprint 4

Una ficha recorre exactamente el numero del dado y la interfaz no permite seleccionar una ficha invalida.

## Sprint 5 - Capturas, llegada y victoria

### Objetivo del Sprint 5

Completar el nucleo de las reglas.

### Funcionalidades del Sprint 5

- Captura de ficha rival.
- Retorno de la ficha capturada a casa.
- Columnas finales seguras.
- Llegada exacta al centro.
- Contador de fichas terminadas.
- Deteccion de ganador.
- Pantalla o modal de victoria y reinicio.

### Criterio de terminado del Sprint 5

Una partida puede llegar a una victoria valida y las reglas de captura y llegada se respetan.

## Sprint 6 - Celebracion, feedback y accesibilidad

### Objetivo del Sprint 6

Convertir el prototipo funcional en una experiencia clara para ninos.

### Funcionalidades del Sprint 6

- Celebracion al obtener 6.
- Aviso de turno extra.
- Mensajes de ayuda y estados vacios.
- Foco de teclado y navegacion accesible.
- Reduccion de movimiento.
- Feedback visual para captura y llegada.

### Criterio de terminado del Sprint 6

La accion siguiente siempre es evidente y la interfaz sigue siendo usable sin depender solo de animaciones o color.

## Sprint 7 - Pruebas, pulido y entrega v1

### Objetivo del Sprint 7

Estabilizar el juego y preparar una entrega reproducible.

### Funcionalidades del Sprint 7

- Pruebas de reglas y regresion.
- Ajuste responsive final.
- Pruebas manuales de una partida completa.
- Revision de estados imposibles y doble clic.
- Documentacion de ejecucion y prueba.
- Limpieza de textos y detalles visuales.

### Criterio de terminado del Sprint 7

La partida completa funciona desde inicio hasta victoria en los dispositivos objetivo sin errores bloqueantes.

## Riesgos y decisiones abiertas

- **Reglas regionales:** v1 usara las reglas fijadas en el documento tecnico; cualquier variante nueva se tratara como decision explicita.
- **Nombres:** se usara una lista provisional hasta recibir los nombres definitivos.
- **Assets del logo:** inicialmente se usara una solucion propia en HTML/CSS para no bloquear el desarrollo; el logo final puede reemplazarse despues.
- **Aleatoriedad:** la interfaz mostrara una animacion, pero el numero lo decidira el motor para que las reglas sean testeables.
- **Framework:** se mantiene JavaScript nativo hasta que exista una necesidad concreta de dependencia.

## Resumen de entregas

Al cerrar cada sprint se entregara:

- funcionalidades terminadas;
- archivos modificados;
- decisiones tomadas;
- validaciones ejecutadas;
- instrucciones exactas para probar;
- pendientes y riesgos del siguiente sprint.
