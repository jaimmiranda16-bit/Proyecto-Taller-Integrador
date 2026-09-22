// =====================================================
// CANVAS
// =====================================================

const canvas = document.getElementById("canvas");

const ctx = canvas.getContext("2d");


// =====================================================
// VARIABLES
// =====================================================

let ancho = 0;
let alto = 0;

let zoom = 1;

let offsetX = 0;
let offsetY = 0;

let arrastrando = false;

let ultimoX = 0;
let ultimoY = 0;

let particulas = [];

const cantidadParticulas = 900;


// Activar/desactivar elementos

let mostrarParticulas = true;

let mostrarLluvia = true;


// =====================================================
// HORA
// =====================================================

const horas = [

    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
    "00:00",
    "01:00",
    "02:00",
    "03:00",
    "04:00",
    "05:00",
    "06:00",
    "07:00",
    "08:00"

];


let horaActual = 10;

let reproduciendo = false;


// =====================================================
// DATOS DEL CLIMA
// =====================================================
//
// ESTOS DATOS SON DE EJEMPLO.
//
// Cuando les den la API,
// vamos a reemplazar estos datos
// por los datos reales.
//
// =====================================================

const datosClima = {

    viento: {

        velocidad: 2,

        direccion: 0

    },

    lluvia: [

        {
            x: 53,
            y: 30,
            radio: 60,
            intensidad: .8
        },

        {
            x: 58,
            y: 35,
            radio: 40,
            intensidad: .5
        },

        {
            x: 70,
            y: 27,
            radio: 70,
            intensidad: .4
        },

        {
            x: 48,
            y: 40,
            radio: 35,
            intensidad: .7
        }

    ]

};


// =====================================================
// MAPA
// =====================================================
//
// Coordenadas aproximadas.
// Se utilizan para representar
// los continentes dentro del Canvas.
//
// =====================================================

const continentes = [

    // América del Norte

    [

        [-168, 72],
        [-140, 70],
        [-125, 60],
        [-110, 55],
        [-100, 50],
        [-90, 48],
        [-85, 42],
        [-90, 30],
        [-105, 25],
        [-115, 30],
        [-120, 40],
        [-135, 50],
        [-150, 55]

    ],


    // América Central

    [

        [-90, 20],
        [-85, 18],
        [-82, 10],
        [-78, 8],
        [-75, 12],
        [-80, 20]

    ],


    // América del Sur

    [

        [-80, 10],
        [-70, 5],
        [-60, 8],
        [-50, 0],
        [-45, -10],
        [-50, -20],
        [-55, -30],
        [-60, -40],
        [-65, -52],
        [-72, -55],
        [-75, -45],
        [-70, -30],
        [-75, -15]

    ],


    // Europa

    [

        [-10, 36],
        [0, 42],
        [10, 44],
        [20, 48],
        [30, 55],
        [25, 65],
        [10, 70],
        [0, 60],
        [-10, 55],
        [-15, 45]

    ],


    // África

    [

        [-18, 35],
        [0, 37],
        [15, 32],
        [30, 20],
        [35, 5],
        [30, -10],
        [20, -25],
        [10, -35],
        [-5, -30],
        [-15, -10],
        [-20, 10]

    ],


    // Asia

    [

        [25, 40],
        [40, 45],
        [60, 50],
        [80, 55],
        [100, 60],
        [120, 55],
        [140, 50],
        [155, 45],
        [160, 30],
        [145, 20],
        [130, 15],
        [115, 20],
        [100, 15],
        [85, 20],
        [70, 25],
        [55, 30],
        [40, 30]

    ],


    // India

    [

        [70, 25],
        [85, 20],
        [90, 8],
        [80, 5],
        [72, 10]

    ],


    // Australia

    [

        [115, -15],
        [130, -12],
        [145, -18],
        [153, -28],
        [145, -38],
        [130, -40],
        [115, -35],
        [110, -25]

    ],


    // Japón

    [

        [138, 40],
        [145, 38],
        [142, 30],
        [136, 34]

    ]

];


