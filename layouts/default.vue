<template>
    <UDashboardLayout>
      <UDashboardPanel :width="200" collapsible>

        <UDashboardNavbar>
            <template #left>
                <h1 class="text-xl font-sans">Dan Elenga</h1>
            </template>
        </UDashboardNavbar>

       
  
        <UDashboardSidebar class="">
            <UDashboardSidebarLinks :links="links" />
            <template #footer>
                <UColorModeButton />
            </template>
        </UDashboardSidebar>
      </UDashboardPanel>

      <!---Section Pages-->

      <slot />
  
      
    </UDashboardLayout>
  </template>
  
  <script setup lang="ts">

  
  //links for the sidebar
    const links = [{
        label: 'Carte',
        icon: 'i-heroicons-map',
        to: '/'
        }, {
        label: 'Console',
        icon: 'i-heroicons-command-line',
        children:[
            {
                label: 'Simulateur',
                to: '#'
            }
        ]
    }]
</script>