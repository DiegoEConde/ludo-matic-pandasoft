# Ludo Matic - Roadmap de sprints

**Version:** 1.0
**Cadencia:** sprints cortos, revisables uno por uno
**Regla de avance:** al terminar cada sprint se entrega un resumen y una guia de prueba. El siguiente sprint comienza solo despues de la aprobacion del usuario.

## Flujo de cada sprint

1. Implementar un objetivo pequeño y comprobable.
2. Ejecutar la validacion tecnica y la prueba manual indicada.
3. Informar que se hizo, como probarlo y que queda pendiente.
4. Esperar aprobacion antes de iniciar el siguiente sprint.

## Sprint 0 - Documentacion y decisiones

**Estado:** Documentacion entregada; decisiones reflejadas en v1

### Objetivo del Sprint 0

Fijar el alcance, las reglas de Ludo Matic v1, la arquitectura inicial y los criterios de aceptacion.

### Entregables

- Documento tecnico.
- Roadmap de sprints.
- Registro de decisiones sobre variantes del juego.

### Validacion

Leer ambos documentos y confirmar que la variante de reglas y el alcance son correctos.

## Sprint 1 - Base visual y pantalla principal

**Estado:** Completado y aprobado

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

### Entrega del Sprint 1

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

**Estado:** Completado y aprobado

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

**Siguiente paso:** Sprint 3 completado y aprobado; ver Sprint 4.

## Sprint 3 - Motor de estado y dado

**Estado:** Completado y aprobado

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

### Entrega y refinamientos aprobados

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
- Tipografia movil estabilizada sin cursiva accidental y marca PandaSoft reducida para no cubrir tarjetas.
- Logo PandaSoft inferior con efecto glass y translucidez para reducir su peso visual.
- Dado central sincronizado con la cara y el resultado de la ultima tirada.
- Dado central reducido a un circulo fijo con seis puntos y glow pulsante para indicar donde tocar.
- Dado central reducido nuevamente a 44 px en movil para liberar el recorrido.
- Carriles de color extendidos hasta el centro y esquinas internas neutralizadas para una lectura mas limpia.

### Refinamiento final del Sprint 3

- Intro PandaSoft: entrada de 700 ms, salida a los 2 segundos y desvanecido de 600 ms; sin animaciones con movimiento reducido.
- Marca fija de 82/54 px al 32%, con espacio reservado y margenes de safe area.
- Inicio de escritorio en dos columnas y tablero ajustado a la altura, sin desplazamiento en los tamanos probados.
- El dado 3D provisional fue reemplazado por caras CSS Grid 3x3, puntos centrados y una tirada suave de 900 ms.
- Las notas anteriores describen iteraciones; este refinamiento refleja la version vigente.

## Sprint 4 - Salida y movimiento automatico

**Estado:** Completado y aprobado

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

### Entrega del Sprint 4

- Dieciseis fichas con identidad y posicion logica independientes de los pixeles.
- Recorrido comun de 52 casillas; salida y carril propios para cada color.
- Salida con 6, eleccion entre sacar otra ficha o avanzar una activa y movimiento secuencial de 180 ms por casilla.
- Seleccion mediante fichas resaltadas del tablero o botones numerados de al menos 44 px en las tarjetas.
- Destino ocupado por ficha propia no seleccionable, incluida la salida; pasar por encima sigue permitido.
- Contadores de casa y juego actualizados, mensajes de accion y foco de teclado.
- Dado y navegacion bloqueados durante movimiento; proteccion contra selecciones invalidas y dobles clics.
- Turno extra solo despues de resolver el movimiento; pase automatico si no hay jugadas legales.
- Escape no cancela una tirada ni deja la partida bloqueada; volver al inicio conserva una eleccion pendiente.
- Movimiento reducido sin saltos animados; se conserva el mismo resultado logico.
- Limite exacto del recorrido y estado de ficha al centro preparados para el Sprint 5. Todavia no hay capturas ni ganador.

### Validacion del Sprint 4

- 13 pruebas de reglas aprobadas: salida, recorrido, avance exacto, seleccion, limites y turnos.
- Prueba de navegador aprobada en Edge: 1366x768, 1024x600, 390x844 y 320x640; ultimo caso con movimiento reducido.
- Sin desplazamiento de escritorio ni desbordes horizontales en los tamanos probados.
- Pruebas de teclado, tacto, seleccion desde tablero, salida y destino propio ocupados, reentrada, Escape, doble clic y avance de seis pasos.
- Guia reproducible: [Sprint 4 - pruebas y entrega](sprint-4.md).