// =====================================================
// CONVERTIR LONGITUD/LATITUD
// =====================================================

function coordenadas(longitud, latitud) {

    const escalaX =
        ancho / 360;

    const escalaY =
        alto / 180;


    const x =
        (longitud + 180) *
        escalaX;


    const y =
        (90 - latitud) *
        escalaY;


    return {

        x: x,
        y: y

    };

}


// =====================================================
// AJUSTAR CANVAS
// =====================================================

function ajustarCanvas() {

    const rect =
        canvas.getBoundingClientRect();


    const dpr =
        window.devicePixelRatio || 1;


    canvas.width =
        rect.width * dpr;


    canvas.height =
        rect.height * dpr;


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    ancho = rect.width;

    alto = rect.height;

}


// =====================================================
// CREAR PARTICULAS
// =====================================================

function crearParticulas() {

    particulas = [];


    for (
        let i = 0;
        i < cantidadParticulas;
        i++
    ) {

        particulas.push({

            x:
                Math.random() *
                ancho,

            y:
                Math.random() *
                alto,

            velocidad:
                Math.random() *
                1.5 + .5,

            direccion:
                Math.random() *
                Math.PI * 2,

            longitud:
                Math.random() *
                10 + 5,

            vida:
                Math.random() *
                100,

            opacidad:
                Math.random() *
                .5 + .2

        });

    }

}


// =====================================================
// FONDO DEL MAPA
// =====================================================

function dibujarFondo() {

    const gradiente =
        ctx.createLinearGradient(
            0,
            0,
            0,
            alto
        );


    gradiente.addColorStop(
        0,
        "#a9c9dc"
    );


    gradiente.addColorStop(
        .5,
        "#d7e2e8"
    );


    gradiente.addColorStop(
        1,
        "#a8c6d9"
    );


    ctx.fillStyle =
        gradiente;


    ctx.fillRect(
        0,
        0,
        ancho,
        alto
    );

}


// =====================================================
// GRID
// =====================================================

function dibujarGrid() {

    ctx.save();


    ctx.translate(
        offsetX,
        offsetY
    );


    ctx.scale(
        zoom,
        zoom
    );


    ctx.strokeStyle =
        "rgba(70,100,110,.15)";


    ctx.lineWidth =
        1 / zoom;


    // Longitudes

    for (
        let lon = -180;
        lon <= 180;
        lon += 20
    ) {

        const inicio =
            coordenadas(
                lon,
                90
            );

        const final =
            coordenadas(
                lon,
                -90
            );


        ctx.beginPath();

        ctx.moveTo(
            inicio.x,
            inicio.y
        );

        ctx.lineTo(
            final.x,
            final.y
        );

        ctx.stroke();

    }


    // Latitudes

    for (
        let lat = -80;
        lat <= 80;
        lat += 20
    ) {

        const inicio =
            coordenadas(
                -180,
                lat
            );

        const final =
            coordenadas(
                180,
                lat
            );


        ctx.beginPath();

        ctx.moveTo(
            inicio.x,
            inicio.y
        );

        ctx.lineTo(
            final.x,
            final.y
        );

        ctx.stroke();

    }


    ctx.restore();

}


// =====================================================
// MAPA
// =====================================================

function dibujarMapa() {

    ctx.save();


    ctx.translate(
        offsetX,
        offsetY
    );


    ctx.scale(
        zoom,
        zoom
    );


    for (
        let c = 0;
        c < continentes.length;
        c++
    ) {

        const continente =
            continentes[c];


        ctx.beginPath();


        for (
            let i = 0;
            i < continente.length;
            i++
        ) {

            const punto =
                continente[i];


            const posicion =
                coordenadas(
                    punto[0],
                    punto[1]
                );


            if (i === 0) {

                ctx.moveTo(
                    posicion.x,
                    posicion.y
                );

            } else {

                ctx.lineTo(
                    posicion.x,
                    posicion.y
                );

            }

        }


        ctx.closePath();


        ctx.fillStyle =
            "#eeeeea";


        ctx.fill();


        ctx.strokeStyle =
            "#a7a7a2";


        ctx.lineWidth =
            1.5 / zoom;


        ctx.stroke();

    }


    ctx.restore();

}


