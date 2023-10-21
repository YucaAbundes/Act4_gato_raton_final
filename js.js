function app() {
  // Obtener el lienzo y el contexto del canvas
  const canvas = document.getElementById("lienzo");
  const ctx = canvas.getContext("2d");
 // Para mostrar las coordenadas del mouse
  const coordenadasElement = document.getElementById("coordenadas");
  
  
  // Objeto del estado del juego
  const gato = {
    // Estado del tablero
    estados: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
 // Jugador actual (1(gato) o -1(ratón))
    turnoJugador: 1,

    colores: ["img2", "img1"],    // Nombres de las imágenes para cada jugador


// Método para dibujar la rejilla del tablero
    pintarRejilla: function () {
      ctx.strokeStyle = "transparent";
      ctx.lineWidth = 1;

      const gridSize = 100;

      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }

      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }

      ctx.stroke();
    },

// Método para dibujar el escenario del juego
    escenario: function () {
      ctx.lineWidth = 15;
      ctx.strokeStyle = "black";

      ctx.beginPath();
      ctx.moveTo(100, 200);
      ctx.lineTo(400, 200);
      ctx.moveTo(100, 300);
      ctx.lineTo(400, 300);
      ctx.moveTo(100, 400);

      ctx.moveTo(200, 100);
      ctx.lineTo(200, 400);
      ctx.moveTo(300, 100);
      ctx.lineTo(300, 400);

      ctx.stroke();
    },

// Método para cambiar el jugador actual
    cambiarJugador: function () {
      this.turnoJugador *= -1;
      document.getElementById("turno").textContent = `Turno: Jugador ${
        this.turnoJugador > 0 ? 1 : 2
      }`;
      this.mostrarIconoTurno();
    },

 // Método para las fichas
    dibujar: function () {
      for (let i = 0; i < this.estados.length; i++) {
        for (let j = 0; j < this.estados[i].length; j++) {
          const jugador = this.estados[i][j];
          if (jugador !== 0) {
            const img = new Image();
            img.src = jugador > 0 ? 'img/gato.svg' : 'img/raton.svg';
            ctx.drawImage(img, j * 100 + 110, i * 100 + 110, 80, 80);
          }
        }
      }
    
      // Dibujar la línea ganadora al final
      this.dibujarLineaGanadora();
    },

// Método para resaltar la casilla en la que el mouse está pasando
    pintarHover: function (e) {
      const x = e.offsetX;
      const y = e.offsetY;
      coordenadasElement.textContent = `Coordenadas: (${x}, ${y})`;

      const coordenadasCuadros = [
        { x: 100, y: 100 },
        { x: 200, y: 100 },
        { x: 300, y: 100 },
        { x: 100, y: 200 },
        { x: 200, y: 200 },
        { x: 300, y: 200 },
        { x: 100, y: 300 },
        { x: 200, y: 300 },
        { x: 300, y: 300 },
      ];

      for (let i = 0; i < coordenadasCuadros.length; i++) {
        const cuadro = coordenadasCuadros[i];
        const row = Math.floor(i / 3);
        const col = i % 3;

        if (
          x >= cuadro.x &&
          x <= cuadro.x + 90 &&
          y >= cuadro.y &&
          y <= cuadro.y + 90 &&
          this.estados[row][col] === 0
        ) {
          this.limpiarPintura();
          this.pintarRejilla();
          this.escenario();
          this.dibujar();

          const img = new Image();
          img.src =
            this.colores[this.turnoJugador > 0 ? 1 : 0] === "img1"
              ? "img/gato.svg"
              : "img/raton.svg";
          ctx.drawImage(img, cuadro.x, cuadro.y, 90, 90);
        }
      }
    },

