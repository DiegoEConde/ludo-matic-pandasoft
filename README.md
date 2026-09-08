# Ludo Matic v1

Juego local para 2 a 4 personas en el mismo dispositivo. HTML, CSS y JavaScript nativos; sin compilacion ni dependencias para jugar.

## Ejecutar

Requiere Node.js 20 o superior y un navegador moderno. Desde la carpeta del proyecto:

~~~powershell
npm start
~~~

Abrir http://127.0.0.1:4173. Detener con Ctrl+C. No hace falta ejecutar npm install. Tambien se puede usar el servidor HTTP del IDE; abrir index.html con file:// no es compatible con los modulos del juego.

Si el puerto esta ocupado:

~~~powershell
$env:PORT = '4174'
npm start
~~~

El servidor incluido escucha solo en este equipo. Para alojar la version estatica se necesitan index.html, css/, js/ y PandaSoftLogo.png, manteniendo las rutas y el tipo MIME JavaScript para .mjs. No hay paso de build. Esta entrega no publica el sitio.

## Jugar

Antes de empezar, elegir 2, 3 o 4 jugadores. Con 2 participan azul y rojo, en posiciones enfrentadas; con 3 se suma amarillo; con 4, verde. Empieza azul y los turnos siguen en sentido horario entre los participantes. Cada participante conserva cuatro fichas.

- Sacar una ficha requiere un 6; el 6 tambien concede otro turno.
- Elegir una ficha disponible en su tarjeta o en el tablero. Tab y Enter permiten jugar con teclado.
- Terminar sobre una rival en el recorrido comun la devuelve a casa, incluidas las salidas. Pasar por encima no captura.
- No se puede terminar sobre una ficha propia. El carril final es seguro y la llegada al centro debe ser exacta.
- Gana quien lleve sus cuatro fichas al centro. Jugar otra vez inicia una partida nueva.
- Inicio permite volver a la portada; Continuar partida conserva la partida actual. Elegir otra cantidad muestra Empezar nueva partida y avisa que se reinicia la anterior al pulsarlo. Jugar otra vez conserva la cantidad elegida. Recargar la pagina borra la partida.

La suite tambien completa partidas de 2 y 3 jugadores y verifica el reinicio y el cambio de cantidad. Sus capturas quedan en $env:TEMP/ludo-players.

Cada color tiene un selector de nombre. La lista inicial contiene Eri, Melina, Diego y Gustavo; escribir filtra las coincidencias sin distinguir mayusculas ni tildes. La flecha abre todos los nombres guardados. Se muestran hasta seis opciones y el resto se recorre con scroll, flechas de teclado o tacto.

Para agregar un nombre, escribirlo y pulsar Enter, elegir Guardar y usar o iniciar la partida. Se admiten hasta 32 caracteres y se evitan duplicados en la lista. Los nombres nuevos quedan en este navegador, para la misma direccion y puerto, incluso al recargar. No se sincronizan entre equipos y se borran al limpiar los datos del sitio. Si el navegador bloquea el guardado, se avisa y se permite jugar igualmente.

Los nombres elegidos aparecen en tarjetas, turnos, capturas y resultados. Volver a Inicio permite modificarlos y continuar sin perder posiciones; la revancha conserva los nombres. No hay bots, juego online ni guardado de la partida. Las fuentes de Google son opcionales: si no cargan se usan fuentes del sistema.

## Pruebas

~~~powershell
npm test
~~~

Ejecuta las 32 pruebas de reglas y nombres sin instalar paquetes. Para la validacion de interfaz se usa Playwright y Microsoft Edge instalado. En PowerShell:

~~~powershell
npm install --prefix "$env:TEMP/pandasoft-validation" playwright --no-audit --no-fund
$env:PLAYWRIGHT_MODULE = "$env:TEMP/pandasoft-validation/node_modules/playwright"
npm run test:browser
~~~

La instalacion de Playwright requiere conexion; el juego no depende de ese paquete. La suite inicia y cierra sus servidores y navegadores. Guarda capturas en $env:TEMP/ludo-sprint7. Recorre inicio, dado, seleccion, capturas, llegada, victoria y reinicio en seis tamanos; incluye horizontal, tablet y movimiento reducido. Los numeros del dado se controlan solo dentro de las pruebas.

La suite de nombres verifica guardado tras recargar, autocompletado, teclado, scroll, nombres personalizados hasta victoria y almacenamiento bloqueado. Sus capturas quedan en $env:TEMP/ludo-names. Puede ejecutarse por separado con node tests/names.browser.cjs.

Para ejecutar tambien la regresion historica de movimiento casilla a casilla:

~~~powershell
node tests/sprint4.browser.cjs
~~~

Ver [entrega del Sprint 7](docs/sprint-7.md), [reglas y arquitectura](docs/documento-tecnico.md) y [roadmap](docs/roadmap.md).
