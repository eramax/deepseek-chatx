<script setup>
import { marked } from 'marked';
import { computed } from 'vue';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css'; 

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
});

// تفعيل تمييز الأكواد داخل `marked`
marked.setOptions({
  highlight: (code, lang) => {
    return hljs.highlightAuto(code).value;
  },
});

const formattedContent = computed(() => marked.parse(props.message.content));
</script>

<template>
  <div
    :class="[
      'p-4 border-b border-spotify-elevated',
      message.role === 'assistant' ? 'bg-spotify-subtle' : 'bg-spotify-base',
    ]"
  >
    <div class="w-full max-w-3x flex gap-4">
      <div
        class="w-8 h-8 rounded-full flex items-center justify-center text-sm"
        :class="
          message.role === 'assistant'
            ? 'bg-spotify-highlight text-black'
            : 'bg-spotify-elevated'
        "
      >
        {{ message.role === 'assistant' ? 'AI' : 'U' }}
      </div>
      <div class="flex-1 prose prose-invert max-w-full mt-[-20px]">
        <div v-html="formattedContent"></div>
      </div>
    </div>
  </div>
</template>
