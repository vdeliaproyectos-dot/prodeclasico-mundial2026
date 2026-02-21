// CONFIGURACIÓN - Reemplaza con tu URL de la NUEVA VERSIÓN del Script
const URL_APPS_SCRIPT = "https://script.google.com/macros/s/AKfycbyxMuszySNcZVpFdwBsggLRYeGQV14TFl-Mg0UUwm6R-6n9ZrXUsMd2SiRVXak6E5LS/exec";

let datosCompletos = [];
let prediccionesUsuario = {};
let datos = []; // Esto hace que la variable sea visible en todo el archivo

// DICCIONARIO COMPLETO DE BANDERAS (Mundial 2026)
const banderas = {
    // Sudamérica
    "Argentina": "ar", "Brasil": "br", "Uruguay": "uy", "Colombia": "co", "Chile": "cl", "Ecuador": "ec", "Paraguay": "py", "Perú": "pe", "Venezuela": "ve", "Bolivia": "bo",
    // Norte y Centroamérica
    "México": "mx", "Estados Unidos": "us", "Canadá": "ca", "Costa Rica": "cr", "Panamá": "pa", "Honduras": "hn", "Jamaica": "jm",
    // Europa
    "España": "es", "Francia": "fr", "Alemania": "de", "Italia": "it", "Portugal": "pt", "Inglaterra": "gb-eng", "Países Bajos": "nl", "Bélgica": "be", "Croacia": "hr", "Suiza": "ch", "Dinamarca": "dk", "Serbia": "rs", "Polonia": "pl", "Escocia": "gb-sct", "Gales": "gb-wls",
    // Asia
    "Corea del Sur": "kr", "Japón": "jp", "Arabia Saudita": "sa", "Irán": "ir", "Australia": "au", "Qatar": "qa",
    // África
    "Marruecos": "ma", "Senegal": "sn", "Túnez": "tn", "Camerún": "cm", "Ghana": "gh", "Nigeria": "ng", "Egipto": "eg"
};

document.addEventListener("DOMContentLoaded", cargarFixture);

// 1. CARGAR PARTIDOS
async function cargarFixture() {
    const contenedor = document.getElementById("contenedor-partidos");
    contenedor.innerHTML = "<div class='loader'>Cargando fixture...</div>";
    
    try {
        const res = await fetch(URL_APPS_SCRIPT + "?t=" + new Date().getTime());
        datosCompletos = await res.json();
        mostrarPartidos(datosCompletos);
    } catch (err) {
        contenedor.innerHTML = "<p style='color:red;'>Error de conexión. Verifica la URL del Script.</p>";
    }
}

// 2. MOSTRAR PARTIDOS (3 COLUMNAS)
function mostrarPartidos(partidos) {
    const contenedor = document.getElementById("contenedor-partidos");
    contenedor.innerHTML = "";
    const ahora = new Date();

    const grupos = {};
    partidos.forEach(p => {
        if (!p.ID && !p.id) return;
        const fase = p.Fase || p.fase || "General";
        if (!grupos[fase]) grupos[fase] = [];
        grupos[fase].push(p);
    });

    for (const nombreFase in grupos) {
        const seccion = document.createElement("div");
    seccion.className = "seccion-fase";
    
    // Generamos un ID amigable (minúsculas y sin espacios)
    const idFase = nombreFase.toLowerCase().replace(/\s+/g, '-');
    
    // Agregamos el id="${idFase}" aquí abajo:
    seccion.innerHTML = `<h2 id="${idFase}" class="titulo-fase">${nombreFase}</h2>`;

    const grid = document.createElement("div");
    grid.className = "grid-partidos";

        grupos[nombreFase].forEach(p => {
            const keys = Object.keys(p);
            const local = (p.EquipoL || p.equipoL || p[keys[1]] || "Local").toString().trim();
            const visitante = (p.EquipoV || p.equipoV || p[keys[2]] || "Visitante").toString().trim();
            const id = p.ID || p.id || p[keys[0]];
            
            const fechaObj = new Date(p.Fecha || p.fecha);
            const bloqueado = ahora >= fechaObj;
            const f = !isNaN(fechaObj) ? fechaObj.toLocaleDateString('es-ES', {day:'2-digit', month:'2-digit'}) : "TBD";
            const h = !isNaN(fechaObj) ? fechaObj.toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit'}) : "--:--";

            const card = document.createElement("div");
            card.className = `partido-card ${bloqueado ? 'bloqueado' : ''}`;
            card.innerHTML = `
                <div class="info-superior">
                    <span>📅 ${f}</span>
                    <span class="hora-txt">⏰ ${h} HS</span>
                </div>
                <div class="fila-partido">
                    <div class="equipo-bloque local">
                        <img class="banderita" src="https://flagcdn.com/w80/${banderas[local] || 'un'}.png">
                        <span class="nombre-equipo">${local}</span>
                    </div>
                    <div class="controles-voto">
                    <button onclick="seleccionar('${id}','L')" id="btn-${id}-L" class="btn-voto">L</button>
                    <button onclick="seleccionar('${id}','E')" id="btn-${id}-E" class="btn-voto">E</button>
                    <button onclick="seleccionar('${id}','V')" id="btn-${id}-V" class="btn-voto">V</button>
                </div>
                    <div class="equipo-bloque visitante">
                        <span class="nombre-equipo">${visitante}</span>
                        <img class="banderita" src="https://flagcdn.com/w80/${banderas[visitante] || 'un'}.png">
                    </div>
                </div>
                ${bloqueado ? '<div class="banner-cerrado">🔒 CERRADO</div>' : ''}
            `;
            grid.appendChild(card);
        });
        seccion.appendChild(grid);
        contenedor.appendChild(seccion);
    }
}