**Siguiente paso:** Sprint 5 implementado; ver entrega siguiente.

## Sprint 5 - Capturas, llegada y victoria

**Estado:** Completado y aprobado

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

### Entrega del Sprint 5

- Captura al terminar sobre una ficha rival del recorrido comun, incluidas las salidas.
- La ficha capturada vuelve a casa y necesita otro 6 para salir.
- Pasar por encima de una rival no la captura; las columnas finales y fichas terminadas estan protegidas.
- Se conserva la prohibicion de terminar sobre una ficha propia, incluida la salida.
- Llegada exacta: no se permiten movimientos que excedan el centro.
- Contador visible de fichas terminadas para cada jugador, desde 0/4 hasta 4/4.
- Estado terminal de victoria cuando llegan las cuatro fichas; no se concede otro turno despues de ganar.
- Dialogo con ganador, resumen de fichas terminadas, Jugar otra vez y Volver al inicio.
- Reinicio limpio de las dieciseis fichas, turno, resultado y ganador; volver al inicio permite consultar el resultado.
- Reglas puras de resolucion separadas de la animacion y mensajes de captura y llegada.
- Ajuste de tarjetas en notebooks de poca altura para conservar la pantalla sin desplazamiento.

### Validacion del Sprint 5

- 23 pruebas de reglas: movimiento, ocupacion, captura, proteccion de carriles, llegada, victoria y estado inicial.
- Regresion del Sprint 4 y partida completa del Sprint 5 en Edge: 1366x768, 1024x600, 390x844 y 320x640 (movimiento reducido en el ultimo caso).
- La partida automatica genera capturas en las cuatro salidas y lleva las cuatro fichas de Sol al centro mediante acciones reales de la interfaz.
- Victoria, bloqueo de jugadas posteriores, foco de teclado, regreso al inicio, reapertura del resultado y nueva partida comprobados.
- Guia reproducible: [Sprint 5 - pruebas y entrega](sprint-5.md).

**Siguiente paso:** Sprint 6, autorizado por el usuario.

## Sprint 6 - Celebracion, feedback y accesibilidad

**Estado:** Completado y aprobado

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

### Entrega del Sprint 6

- Insignia de turno extra y celebracion breve al obtener 6.
- Capturas y llegadas resaltadas en el mensaje y en las fichas de las tarjetas hasta la siguiente tirada.
- Ayuda cuando no hay movimientos; pase automatico a los 8 segundos o inmediato con Continuar. La explicacion permanece en el tablero.
- Resultado numerico incluido en el anuncio accesible del dado, con descripcion del dialogo y region atomica.
- Foco visible reforzado, animaciones de duracion limitada y movimiento reducido sin animaciones ni transiciones.
- Reglas iniciales aclaradas: captura rival, carril seguro y llegada exacta.
- Guia de prueba: [Sprint 6](sprint-6.md).

## Sprint 7 - Pruebas, pulido y entrega v1

**Estado:** Implementado y validado automaticamente; pendiente de aceptacion manual de v1

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

### Entrega del Sprint 7

- Comandos npm start, npm test y npm run test:browser y README de ejecucion.
- Pantalla inicial ajustada para notebooks bajos con fuentes del sistema.
- Dado compacto en horizontal con la accion visible.
- Continuar partida al volver a Inicio y limite de espera para el logo de presentacion.
- Suite final con seis tamanos, recursos locales, doble clic, recarga y partida completa.
- Guia de entrega y revision manual: [Sprint 7](sprint-7.md).

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

## Ampliacion posterior: 2 a 4 jugadores

Implementada por solicitud del usuario. Selector inicial, participantes enfrentados para dos personas, turnos y resultados limitados a quienes juegan. Cambiar la cantidad inicia una partida nueva al pulsar el boton correspondiente; la revancha conserva la cantidad. Pruebas de reglas y partidas completas de 2 y 3 jugadores agregadas a las suites de npm.

Correccion de colores solicitada: azul y rojo enfrentados para dos jugadores, amarillo como tercero y verde como cuarto. La distribucion horaria es azul, amarillo, rojo y verde, empezando por azul.

## Ampliacion posterior: nombres con autocompletado

Implementada: selector por participante, base Eri/Melina/Diego/Gustavo, nombres nuevos guardados en el navegador, coincidencias al escribir y lista con hasta seis filas mas scroll. Los nombres elegidos se usan durante toda la partida y en la revancha. Pruebas automatizadas de persistencia, teclado y victoria con nombres personalizados incorporadas a npm test y npm run test:browser.