// Método para seleccionar  al hacer click
    seleccionar: function (e) {
      const x = e.offsetX;
      const y = e.offsetY;
      coordenadasElement.textContent = `Coordenadas: (${x}, ${y})`;
    
      const coordenadasCuadros = [
        { x: 100, y: 100 },
        { x: 200, y: 100 },
        { x: 300, y: 100 },
        { x: 100, y: 200 },
        { x: 200, y: 200 },
        { x: 300, y: 200 },
        { x: 100, y: 300 },
        { x: 200, y: 300 },
        { x: 300, y: 300 },
      ];
    
      for (let i = 0; i < coordenadasCuadros.length; i++) {
        const cuadro = coordenadasCuadros[i];
        if (
          x >= cuadro.x &&
          x <= cuadro.x + 90 &&
          y >= cuadro.y &&
          y <= cuadro.y + 90 &&
          this.estados[Math.floor(i / 3)][i % 3] === 0
        ) {
          this.estados[Math.floor(i / 3)][i % 3] = this.turnoJugador;
          this.limpiarPintura();
          this.pintarRejilla();
          this.escenario();
          this.dibujar();
    
          const ganador = this.analizarJugador();
          if (ganador !== 0) {
            const puntosGanadores = this.obtenerPuntosGanadores();
            this.dibujarLineaGanadora(...puntosGanadores);
    
// Mostrar alerta de ganador
            Swal.fire({
              title: `¡Ha ganado el ${ganador} !`,
              confirmButtonText: "Reiniciar",
              allowOutsideClick: false, // Evitar que se cierre al hacer clic fuera

              customClass: {
                popup: 'transparent-alert',

              }

            }).then((result) => {
              if (result.isConfirmed) {

                // Desactivar escuchadores después de ganar
                canvas.removeEventListener("mousedown", this.seleccionar);
                canvas.removeEventListener("mousemove", this.pintarHover);
    
                this.activarEstados();
                this.limpiarPintura();
                this.pintarRejilla();
                this.escenario();
                this.dibujar();
                this.play();
              }
            });
            return;
          }
    
          this.cambiarJugador();
        }
      }
    },
    
// Método para desactivar los escuchadores de eventos del canvas
    desactivarEscuchadores: function () {
      canvas.removeEventListener("mousedown", this.seleccionar);
      canvas.removeEventListener("mousemove", this.pintarHover);
    },
    
// Método para obtener los puntos de la línea ganadora entre el gato y el ratón
    obtenerPuntosGanadores: function () {
      const combinacionesHorizontales = [
        [[0, 0], [0, 1], [0, 2]],
        [[1, 0], [1, 1], [1, 2]],
        [[2, 0], [2, 1], [2, 2]],
      ];

      const combinacionesVerticales = [
        [[0, 0], [1, 0], [2, 0]],
        [[0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 2], [2, 2]],
      ];

      const combinacionesDiagonales = [
        [[0, 0], [1, 1], [2, 2]],
        [[0, 2], [1, 1], [2, 0]],
      ];

      const combinacionesTotales = [
        ...combinacionesHorizontales,
        ...combinacionesVerticales,
        ...combinacionesDiagonales,
      ];

      for (const combinacion of combinacionesTotales) {
        const [i, j] = combinacion[0];
        const jugador = this.estados[i][j];

        if (
          jugador !== 0 &&
          this.estados[combinacion[1][0]][combinacion[1][1]] === jugador &&
          this.estados[combinacion[2][0]][combinacion[2][1]] === jugador
        ) {
          return combinacion.map((coordenadas) => ({
            x: coordenadas[1] * 100 + 150,
            y: coordenadas[0] * 100 + 150,
          }));
        }
      }

      return null;
    },

// Método para dibujar la línea ganadora
    dibujarLineaGanadora: function () {
    const puntosGanadores = this.obtenerPuntosGanadores();

  if (puntosGanadores) {
    ctx.strokeStyle = "red";  // Cambiado a color rojo
    ctx.lineWidth = 15;

    ctx.beginPath();
    ctx.moveTo(puntosGanadores[0].x, puntosGanadores[0].y);

    for (let i = 1; i < puntosGanadores.length; i++) {
      ctx.lineTo(puntosGanadores[i].x, puntosGanadores[i].y);
    }

    ctx.stroke();
  }
    },

// Método para limpiar el canvas
    limpiarPintura: function () {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },

// Método para reiniciar los estados del juego
    activarEstados: function () {
      this.estados = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ];
      this.turnoJugador = 1;
      document.getElementById("turno").textContent = `Turno: Jugador 1`;
    },

