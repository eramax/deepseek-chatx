<script setup>
import { ref } from 'vue';

const props = defineProps({
  show: Boolean,
  settings: Object,
});

const emit = defineEmits(['close', 'save']);
const localSettings = ref({ ...props.settings });
const saveSettings = () => {
  emit('save', { ...localSettings.value });
  emit('close');
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-spotify-elevated rounded-xl p-6 w-full max-w-md">
      <h2 class="text-xl font-bold mb-6">Settings</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1 text-spotify-text">Server URL</label>
          <input v-model="localSettings.serverUrl" 
                 class="w-full bg-spotify-base rounded-md p-2 border border-spotify-text/10 focus:border-spotify-highlight focus:outline-none" 
                 placeholder="https://api.deepseek.com">
        </div>
        <div>
          <label class="block text-sm font-medium mb-1 text-spotify-text">API Token</label>
          <input v-model="localSettings.apiToken" 
                 type="password" 
                 class="w-full bg-spotify-base rounded-md p-2 border border-spotify-text/10 focus:border-spotify-highlight focus:outline-none" 
                 placeholder="Your DeepSeek API token">
        </div>
        <div>
          <label class="block text-sm font-medium mb-1 text-spotify-text">Model Name</label>
          <input v-model="localSettings.modelName" 
                 class="w-full bg-spotify-base rounded-md p-2 border border-spotify-text/10 focus:border-spotify-highlight focus:outline-none" 
                 placeholder="deepseek-chat">
        </div>
      </div>
      <div class="flex justify-end gap-3 mt-6">
        <button @click="emit('close')" class="btn btn-secondary">Cancel</button>
        <button @click="saveSettings" class="btn btn-primary">Save</button>
      </div>
    </div>
  </div>
</template>