// =====================================================
// LLUVIA
// =====================================================

function dibujarLluvia() {

    if (!mostrarLluvia) {

        return;

    }


    ctx.save();


    ctx.translate(
        offsetX,
        offsetY
    );


    ctx.scale(
        zoom,
        zoom
    );


    for (
        let i = 0;
        i < datosClima.lluvia.length;
        i++
    ) {

        const zona =
            datosClima.lluvia[i];


        const x =
            ancho *
            zona.x / 100;


        const y =
            alto *
            zona.y / 100;


        const gradiente =
            ctx.createRadialGradient(
                x,
                y,
                0,
                x,
                y,
                zona.radio
            );


        gradiente.addColorStop(
            0,
            "rgba(0,100,255,.65)"
        );


        gradiente.addColorStop(
            .4,
            "rgba(0,180,255,.45)"
        );


        gradiente.addColorStop(
            1,
            "rgba(0,200,255,0)"
        );


        ctx.fillStyle =
            gradiente;


        ctx.beginPath();

        ctx.arc(
            x,
            y,
            zona.radio,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }


    ctx.restore();

}


// =====================================================
// PARTÍCULAS
// =====================================================

function actualizarParticulas() {

    for (
        let i = 0;
        i < particulas.length;
        i++
    ) {

        const p =
            particulas[i];


        /*
            Movimiento del viento.

            Más adelante estos valores
            pueden venir directamente
            desde la API.
        */


        p.x +=
            Math.cos(
                p.direccion
            ) *
            p.velocidad *
            datosClima.viento.velocidad;


        p.y +=
            Math.sin(
                p.direccion
            ) *
            p.velocidad;


        // Movimiento ondulado

        p.y +=
            Math.sin(
                p.vida * .04
            ) * .15;


        p.vida++;


        // Reaparecer

        if (
            p.x >
            ancho + 50
        ) {

            p.x = -50;

            p.y =
                Math.random() *
                alto;

        }


        if (
            p.x <
            -50
        ) {

            p.x =
                ancho + 50;

        }


        if (
            p.y >
            alto + 50
        ) {

            p.y = -50;

        }


        if (
            p.y <
            -50
        ) {

            p.y =
                alto + 50;

        }

    }

}


// =====================================================
// DIBUJAR PARTÍCULAS
// =====================================================

function dibujarParticulas() {

    if (!mostrarParticulas) {

        return;

    }


    ctx.save();


    ctx.translate(
        offsetX,
        offsetY
    );


    ctx.scale(
        zoom,
        zoom
    );


    for (
        let i = 0;
        i < particulas.length;
        i++
    ) {

        const p =
            particulas[i];


        const largo =
            p.longitud *
            p.velocidad;


        ctx.beginPath();


        ctx.moveTo(
            p.x,
            p.y
        );


        ctx.lineTo(

            p.x -
            Math.cos(p.direccion) *
            largo,

            p.y -
            Math.sin(p.direccion) *
            largo

        );


        ctx.strokeStyle =
            `rgba(
                60,
                70,
                75,
                ${p.opacidad}
            )`;


        ctx.lineWidth =
            1 / zoom;


        ctx.stroke();

    }


    ctx.restore();

}


// =====================================================
// ANIMACIÓN
// =====================================================

function animar() {

    actualizarParticulas();


    dibujarFondo();


    dibujarGrid();


    dibujarLluvia();


    dibujarMapa();


    dibujarParticulas();


    requestAnimationFrame(
        animar
    );

}


// =====================================================
// ZOOM CON RUEDA
// =====================================================

canvas.addEventListener(
    "wheel",
    function (evento) {

        evento.preventDefault();


        if (
            evento.deltaY < 0
        ) {

            zoom *= 1.1;

        } else {

            zoom *= .9;

        }


        if (zoom < .6) {

            zoom = .6;

        }


        if (zoom > 4) {

            zoom = 4;

        }

    }
);


// =====================================================
// ARRASTRAR MAPA
// =====================================================

canvas.addEventListener(
    "mousedown",
    function (evento) {

        arrastrando = true;


        ultimoX =
            evento.clientX;


        ultimoY =
            evento.clientY;

    }
);


canvas.addEventListener(
    "mousemove",
    function (evento) {

        if (!arrastrando) {

            return;

        }


        const movimientoX =
            evento.clientX -
            ultimoX;


        const movimientoY =
            evento.clientY -
            ultimoY;


        offsetX +=
            movimientoX;


        offsetY +=
            movimientoY;


        ultimoX =
            evento.clientX;


        ultimoY =
            evento.clientY;

    }
);


canvas.addEventListener(
    "mouseup",
    function () {

        arrastrando = false;

    }
);


canvas.addEventListener(
    "mouseleave",
    function () {

        arrastrando = false;

    }
);


// =====================================================
// BOTÓN +
// =====================================================

document
    .getElementById("zoomMas")
    .addEventListener(
        "click",
        function () {

            zoom *= 1.2;


            if (zoom > 4) {

                zoom = 4;

            }

        }
    );


// =====================================================
// BOTÓN -
// =====================================================

document
    .getElementById("zoomMenos")
    .addEventListener(
        "click",
        function () {

            zoom *= .8;


            if (zoom < .6) {

                zoom = .6;

            }

        }
    );


// =====================================================
// CENTRAR
// =====================================================

document
    .getElementById("centrar")
    .addEventListener(
        "click",
        function () {

            zoom = 1;

            offsetX = 0;

            offsetY = 0;

        }
    );


// =====================================================
// ACTIVAR/DESACTIVAR PARTICULAS
// =====================================================

document
    .getElementById("particulas")
    .addEventListener(
        "change",
        function () {

            mostrarParticulas =
                this.checked;

        }
    );


// =====================================================
// ACTIVAR/DESACTIVAR LLUVIA
// =====================================================

document
    .getElementById("lluvia")
    .addEventListener(
        "change",
        function () {

            mostrarLluvia =
                this.checked;

        }
    );


// =====================================================
// PLAY
// =====================================================

const botonPlay =
    document.getElementById("play");


const textoHora =
    document.getElementById("horaActual");


botonPlay.addEventListener(
    "click",
    function () {

        reproduciendo =
            !reproduciendo;


        if (reproduciendo) {

            botonPlay.textContent =
                "❚❚";

        } else {

            botonPlay.textContent =
                "▶";

        }

    }
);


// =====================================================
// CAMBIAR HORA
// =====================================================

function actualizarHoraActual() {
    // 1. Obtener la hora local formateada (ej. "18:00")
    const ahora = new Date();
    const horaFormateada = String(ahora.getHours()).padStart(2, '0') + ':00';

    // 2. Obtener todos los spans dentro del contenedor .horas
    const elementosHoras = document.querySelectorAll('.horas span');

    elementosHoras.forEach(span => {
        // Quitar la clase activa de todos los elementos
        span.classList.remove('hora-activa');

        // Asignar la clase únicamente al span que coincide con la hora actual
        if (span.textContent.trim() === horaFormateada) {
            span.classList.add('hora-activa');
        }
    });
}

// Ejecutar al cargar la página
window.addEventListener('load', () => {
    actualizarHoraActual();
    // Opcional: Revisa la hora cada minuto por si cambia la hora mientras la página está abierta
    setInterval(actualizarHoraActual, 60000); 
});


// =====================================================
// REDIMENSIONAR
// =====================================================

window.addEventListener(
    "resize",
    function () {

        ajustarCanvas();

    }
);


// =====================================================
// INICIAR
// =====================================================

function iniciar() {

    ajustarCanvas();

    crearParticulas();

    animar();

}


window.addEventListener(
    "load",
    iniciar
);