// Establecer la conexión MQTT
var client = new Paho.MQTT.Client("broker.emqx.io", 1883, "clientId");

// Establecer los callbacks de conexión
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// Conectarse al broker MQTT
client.connect({ onSuccess: onConnect });

// Callback de conexión exitosa
function onConnect() {
  console.log("Conexión exitosa a MQTT");

  // Suscribirse a un tema
  client.subscribe("InTopic");
}

// Callback de pérdida de conexión
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("Conexión perdida: " + responseObject.errorMessage);
  }
}

// Callback de llegada de mensaje
function onMessageArrived(message) {
    console.log("Mensaje recibido: " + message.payloadString);
  
    // Obtener el elemento de la lista en el HTML
    var dataList = document.getElementById("mqtt-data-list");
  
    // Crear un nuevo elemento de lista y asignar el contenido del mensaje
    var listItem = document.createElement("li");
    listItem.textContent = message.payloadString;
  
    // Agregar el nuevo elemento de lista al elemento de lista existente en el HTML
    dataList.appendChild(listItem);
  }
  
