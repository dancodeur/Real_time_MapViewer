<template>
  <div class="grid grid-cols-12 p-2 gap-2">
    <section class="col-span-6">
        <div style="height:900px; width:865px;">
          <LMap
            ref="map"
            :zoom="6"
            :center="[47.21322, -1.559482]"
            :use-global-leaflet="false"
          >
            <LTileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&amp;copy; <a href=&quot;https://www.openstreetmap.org/&quot;>OpenStreetMap</a> contributors"
              layer-type="base"
              name="OpenStreetMap"
            />
          </LMap>
        </div>
    </section>

    <section class="col-span-6 ">
      <form @submit.prevent>
         <div class="flex flex-col space-y-4 p-4">
            <div class="flex flex-col space-y-2">
               <label for="name" class="text-white">Url</label>
               <input type="text" id="name" class="p-2 bg-slate-100 border-2 border-slate-300 dark:text-slate-50 text-slate-800 dark:bg-gray-800"/>
            </div>
            <div class="flex flex-col space-y-2">
               <label for="method" class="text-white">Method</label>
               <select id="method" class="p-2 bg-slate-100 border-2 border-slate-300 dark:text-slate-50 text-slate-800 dark:bg-gray-800">
                 <option value="GET">GET</option>
                 <option value="POST">POST</option>
               </select>
            </div>
            <div class="ftext-red-500">
              <MonacoEditor v-model="value" lang="json" style="height: 500px;" :options="{ theme:'vs-dark'}">
                  // Monaco editor value
              </MonacoEditor>
            </div>
            <button type="submit" class="p-2 bg-blue-500 text-white">Submit</button>
         </div>
      </form>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const value = ref(''); // Monaco editor value

const map = ref(null)

const onMapReady = () => {
  console.log('Map is ready');
  const leafletMap = map.value.leafletObject;

  console.log(leafletMap);

  if (leafletMap) {
    leafletMap.on('dblclick', (e) => {
      console.log(e.latlng);
    });
  } else {
    console.log('Leaflet map object is not available');
  }
}

</script>