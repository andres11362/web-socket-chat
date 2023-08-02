// Variables
const ws = new WebSocket('ws://localhost:8081');
const nm = document.querySelector("#nuevo-mensaje");
const tc = document.querySelector("#text-chat");
const btn = document.querySelector("#button-enviar")

const open = (e) => {
    //abre conexion
    console.log("WebSocket abierto.");
}

const message = async (e) => {
    // Se recibe un mensaje
    // console.log("WebSocket ha recibido un mensaje");
    // Mostrar mensaje en HTML
    const { data } = await e;

    const msg = JSON.parse(data);

    const user = localStorage.getItem('user');

    if (msg.hasOwnProperty('user') && !user) {
        localStorage.setItem('user', msg.user);
    } else if (msg.hasOwnProperty('sender') && user) {
        tc.innerHTML = tc.innerHTML.concat(`<span class="${user === msg.sender ? 'user-chat' : 'partner-chat'}">${msg.msg}</span>`, "<br>");
    }
}

const error = (e) => {
    // Ha ocurrido un error
    console.error("WebSocket ha observado un error: ", e);
}

const close = () => {

    const user = localStorage.getItem('user');
    // Cierra la conexión
    if (user) {
        localStorage.removeItem('user');
    }

    console.log("WebSocket cerrado.");
}

const enviarNuevoMensaje = (e) => {
    // Evento tecla Enter
    if (e.code === "Enter") {
        // Envia mensaje por WebSockets
        ws.send(JSON.stringify(nm.value));
        // Borra texto en el input
        nm.value = "";
    }
}

const enviarNuevoMensajeButton = (e) => {
    if(nm.value !== "") {
        ws.send(JSON.stringify(nm.value));
        nm.value = "";
    }
}

// Eventos de WebSocket
ws.addEventListener("open", open);
ws.addEventListener("message", message);
ws.addEventListener("error", error);
ws.addEventListener("close", close);

// Evento para envia nuevo mensaje
nm.addEventListener("keypress", enviarNuevoMensaje);

//Evento para el boton
btn.addEventListener("click", enviarNuevoMensajeButton);


// Evento para la recarga
window.addEventListener('beforeunload', (e) => {
    if (window.performance.navigation && window.performance.navigation.type === 1) {
        localStorage.removeItem('user');
    } else {
        console.log('La página no ha sido recargada');
    }
})
