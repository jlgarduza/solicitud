//Inicializamos la geolocalizacion
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.setCenter(initialLocation);
        marker.setPosition(initialLocation); 
    });
} 

var map;
var centro = { lat: 19.1771493, lng: -96.1434687 };
function initialize() {
    var mapdivMap = document.getElementById("lienzoMapa");
    mapdivMap.style.width = '100%';
    mapdivMap.style.height = (window.innerHeight) + "px";
    
    var mapOptions = {
        zoom: 13,
        center: centro,
        disabledDefaultUI: true,
        mapTypeControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById('mapa'), mapOptions);
}

//Eliminar marcadores
var arregloMarcadores = [];
function borrarMarcadores() {
    for (var i = 0; i < arregloMarcadores.length; i++ ) {
        arregloMarcadores[i].setMap(null);
    }
    arregloMarcadores.length = 0;
}

//Crear nuevos marcadores
function marcadores(){
    firebase.database().ref('Arrendatario').orderByChild('status').equalTo(1).on('value',(data)=>{
        data.forEach(function(snapshot){
            var newPost = snapshot.val();
            var NLat = parseFloat(newPost.Latitude);
            var NLon = parseFloat(newPost.Longitude);
            var ubicacion = new google.maps.LatLng(NLat, NLon);
            var marker = new google.maps.Marker({
                map: map,
                position: ubicacion,
                icon: 'assets/img/disponible.png',
                draggable: true
            });
            var contentString = "texto";
            var infowindow = new google.maps.InfoWindow({
                content: contentString,
                position: ubicacion,
                draggable: true
            });
            marker.addListener('click', function() {
                infowindow.open(map, marker);
            });
            arregloMarcadores.push(marker);
            
        });
    });
}

//Intervalo
var Intervalo = function intervaloEjecutado(){
    borrarMarcadores();
    console.log("Marcadores borrados");
    marcadores();
    console.log("Intervalo Ejecutado");
    
};
setInterval(Intervalo, 1500);

google.maps.event.addDomListener(window, 'load', initialize);

//aqui se crea un searchbox para busqueda de autocompletado del origen y destino
var searchBox = new google.maps.places.SearchBox(document.getElementById('origen'));
var searchBox2 = new google.maps.places.SearchBox(document.getElementById('destino'));

//funcion de busqueda del searchbox
google.maps.event.addListener(searchBox, 'places_changed',function(){

    var places = searchBox.getPlaces();

    var bounds = new google.maps.LatLngBounds();
    var i, place;
    for(i=0; place=places[i];i++){
        bounds.extend(place.geometry.location);
        marker.setPosition(place.geometry.location);
    }

    //Agregado 30122019
    $('#latitude').val(marker.getPosition().lat());
    $('#longitude').val(marker.getPosition().lng());
    
    map.fitBounds(bounds);
    map.setZoom(15);
});

//funcion de busqueda del searchbox2
google.maps.event.addListener(searchBox2, 'places_changed',function(){

    var places = searchBox2.getPlaces();

    var bounds = new google.maps.LatLngBounds();
    var i, place;

    for(i=0; place=places[i];i++){
        bounds.extend(place.geometry.location);
        marker2.setPosition(place.geometry.location);
    }
    //Se agregaron campos para cambiar coordenadas automaticamente 30122019
    $('#dlatitude').val(marker2.getPosition().lat());
    $('#dlongitude').val(marker2.getPosition().lng());
    
    map.fitBounds(bounds);
    map.setZoom(15);
});
var directionsService = new google.maps.DirectionsService(); //Obtener coordenadas
var directionsDisplay = new google.maps.DirectionsRenderer(); //Traduce las coordenas a la ruta visible

//funcion del calculo de ruta
function calcularRuta(){
    //aqui debera recibir los valores de los marcadores y no de los campos te busqueda
    var request = {
        origin: document.getElementById('origen').value,
        destination: document.getElementById('destino').value,
        travelMode: 'DRIVING'
    };
    directionsService.route(request, function(result, Status){
        var TotalDistancia = result.routes[0].legs[0].distance.text;
        var DistanciaNum = parseFloat(TotalDistancia);
        
        //Modificado el 09 del Diciembre del 2019 por JLG
        if (DistanciaNum <= 3.5) {
            costo = 40;
        }else if(DistanciaNum <=3.9){
            costo = 40;
        }else if(DistanciaNum >=4 && DistanciaNum <= 5 ) {
            var costo = DistanciaNum * 10;
        }else if (DistanciaNum >=5 && DistanciaNum <= 7){
            var costo = DistanciaNum * 9;
        }else if(DistanciaNum >= 7 && DistanciaNum <= 9){
            var costo = DistanciaNum * 7;
        }else{
            var costo =  DistanciaNum * 8;
        }

        document.getElementById('cst').innerHTML = costo.toFixed(2);
        document.getElementById('dstnc').innerHTML = DistanciaNum;
        /* paypalPriceElement = document.getElementById('paypalPrice');*/
        //paypalPriceElement.value = costo;
        if (Status == "OK") {
            directionsDisplay.setDirections(result);
            directionsDisplay.setMap(map);
        }
    
    })
}
document.getElementById('calc').onclick= function(){ calcularRuta(); };

function calcularCosto(){
    var costo = document.getElementById('cst').innerHTML;
    return costo;
}

//Function guardar solicitud
function btnGuardar(){
            
    var origen = document.getElementById('origen').value;
    var latitud = document.getElementById('latitude').value;
    var longitud = document.getElementById('longitude').value;
    if(latitud == "") {
        //alert("El campo nombre esta vacio");
        swal({
            title: "Debes ingresar Origen",
            //text: "Debes cotizar primero",
            icon: "warning",
          });
        document.getElementById("origen").focus();
        return false;
       }
    
    var costo = document.getElementById('cst').innerHTML;
    if(costo == "") {
        //alert("El campo nombre esta vacio");
        swal({
            title: "Debes de cotizar primero",
            //text: "Debes cotizar primero",
            icon: "warning",
          });
        //document.getElementById("cst").focus();
        return false;
       }
    
    var destino = document.getElementById('destino').value;
    var dlatitud = document.getElementById('dlatitude').value;
    var dlongitud = document.getElementById('dlongitude').value;
    if(dlatitud == "") {
        //alert("El campo nombre esta vacio");
        swal({
            title: "Debes ingresar destino",
            //text: "Debes cotizar primero",
            icon: "warning",
          });
        document.getElementById("destino").focus();
        return false;
       }

    var status = document.getElementById('status').value;
    //var conductor = "";
       
    

    var referencia = database.ref("Solicitud");

        referencia.push(
            {
                origen: origen,
                Olatitud: latitud,
                Olongitud: longitud,
                precio: costo,
                destino: destino,
                Dlatitud: dlatitud,
                Dlongitud: dlongitud,
                status: status
                //Arrendatario: conductor
            },
            function()
            {
                //alert('El alta se ha realizado correctamente');
                swal({
                    title: "Servicio Solicitado",
                    text: "En espera de ser asignado por un conductor",
                    icon: "success",
                  });
            });
}