// Método para analizar si hay un ganador o empate
    analizarJugador: function () {
      // Combinaciones horizontales para el jugador 1
      if (
        this.estados[0][0] === 1 &&
        this.estados[0][1] === 1 &&
        this.estados[0][2] === 1
      )
        return 'gato';
      if (
        this.estados[1][0] === 1 &&
        this.estados[1][1] === 1 &&
        this.estados[1][2] === 1
      )
        return'gato';
      if (
        this.estados[2][0] === 1 &&
        this.estados[2][1] === 1 &&
        this.estados[2][2] === 1
      )
        return 'gato';

      // Combinaciones verticales para el jugador 1
      if (
        this.estados[0][0] === 1 &&
        this.estados[1][0] === 1 &&
        this.estados[2][0] === 1
      )
        return 'gato';
      if (
        this.estados[0][1] === 1 &&
        this.estados[1][1] === 1 &&
        this.estados[2][1] === 1
      )
        return 'gato';
      if (
        this.estados[0][2] === 1 &&
        this.estados[1][2] === 1 &&
        this.estados[2][2] === 1
      )
        return 'gato';

      // Combinaciones diagonales para el jugador 1
      if (
        this.estados[0][0] === 1 &&
        this.estados[1][1] === 1 &&
        this.estados[2][2] === 1
      )
        return 'gato';
      if (
        this.estados[0][2] === 1 &&
        this.estados[1][1] === 1 &&
        this.estados[2][0] === 1
      )
        return 'gato';

      // Combinaciones horizontales para el jugador 2
      if (
        this.estados[0][0] === -1 &&
        this.estados[0][1] === -1 &&
        this.estados[0][2] === -1
      )
        return 'ratón';
      if (
        this.estados[1][0] === -1 &&
        this.estados[1][1] === -1 &&
        this.estados[1][2] === -1
      )
        return 'ratón';
      if (
        this.estados[2][0] === -1 &&
        this.estados[2][1] === -1 &&
        this.estados[2][2] === -1
      )
        return 'ratón';

      // Combinaciones verticales para el jugador 2
      if (
        this.estados[0][0] === -1 &&
        this.estados[1][0] === -1 &&
        this.estados[2][0] === -1
      )
        return 'ratón';
      if (
        this.estados[0][1] === -1 &&
        this.estados[1][1] === -1 &&
        this.estados[2][1] === -1
      )
        return 'ratón';
      if (
        this.estados[0][2] === -1 &&
        this.estados[1][2] === -1 &&
        this.estados[2][2] === -1
      )
        return 'ratón';

      // Combinaciones diagonales para el jugador 2
      if (
        this.estados[0][0] === -1 &&
        this.estados[1][1] === -1 &&
        this.estados[2][2] === -1
      )
        return 'ratón';
      if (
        this.estados[0][2] === -1 &&
        this.estados[1][1] === -1 &&
        this.estados[2][0] === -1
      )
        return 'ratón';

      // Verificar empate
      let empate = true;
      for (let i = 0; i < this.estados.length; i++) {
        for (let j = 0; j < this.estados[i].length; j++) {
          if (this.estados[i][j] === 0) {
            empate = false;
            break;
          }
        }
        if (!empate) {
          break;
        }
      }

      if (empate) {
        Swal.fire({
          title: "¡Empatados!",
          text: "El juego ha terminado en empate entre el gato y el ratón.",
          confirmButtonText: "Reiniciar",
        }).then(() => {
          this.activarEstados();
          this.limpiarPintura();
          this.pintarRejilla();
          this.escenario();
          this.dibujar();
          this.play();
        });

        return 0;
      }

      
      return 0;
    },

// Método para mostrar el icono del jugador actual
    mostrarIconoTurno: function () {
      const contenedorTurno = document.getElementById("contenedorTurno");
      contenedorTurno.innerHTML = "";

      const iconoJugador = document.createElement("img");
      iconoJugador.id = "iconoJugador";
      iconoJugador.src = this.turnoJugador === 1 ? "img/gato.svg" : "img/raton.svg";
      iconoJugador.alt = `Icono Jugador ${this.turnoJugador}`;

      contenedorTurno.appendChild(iconoJugador);

      const textoTurno = document.createTextNode(`${this.turnoJugador}`);
      contenedorTurno.appendChild();
    },

// Método principal para iniciar el juego
    play: function () {
      this.pintarRejilla();
      this.escenario();
      this.dibujar();
      canvas.addEventListener("mousedown", this.seleccionar.bind(this));
      canvas.addEventListener("mousemove", this.pintarHover.bind(this));

      const botonAnterior = document.getElementById("botonReinicio");
      if (botonAnterior) {
        botonAnterior.remove();
      }

      const contenedorCanvas = canvas.parentNode;
      const botonReinicio = document.createElement("button");
      botonReinicio.textContent = "Reiniciar Juego";
      botonReinicio.id = "botonReinicio";
      botonReinicio.classList.add("miBotonClase");

      botonReinicio.addEventListener("click", () => {
        this.activarEstados();
        this.limpiarPintura();
        this.pintarRejilla();
        this.escenario();
        this.dibujar();
        this.turnoJugador = 1;
        this.play();
      });

      contenedorCanvas.appendChild(botonReinicio);

      this.mostrarIconoTurno();
      this.dibujarLineaGanadora();
    },
  };

// Función global para reiniciar el juego
  window.activarEstados = function () {
    gato.activarEstados();
    document.getElementById("turno").textContent = `Turno: Jugador 1`;
  };

// Iniciar el juego al cargar la página
  window.onload = function () {
    gato.play();
  };
}

// Llamar a la función principal para iniciar la aplicación
app();
