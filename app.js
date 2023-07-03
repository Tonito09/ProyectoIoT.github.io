// Establecer la conexión MQTT utilizando WebSocket seguro
var client = new Paho.MQTT.Client("broker.emqx.io", 8084, "clientId");

// Establecer los callbacks de conexión
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// Conectarse al broker MQTT
client.connect({ onSuccess: onConnect, useSSL: true });

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
      client.connect({ onSuccess: onConnect, useSSL: true });
    }, 5000); // Intentar reconectarse después de 5 segundos
  }
}

// Variables para almacenar los elementos de lista actuales
var mqttDataListItem = null;
var imageListItem = null;

/// Callback de llegada de mensaje
function onMessageArrived(message) {
  console.log("Mensaje recibido: " + message.payloadString);

  // Obtener el tópico del mensaje
  var topic = message.destinationName;

  // Obtener el elemento de lista correspondiente al tópico en el HTML si no existe
  var dataList;
  if (topic === "ImageTopic") {
    dataList = document.getElementById("image-list");
    // Vaciar la lista de imágenes antes de agregar un nuevo elemento
    dataList.innerHTML = "";
  } else {
    dataList = document.getElementById("mqtt-data-list");
    // Vaciar la lista MQTT antes de agregar un nuevo elemento
    dataList.innerHTML = "";
  }

  // Parsear el mensaje como JSON solo si el tópico es "ImageTopic"
  var data;
  if (topic === "ImageTopic") {
    try {
      data = JSON.parse(message.payloadString);
    } catch (error) {
      console.log("Error al parsear el mensaje JSON:", error);
      return;
    }
  }

  // Crear un nuevo elemento de lista
  var listItem = document.createElement("li");

  // Si el tópico es "ImageTopic" y el mensaje contiene una imagen válida
  if (topic === "ImageTopic" && data && data.image && data.image.url) {
    // Crear un elemento de imagen
    var imageElement = document.createElement("img");
    imageElement.src = data.image.url;
    imageElement.alt = "Imagen recibida";

    // Agregar la imagen al elemento de lista
    listItem.appendChild(imageElement);
  } else {
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

  // Agregar el nuevo elemento de lista al dataList
  dataList.appendChild(listItem);
}