// 3. SELECCIÓN DE VOTO
function seleccionar(id, valor) {
    // 1. Guardamos la elección en nuestro objeto global
    prediccionesUsuario[id] = valor;

    // 2. Buscamos todos los botones de ESTE partido específico (L, E, V)
    // Usamos el ID del partido para no afectar a los otros partidos del fixture
    const botonesDelPartido = document.querySelectorAll(`[id^="btn-${id}-"]`);

    // 3. Quitamos la clase 'active' de los 3 botones para "limpiar"
    botonesDelPartido.forEach(boton => {
        boton.classList.remove('active');
    });

    // 4. Se la ponemos únicamente al botón que el usuario presionó
    const botonSeleccionado = document.getElementById(`btn-${id}-${valor}`);
    if (botonSeleccionado) {
        botonSeleccionado.classList.add('active');
    }
    
    console.log(`Partido ${id} marcado como: ${valor}`); // Para que veas en consola que funciona
}

// Función para abrir y cargar el ranking
async function verRanking() {
    const modal = document.getElementById("modal-ranking");
    const contenedor = document.getElementById("contenido-ranking");
    
    modal.style.display = "block";
    // Limpiamos CUALQUIER cosa que haya quedado antes
    contenedor.innerHTML = "<p style='text-align:center; color:white;'>Cargando posiciones...</p>";

    try {
        const respuesta = await fetch(URL_APPS_SCRIPT + "?tipo=ranking&v=" + Date.now());
        const datos = await respuesta.json();

        if (!datos || datos.length === 0) {
            contenedor.innerHTML = "<p style='text-align:center; color:white;'>No hay datos aún.</p>";
            return;
        }

        // Armamos la tabla con títulos incluidos para que queden alineados
        let html = `
            <h2 style="text-align:center; color:#ffd700; margin-bottom:10px;">🏆 Posiciones</h2>
            <table style="width:100%; color:white; border-collapse:collapse;">
                <thead>
                    <tr style="color:#ffd700; border-bottom:2px solid #ffd700;">
                        <th style="padding:10px;">Pos</th>
                        <th style="padding:10px; text-align:left;">Usuario</th>
                        <th style="padding:10px;">Pts</th>
                    </tr>
                </thead>
                <tbody>`;

        datos.forEach((fila, i) => {
            // Usamos Object.values por si los nombres de columna en el Excel tienen espacios
            const valores = Object.values(fila);
            const nombre = valores[0] || "---";
            const puntos = (valores[1] === "" || valores[1] === undefined) ? 0 : valores[1];

            html += `
                <tr style="border-bottom:1px solid #444;">
                    <td style="padding:12px; text-align:center;">${i + 1}</td>
                    <td style="padding:12px; text-align:left;">${nombre}</td>
                    <td style="padding:12px; text-align:center; color:#ffd700; font-weight:bold;">${puntos}</td>
                </tr>`;
        });

        html += "</tbody></table>";
        
        // El paso final: inyectar la tabla en el div vacío
        contenedor.innerHTML = html;

    } catch (error) {
        console.error("Error:", error);
        contenedor.innerHTML = "<p style='color:red; text-align:center;'>Error de conexión.</p>";
    }
}
// Función para cerrar el modal
function cerrarRanking() {
    document.getElementById("modal-ranking").style.display = "none";
}

// Cerrar si hacen clic fuera de la cajita negra
window.onclick = function(event) {
    const modal = document.getElementById("modal-ranking");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// 5. ENVIAR A GOOGLE SHEETS
async function enviarPredicciones() {
    const usuario = document.getElementById("nombre-usuario").value.trim();
    if (!usuario) return alert("Ingresa tu nombre");

    // Ahora 'datos' ya no dará error porque es global
    if (datos && datos.length > 0) {
        const yaExiste = datos.some(u => 
            (u.Nombre || "").toString().toLowerCase().trim() === usuario.toLowerCase()
        );

        if (yaExiste) {
            return alert("¡Error! El usuario '" + usuario + "' ya participó.");
        }
    }

    const votosArray = Object.entries(prediccionesUsuario).map(([id, valor]) => ({
        id: id,
        valor: valor
    }));

    if (votosArray.length === 0) return alert("No hay votos para enviar");

    try {
        await fetch(URL_APPS_SCRIPT, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify({ usuario: usuario, votos: votosArray })
        });
        alert("¡Predicciones guardadas!");
        location.reload();
    } catch (e) {
        alert("Error al guardar.");
    }
}