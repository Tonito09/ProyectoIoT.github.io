// Establecer la conexión MQTT utilizando el protocolo TCP
var client = new Paho.MQTT.Client("test.mosquitto.org", 8080, "clientId");

// Establecer los callbacks de conexión
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// Conectarse al broker MQTT
client.connect({ onSuccess: onConnect, useSSL: false });

// Variable para almacenar los elementos de lista por tópico
var listItemsByTopic = {};

// Callback de conexión exitosa
function onConnect() {
  console.log("Conexión exitosa a MQTT");

  // Suscribirse a los tópicos correspondientes
  client.subscribe("InTopic");
  client.subscribe("ImageTopic");
}

// Callback de pérdida de conexión
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("Conexión perdida: " + responseObject.errorMessage);
    // Intentar reconectarse
    setTimeout(function() {
      client.connect({ onSuccess: onConnect, useSSL: false });
    }, 5000); // Intentar reconectarse después de 5 segundos
  }
}

// Variables para almacenar los elementos de lista actuales
var mqttDataListItem = null;
var imageListItem = null;

// Callback de llegada de mensaje
function onMessageArrived(message) {
  console.log("Mensaje recibido: " + message.payloadString);

  // Obtener el tópico del mensaje
  var topic = message.destinationName;

  // Obtener el elemento de lista correspondiente al tópico en el HTML si no existe
  var dataList;
  if (topic === "ImageTopic") {
    dataList = document.getElementById("image-list");
  } else {
    dataList = document.getElementById("mqtt-data-list");
  }

  // Si ya hay un elemento de lista, reemplazar su contenido
  var listItem;
  if (topic === "ImageTopic") {
    if (imageListItem) {
      listItem = imageListItem;
    } else {
      listItem = document.createElement("li");
      imageListItem = listItem;
      dataList.appendChild(listItem);
    }
  } else {
    if (mqttDataListItem) {
      listItem = mqttDataListItem;
    } else {
      listItem = document.createElement("li");
      mqttDataListItem = listItem;
      dataList.appendChild(listItem);
    }
  }

  // Asignar el contenido del mensaje al elemento de lista correspondiente
  listItem.textContent = message.payloadString;
  
  // Si el mensaje es "Acceso Permitido"
  if (message.payloadString === "Acceso Permitido") {
    // Crear un botón verde "Aceptar"
    var acceptButton = document.createElement("button");
    acceptButton.textContent = "Aceptar";
    acceptButton.classList.add("green-button");
    acceptButton.addEventListener("click", function() {
      acceptButton.classList.add("highlight");
      setTimeout(function() {
        acceptButton.classList.remove("highlight");
      }, 1000);
    });

    // Agregar el botón al elemento de lista
    listItem.appendChild(acceptButton);
  }
  
  // Si el mensaje es "Acceso Denegado"
  if (message.payloadString === "Acceso Denegado") {
    // Crear un botón rojo "Rechazar"
    var rejectButton = document.createElement("button");
    rejectButton.textContent = "Rechazar";
    rejectButton.classList.add("red-button");
    rejectButton.addEventListener("click", function() {
      rejectButton.classList.add("highlight");
      setTimeout(function() {
        rejectButton.classList.remove("highlight");
      }, 1000);
    });

    // Agregar el botón al elemento de lista
    listItem.appendChild(rejectButton);
  }
}
