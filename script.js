let elemento;
let canvas;

let particulas = [];


function iniciar() {

    elemento = document.getElementById("canvas");

    canvas = elemento.getContext("2d");


    // Creamos 100 partículas

    for (let i = 0; i < 100; i++) {

        particulas.push({

            x: Math.random() * 800,

            y: Math.random() * 500,

            moverx: 2,

            movery: 0,

            velocidad: Math.random() * 2 + 1

        });

    }


    bucle();

}



function bucle() {

    procesar();

    dibujar();


    requestAnimationFrame(bucle);

}



function procesar() {

    for (let i = 0; i < particulas.length; i++) {

        particulas[i].x +=
            particulas[i].moverx *
            particulas[i].velocidad;


        // Si sale por la derecha,
        // vuelve a aparecer por la izquierda

        if (particulas[i].x > 800) {

            particulas[i].x = 0;

        }

    }

}



function dibujar() {

    canvas.clearRect(
        0,
        0,
        800,
        500
    );


    for (let i = 0; i < particulas.length; i++) {

        canvas.beginPath();

    canvas.moveTo(
    particulas[i].x,
    particulas[i].y
);

canvas.lineTo(
    particulas[i].x - 10,
    particulas[i].y
);

canvas.stroke();
    }

}


window.addEventListener(
    "load",
    iniciar
);