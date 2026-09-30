// ==========================================
// ESPACIO PARA LA API DEL PROFESOR
// ==========================================

// Pega aquí la URL que te proporcione el profesor:
const URL_API_PROFESOR = ""; 

function consultarDatosInvernadero() {
    // Si la API está activa, puedes usar esto:
    /*
    if (URL_API_PROFESOR) {
        fetch(URL_API_PROFESOR)
            .then(res => res.json())
            .then(data => {
                document.getElementById("val-temp").textContent = data.temperatura;
                document.getElementById("map-temp").textContent = data.temperatura;
                document.getElementById("val-hum").textContent = data.humedad;
            })
            .catch(err => console.error("Error al conectar con la API:", err));
        return;
    }
    */

    // Simulación en vivo para la presentación escolar:
    const tempAleatoria = (28 + Math.random() * 2).toFixed(1);
    document.getElementById("val-temp").textContent = tempAleatoria;
    document.getElementById("map-temp").textContent = tempAleatoria;
}

window.addEventListener("DOMContentLoaded", () => {
    consultarDatosInvernadero();
    setInterval(consultarDatosInvernadero, 4000);
});