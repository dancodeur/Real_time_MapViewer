<template>
    <div style="height:100vh; width:100vw">
      <LMap
        ref="map"
        :zoom="zoom"
        :center="[47.21322, -1.559482]"
        :use-global-leaflet="false"
      >
        <LTileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&amp;copy; <a href=&quot;https://www.openstreetmap.org/&quot;>OpenStreetMap</a> contributors"
          layer-type="base"
          name="OpenStreetMap"
        />
         
        <LMarker 
          v-if="geoData" 
          v-for="location in geoData.data.locations" 
          :lat-lng="[location.latitude, location.longitude]"
          @click="handleMarkerDoubleClick(location)"
          @mouseover="handleMarkerWayPoints(location, location.id)"
          :hidden="location.id !== waypoint_id"
        >
        <LIcon :icon-url="IconTaxi" :icon-size="iconSize" />
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
         
        <div v-if="waypoint_id">
            <LPolyline
                v-for="waypoint in waypoint_.waypoint"
                :lat-lngs="[
                [waypoint.latitude, waypoint.longitude],
                ]"
            color="green"
        />
        </div>
      </LMap>
    </div>

    <UDashboardSlideover v-model="open" title="Waypoints">
        
        <UDashboardPanelContent>

            {{ waypoints_data }}
          
        </UDashboardPanelContent>


        <template #footer>
            <h1>Hello World</h1>
        </template>
    </UDashboardSlideover>
  </template>
  
  <script setup>
  /**
   * ICon Taxi
   */


   const IconTaxi = "/svg/taxi-svgrepo-com.svg"; 
   const iconSize = [32, 32]

  const waypoints_data = ref(null)
  import { ref } from 'vue'
  const zoom = ref(6)

  // WaysPoint ID
  const waypoint_id = ref(null); 
  const waypoint_ = ref(null);

  const { data:geoData, error, status } = await useFetch('/api')

  if (error.value) {
    console.error('Erreur lors du chargement des données:', error.value)
  }

  const handleMarkerDoubleClick = (location) => {
    waypoints_data.value = location
    open.value = true
    // Ajoutez votre logique ici
  }
  
  //Slide Modal
  const open = ref(false)

  const handleMarkerWayPoints = (location, id) => { 
    waypoint_id.value = id;
    waypoint_.value = location;

    console.log(waypoint_.value); 
    console.log(waypoint_id.value);
  }

   
  </script>
  