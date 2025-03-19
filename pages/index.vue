<template>
    <div style="height:100vh; width:100vw">
    <ClientOnly>
      <LMap
        ref="map"
        :zoom="zoom"
        :center="[47.21322, -1.559482]"
        :use-global-leaflet="true"
        :options="{
            zoomControl: false,
        }"
        @ready="onMapReady"
      >
          <LTileLayer v-if="LayersMaps === 'OpenStreetmap'"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&amp;copy; <a href=&quot;https://www.openstreetmap.org/&quot;>OpenStreetMap</a> contributors"
            layer-type="base"
            name="OpenStreetMap"
          />

          <LWmsTileLayer v-if="LayersMaps === 'OSM WMS'"
            url="https://maps.heigit.org/osm-wms/service"
            attribution="HeiGIT <a href='https://osm-wms.de'>OSM WMS</a>"
            layer-type="base"
            name="osm-wms.de"
            :max-zoom="10"
            version="1.3.0"
            format="image/png"
            :transparent="true"
            layers="osm_auto:all"
          />

          <!-- Add GeoJSON layer 
          
            Le datas de géoson sont chargé que si les options d'affichage sont activées
            et que le filtre par région ou département est activé
          -->
          
          
          <section v-if="OptionsDisplay[0].value === true">
              <div v-if="Select_Filter_Region_Departement === 'Region'">
                  <LGeoJson
                  v-if="geoJsonData"
                  :geojson="geoJsonData"
                  :options-style="geoStyler"
                  :options="{ onEachFeature }"
                />
            </div>
            

            <!-- Add GeoDepartementlayer -->
            <div v-if="Select_Filter_Region_Departement === 'Departement'">
                <LGeoJson
                  v-if="geoDepartementData"
                  :geojson="geoDepartementData"
                  :options-style="geoStyler"
                  :options="{ onEachFeature }"
                />
            </div>
                

          </section>

          <!--Custom LayerUpload-->
          <div v-if="NewJSonFiles_upload !== null">
                <LGeoJson
                  v-if="NewJSonFiles_upload"
                  :geojson="NewJSonFiles_upload"
                  :options-style="geoStyler"
                  :options="{ onEachFeature }"
                />
          </div>
          

          <!-- Scale -->
          <LControlScale position="topright" :imperial="true" :metric="false" />

          <!-- Zoom Control -->
          <LControlZoom position="bottomright" />
         
         <!-- Marker 
            Les markers ne sont affichés que si l'option d'affichage est activée 
          -->

          <section v-if="OptionsDisplay[2].value === true">

              <LMarker 
                  v-if="geoData" 
                  v-for="location in geoData.data.locations" 
                  :lat-lng="[location.latitude, location.longitude]"
                  @click="handleMarkerDoubleClick(location)"
                > 
                <!-- Icon Custom-->
                <LIcon :icon-url="IconTaxi" :icon-size="iconSize" />

                <!--Tooltip -->
                <LTooltip>
                    <UDashboardPanelContent>
                        <ul>
                            <li>Note: {{location.note}}</li>
                            <li>Description: {{location.description}}</li>
                            <li>Batiment: {{location.batiment}}</li>
                        </ul>
                    </UDashboardPanelContent>
                </LTooltip>
              </LMarker>

          </section>
         
        <!-- Control Display -->
        <LControl position="topright">
            <div class="relative p-3 w-auto">
              <UButton label="Affichage" color="blue" class="dark:text-slate-20" icon="i-heroicons-square-3-stack-3d"  @click="isModalOpenLayers = ! isModalOpenLayers" />

              <div class="absolute text-sm w-[270px] p-2 top-[4rem] -left-[9rem]  bg-slate-50 dark:bg-slate-800 rounded-md shadow-md" v-if="isModalOpenLayers">
                <UDashboardPanelContent class="h-[340px] space-y-2">
                  
                  <ul class="space-y-2">

                      <li v-for="options in OptionsDisplay" :key="options.label" class="flex justify-between items-centerb text-lg">
                        <span>{{options.label}}</span>
                        <UToggle v-model="options.value" />
                      </li>
                  </ul>

                    <UDivider />
  
                  <ul class="space-y-2">
                      <li class="flex justify-between items-centerb text-lg">
                        <span>OpenStreetMap</span>
                        <URadio v-model="LayersMaps" value="OpenStreetmap" />
                      </li>

                      <li class="flex justify-between items-centerb text-lg">
                        <span>OSM WMS</span>
                        <URadio v-model="LayersMaps" value="OSM WMS" />
                      </li>
                  </ul>

                  <UDivider />

                  <div class="px-3 py-3 border-2 border-dashed border-gray-300 h-auto rounded-md">
                      <label for="file" class="text-sm cursor-pointer  flex flex-col justify-center space-y-3">
                        <UIcon name="i-heroicons-arrow-up-tray" class="w-5 h-5 mx-auto text-primary-500" />
                        <span class="text-center">Téléverser un fichier</span>
                      </label>
                      <!-- <input type="file" id="file"  class="hidden" accept=".geojson,.json, .gpx" @change="handleFileUpload" /> -->
                      <input type="file" id="file" class="hidden" accept=".geojson,.json,.gpx" @change="handleFileUpload" />
                  </div>
                  
               

                </UDashboardPanelContent>
              </div>
            </div>
        </LControl>

        <!--Region filter-->

        <section v-if="OptionsDisplay[1].value === true" class="relative">

          <UDashboardPanel width="430" class="absolute top-5 left-3 p-3  bg-slate-50 dark:bg-slate-800  shadow-md rounded-md z-[1000]">
              <UDashboardPanelContent class="max-h-[430px] space-y-2 text-lg">

                      <USelect v-model="Select_Filter_Region_Departement" :options="Options_Region_Departement" />

                        <div v-if="data_meteo !== null" class="space-y-4">
                            <div class="flex flex-col items-center space-y-2">
                                <img :src="'https:' + data_meteo.current.condition.icon" alt="Icône météo">
                                <h1 class="text-2xl text-center font-semibold">{{ regionSelected }}</h1>
                                <span class="text-sm"><b>Lat :</b>{{ data_meteo.location.lat }} - <b>Long : </b>{{ data_meteo.location.lon }} </span>
                            </div>
                            <div class="flex space-x-2 justify-between w-[75%] mx-auto">
                                <span class="flex items-center flex-col space-x-2">
                                    <span class="text-xs">Température(°C)</span>
                                    {{ data_meteo.current.temp_c }}°C
                                </span>
                                <UDivider orientation="vertical" class="h-8" />
                                <span class="flex items-center flex-col space-x-2">
                                    <span class="text-xs">Température(°F)</span>
                                    {{ data_meteo.current.temp_f }}°F
                                </span>
                                <UDivider orientation="vertical" class="h-8" />
                                <span class="flex items-center flex-col space-x-2">
                                    <span class="text-xs">Ressentie</span>
                                    {{ data_meteo.current.feelslike_c }}°C
                                </span>
                                <UDivider orientation="vertical" class="h-8" />
                                <span class="flex items-center flex-col space-x-2">
                                    <span class="text-xs">Humidité</span>
                                    {{ data_meteo.current.humidity }}%
                                </span>
                                
                            </div>
                        </div>

                        <UDivider />

                        <div class="flex space-y-2 flex-col mx-auto" v-if="data_meteo !== null">
                          <h2 class="text-xl">Dernières mise à jour </h2>
                          <span class="text-center text-sm">{{ data_meteo.location.localtime}}</span>
                        </div>    
                        
                        <!--Si les datas de la météo sont null-->

                        <section v-else class="text-center space-y-2">

                            <svg  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-7 mx-auto animate-spin">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                          </svg>

                          <span  class="text-xs">Loading...</span>

                        </section>

                        



              </UDashboardPanelContent>
          </UDashboardPanel>

        </section>


          <!---
            Cette balise permet d'afficher la position de l'utilisateur
          -->
          <LMarker 
                  v-if=" UserPosition !== null" 
                  :lat-lng="UserPosition">
                  <LIcon :icon-url="UserLocation" :icon-size="iconSize" /> 

                  <LTooltip>
                    <UDashboardPanelContent>
                        <p>Vous etes ici ! </p>
                    </UDashboardPanelContent>
                </LTooltip>
          </LMarker>

      </LMap>
    </ClientOnly>
    </div>

    <UDashboardSlideover v-model="open" title="Waypoints">
        
        <UDashboardPanelContent>

            {{ waypoints_data }}
          
        </UDashboardPanelContent>


        <template #footer>
            <h1>Hello World</h1>
        </template>
    </UDashboardSlideover>

      <!---Notification-->
      <div class="absolute bg-slate-50 dark:bg-slate-800 bottom-6 right-3 p-3 z-[1000] shadow-md" v-if="message_popup">
          <div class="flex flex-col space-y-2">
              <div class="flex items-center justify-between">
                  <span class="text-md font-semibold text-green-500">Success</span>
                  <svg @click="message_popup = false" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 cursor-pointer hover:stroke-green-500">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
              </div>
              <span class="text-md">Le fichier a été téléverser avec succès ! </span>
          </div>
      </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import L from 'leaflet'
  import 'leaflet/dist/leaflet.css';
  import 'leaflet-routing-machine';
  import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'; //
  import 'leaflet.fullscreen';
  import 'leaflet.fullscreen/Control.FullScreen.css';
  import 'leaflet-gpx';
  import "leaflet-draw";
  import "leaflet-draw/dist/leaflet.draw.css";


  const map = ref(null); 
  const drawnShapes = ref([]); // Stocker les objets dessinés
    
  /**
   * ICON Custom
   */
    const startIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Départ
      iconSize: [35, 35],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34]
    });

    const endIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149059.png', // Arrivée
      iconSize: [35, 35],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34]
    });

    /**
   * ICon Taxi
   */
   const IconTaxi = "/svg/taxi-svgrepo-com.svg"; 
   const iconSize = [32, 32]
   const UserLocation="/svg/location-indicator-red-svgrepo-com.svg";
  
  /***
   * Quand la carte leaflet est prête
   * et que l'instance de la carte est disponible
   * on peut manipuler les évenements
   * et les controleurs de la carte
   */

  const onMapReady=()=>{
    console.log('Map is ready');
    const leafletMap = map.value.leafletObject;
     

    console.log(leafletMap);
    
    if(leafletMap){
      /**
       * Ajout leaflet draw
       */

      const drawnItems = new L.FeatureGroup();
      leafletMap.addLayer(drawnItems);

      const drawControl = new L.Control.Draw({
        draw: {
          polyline: true,
          polygon: true,
          rectangle: true,
          circle: true,
          marker: true
        },
        edit: {
          featureGroup: drawnItems,
          remove: true
        }
      });

      leafletMap.addControl(drawControl);

      // ✅ Écoute les dessins et stocke les coordonnées
      leafletMap.on(L.Draw.Event.CREATED, function (event) {
        const layer = event.layer;
        drawnItems.addLayer(layer);
        
        // ✅ Ajouter l'objet GeoJSON à la liste des formes
        drawnShapes.value.push(layer.toGeoJSON());

        console.log("✅ Objet dessiné :", layer.toGeoJSON());
      });

      /**
       * Ajout du controleur de plein écran
       */
      leafletMap.addControl(new L.Control.FullScreen({
        position: 'bottomright',
        title: {
          'false': 'View Fullscreen',
          'true': 'Exit Fullscreen'
        }
      }));

      leafletMap.on('dblclick', (e)=>{
        console.log(e.latlng);
      })

      /**
       * La variale 
       * routingControl
       * pour manipuler le controleur de la route
       */

      const routingControl=L.Routing.control({
        waypoints: [
          L.latLng(48.8566, 2.3522), // Départ
          L.latLng(49.8666, 6.3622)  // Arrivée
        ],
        routeWhileDragging: false,
        show: false,
        lineOptions: { // Personnalisation du tracé
          styles: [
            { color: 'red', opacity: 0.7, weight: 4, dashArray: '10, 10' }
          ]
        },
        collapseOnResize: false,
        addWaypoints: false,
        createMarker: function(i, waypoint) {
          const marker = L.marker(waypoint.latLng, {
            draggable: false,
            icon: i === 0 ? startIcon : endIcon
          });

          marker.bindPopup(i === 0 ? "🚀 Point de départ" : "🏁 Destination").openPopup();

          return marker;
  
        }
      }).addTo(leafletMap);

      /**
       * Suppression de l'UI du contrôleur
       * Leaflet Routing control  
       */

      const controlContainer = document.querySelector('.leaflet-routing-container');
      if (controlContainer) {
        controlContainer.remove(); // 🔥 Supprime uniquement l'UI, conserve la route
      }

      /**
       * Ajout des points sur le tracé de la route
       */
      routingControl.on('routesfound', function (e) {
        const route = e.routes[0]; // Récupérer l'itinéraire principal

        /**
         * Boucle sur les coordonnées du tracé et ajoute des points visibles
         */
          for (let i = 0; i < route.coordinates.length; i += Math.floor(route.coordinates.length / 10)) {
              const coord = route.coordinates[i]; // Coordonnée actuelle

              // Simuler une heure d'enregistrement
              const timestamp = new Date(Date.now() - (route.coordinates.length - i) * 60000);
              const timeFormatted = timestamp.toLocaleTimeString();

              // Ajouter un petit point SUR le tracé de la route
              const pointMarker = L.circleMarker([coord.lat, coord.lng], {
                radius: 5, 
                color: "blue", 
                fillColor: "blue",
                fillOpacity: 1
              }).addTo(leafletMap);

              /**
               * fficher l'heure quand on clique sur le point
               */
              pointMarker.bindPopup(`📍 Point ${i + 1} <br> 🕒 Capturé à : ${timeFormatted}`)
                .on('click', function () {
                  this.openPopup(); // ✅ Affiche le popup seulement au clic
                });
          }
      });


    }else{
      console.log('Map not ready');
    }

    
    
  }

 
 

  //  const OpenAltertModal =ref(true);
  //  const LoadingAlertModal = ref(false);
  

  /***
   * Filtre par régioou departement 
   */

   const Options_Region_Departement = ['Region', 'Departement'];
   const Select_Filter_Region_Departement = ref(Options_Region_Departement[0]);
    

  const waypoints_data = ref(null)

  const zoom = ref(6)

  // WaysPoint API


  const { data:geoData, error, status } = await useFetch('/api')

  if (error.value) {
    console.error('Erreur lors du chargement des données:', error.value)
  }

   /**
    * Modal bolean
   */
  
   const isModalOpenLayers = ref(false)

  const handleMarkerDoubleClick = (location) => {
    waypoints_data.value = location
    open.value = true
    // Ajoutez votre logique ici
  }
  
  //Slide Modal
  const open = ref(false)

  /**
   * Selection Mode d'affichage
  */

  const OptionsDisplay = reactive([
    {
      label: 'GeoJson France',
      value: false
    },
    {
      label: 'Conditions météo',
      value: false
    }, 
    {
      label: 'Markers',
      value: false
    },
  ]); 

  const LayersMaps = ref("OpenStreetmap"); 

  // Add GeoJSON data and styler
  const geoJsonData = ref(null)
  const geoDepartementData = ref(null)
  const regionSelected = ref(null)

  let previousLayer = null; // Pour garder une référence à la couche précédemment sélectionnée

  // Style function for regions
  const geoStyler = (feature) => {
    return {
      fillColor: '#3388ff',
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.2
    }
  }

  // Fetch GeoJSON data
  onMounted(async () => {
    try {
      const response = await fetch('/api/geojson')
      geoJsonData.value = await response.json()
    } catch (error) {
      console.error('Erreur lors du chargement du GeoJSON:', error)
    }
  })

  /**
   * 
   * @param feature 
   * @param layer 
   */
  const onEachFeature = (feature, layer) => {
    layer.bindPopup(`
      <div>
        <strong>Région:</strong> ${feature.properties.nom}<br>
        <strong>Code:</strong> ${feature.properties.code}
      </div>
    `)
    
    layer.on('click', () => {
      // Réinitialiser le style de la couche précédente si elle existe
      if (previousLayer) {
        previousLayer.setStyle({
          fillColor: '#3388ff',
          weight: 2,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.2
        })
      }

      // Appliquer le nouveau style à la région cliquée
      layer.setStyle({
        fillColor: '#ff5733',
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.2
      })

      // Mettre à jour la référence à la couche sélectionnée
      previousLayer = layer;
      regionSelected.value = feature.properties.nom;
    })

  }

  /***
   * Affichage par département
   */

   onMounted(async ()=>{

    try {
      const response = await fetch("/api/geodepartement")
      geoDepartementData.value = await response.json()
    } catch (error) {
      console.error('Erreur lors du chargement du GeoJSON:', error)
    }
   })

   /***
    * Le modal ne s'affiche que lorsque 
    * le GeoJson est activé
    */
  
    
  const data_meteo = ref(null);
  
  
   watch(()=>regionSelected.value, (value)=>{

    const GetMeteo= async ()=>{
    const response=await fetch(`https://api.weatherapi.com/v1/current.json?key=9f614dbac1144f3d9ce135059252102&q=${value}&aqi=yes`)
    const data=await response.json(); 
    console.log(data);

    data_meteo.value=data;
    }
    GetMeteo();
    
  }); 

  /**
   * Uplaoader un fichier GeoJSON 
   * ou GPX
   */

   const NewJSonFiles_upload = ref(null);
  
   function handleFileUpload(event) {
      const file = event.target.files[0];

      if (file) {
        const reader = new FileReader();

        if (file.name.endsWith('.geojson') || file.name.endsWith('.json')) {
          // ✅ Lire et traiter les fichiers GeoJSON normalement
          reader.readAsText(file);
          reader.onload = (e) => {
            try {
              const geojson = JSON.parse(e.target.result);
              NewJSonFiles_upload.value = geojson;

              if (NewJSonFiles_upload.value !== null) {
                message_popup.value = true;
                console.log("✅ GeoJSON chargé :", NewJSonFiles_upload.value);
              }
            } catch (error) {
              console.error("❌ Erreur lors de la lecture du GeoJSON :", error);
            }
          };
        } 
        
        else if (file.name.endsWith('.gpx')) {
            // ✅ Lire et traiter les fichiers GPX
            const leafletMap = map.value.leafletObject;
            reader.readAsText(file);
            reader.onload = (e) => {
            const gpxData = e.target.result; // Contenu brut du fichier GPX

              // ✅ Ajouter directement le contenu GPX sans passer par une URL
            new L.GPX(gpxData, {
              async: true,
              marker_options: {
                    startIconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Icône départ
                    endIconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149059.png', // Icône arrivée
                    shadowUrl: ''
                  }}).on('loaded', function (e) {
                    leafletMap.fitBounds(e.target.getBounds()); // Centrer la carte sur le parcours
                    console.log("✅ GPX chargé et affiché !");
                  })
                  .on('error', function(e) {
                    console.error("❌ Erreur lors du chargement du fichier GPX :", e);
                  })
                  .addTo(leafletMap);

              message_popup.value = true;

            };
        } 
        
        else {
          console.error("❌ Format de fichier non pris en charge !");
        }
      }
    }


  /***
   * Message de confirmation
   */

  const message_popup = ref(false);

  watch(()=>message_popup.value, (value)=>{
    if(value === true){
      setTimeout(()=>{
        message_popup.value = false;
      }, 3000)
    }
  })

  /***
   * Get UserPostion
   */

   const UserPosition= ref(null);

   const DisplayUserPosition=(pos)=>{
    
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;


      UserPosition.value = [lat, lon];

      const leafletMap = map.value.leafletObject;
      // leafletMap.setView([lat, lon], 13);
      leafletMap.flyTo([lat, lon], 13);
   }

   const DisplayError=(err)=>{
     console.log("Vous avez cette erreur",err);
   }

   onMounted(()=>{

    /**
     * La méthode Geolocation.watchPosition() permet de manipuler 
     * une fonction appelée automatiquement à chaque fois que la position de l'appareil change.  
    */

      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(DisplayUserPosition,DisplayError,{
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000
        })
      }
   }); 


   /***
    * WEBSOCKET WITH : SERVER SENT EVENT (SSE), DATA REAL TIME
    */

    const eventData= ref(null);

    onMounted(()=>{

      // Connexion à la route API créée dans Nuxt

      const eventSource = new EventSource('/api/sse');
      
      eventSource.onmessage = (event) => {
        console.log('Message:', event.data);
        eventData.value = JSON.parse(event.data);
      }

      eventSource.onerror = (error) => {
        console.error('Erreur:', error);
        eventSource.close();
      }


    })




   
</script>
  