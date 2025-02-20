<template>
    <UDashboardLayout>
      <UDashboardPanel :width="200" collapsible>

        <UDashboardNavbar>
            <template #left>
                <h1>HELLO</h1>
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
        label: 'Home',
        icon: 'i-heroicons-home'
        }, {
        label: 'Inbox',
        icon: 'i-heroicons-inbox',
        badge: '4'
        }, {
        label: 'Users',
        icon: 'i-heroicons-user-group'
        }, {
        label: 'Settings',
        icon: 'i-heroicons-cog-8-tooth',
        children: [{
            label: 'General'
        }, {
            label: 'Members'
        }, {
            label: 'Notifications'
        }]
    }]
</script>