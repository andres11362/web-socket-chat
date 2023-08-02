//importaciones
const http = require('http');
const ws = require('ws');

//Creamos una instancia del servidor HTTP (web)
const server = http.createServer();

// Creamos y levantamos un servidor de WebSockets a partir del servidor HTTP
const wss = new ws.Server({ server });


//Se crea la lista de clientes
const clients = new Map();

// Funcion para crear un identificador unico para cada cliente.
const createUUID = () => {
    let dt = new Date().getTime();

    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });

    return uuid;
}

// Funcion para crear un color en hexadecimal
const createHexColor = () => {
    let n = (Math.random() * 0xfffff * 1000000).toString(16);
    return '#' + n.slice(0, 6);
};
  
// Escuchamos los eventos de conexión
wss.on("connection", (ws) => {

    // generamos la info de cada cliente que se conecte
    const id = createUUID();

    const color = createHexColor();
    const metadata = { id, color };
    clients.set(ws, metadata);

    ws.send(JSON.stringify({ user: id}));

    // Escuchamos los mensajes entrantes
    ws.on("message", (data) => {

        // obtenemos el mensaje y el cliente relacionado
        const message = { msg: JSON.parse(data)};
        const metadata = clients.get(ws);

        //Indicamos el usuario y color
        message.sender = metadata.id;
        message.color = metadata.color;

        //Agregamos la data y lo convertimos en un string
        const outbound = JSON.stringify(message);

        //Iteramos todos los clientes que estan conectados
        [...clients.keys()].forEach((client) => {
            if (client.readyState === ws.OPEN) {
                // Enviamos la información recibida
                client.send(outbound);
            }
        });
    })

    ws.on("close", () => {
        clients.delete(ws);
    });
    
});


// Levantamos servidor HTTP
server.listen(8081);
console.log("Servidor funcionando. Utiliza ws://localhost:8081 para conectar.")
