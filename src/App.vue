<script setup>
import { ref, onMounted } from 'vue';
import ChatMessage from './components/ChatMessage.vue';
import SettingsModal from './components/SettingsModal.vue';

const conversations = ref([]);
const currentConversation = ref(null);
const showSettings = ref(false);
const settings = ref({
  serverUrl: 'https://api.deepseek.com',
  apiToken: '',
  modelName: 'deepseek-chat',
});
const inputMessage = ref('');
const isLoading = ref(false);
const editingTitle = ref(null);

onMounted(() => {
  const savedConversations = localStorage.getItem('conversations');
  const savedSettings = localStorage.getItem('settings');
  if (savedConversations) {
    conversations.value = JSON.parse(savedConversations);
    currentConversation.value = conversations.value[0] || null;
  }
  if (savedSettings) settings.value = JSON.parse(savedSettings);
});

const saveToLocalStorage = () =>
  localStorage.setItem('conversations', JSON.stringify(conversations.value));

const createNewConversation = () => {
  const newConversation = { id: Date.now(), title: 'New Chat', messages: [] };
  conversations.value.unshift(newConversation);
  currentConversation.value = newConversation;
  saveToLocalStorage();
};

const deleteConversation = (conv) => {
  const index = conversations.value.indexOf(conv);
  conversations.value.splice(index, 1);
  currentConversation.value = conversations.value[0] || null;
  saveToLocalStorage();
};

const startEditing = (conv) => {
  editingTitle.value = conv.id;
};

const finishEditing = (conv, event) => {
  conv.title = event.target.value.trim() || 'New Chat';
  editingTitle.value = null;
  saveToLocalStorage();
};

const handleKeyDown = (conv, event) => {
  if (event.key === 'Enter') {
    finishEditing(conv, event);
  }
};

const saveSettings = (newSettings) => {
  settings.value = newSettings;
  localStorage.setItem('settings', JSON.stringify(newSettings));
};

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return;

  const messageContent = inputMessage.value;
  inputMessage.value = '';

  if (!currentConversation.value) createNewConversation();

  currentConversation.value.messages = [
    ...currentConversation.value.messages,
    { role: 'user', content: messageContent },
    { role: 'assistant', content: '' },
  ];

  isLoading.value = true;
  let buffer = '';

  try {
    const response = await fetch(
      `${settings.value.serverUrl}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.value.apiToken}`,
        },
        body: JSON.stringify({
          model: settings.value.modelName,
          messages: currentConversation.value.messages.slice(0, -1),
          stream: true,
        }),
      }
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (
          trimmedLine.startsWith('data: ') &&
          trimmedLine !== 'data: [DONE]'
        ) {
          try {
            const data = JSON.parse(trimmedLine.slice(6));
            if (data.choices?.[0]?.delta?.content) {
              const messages = [...currentConversation.value.messages];
              messages[messages.length - 1].content +=
                data.choices[0].delta.content;
              currentConversation.value.messages = messages;
              saveToLocalStorage();
            }
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
    const messages = [...currentConversation.value.messages];
    messages[messages.length - 1].content =
      'Sorry, there was an error processing your request.';
    currentConversation.value.messages = messages;
  }

  isLoading.value = false;
  saveToLocalStorage();
};
</script>

<template>
  <div class="flex h-screen bg-spotify-base text-white">
    <!-- Sidebar -->
    <div
      class="w-64 bg-spotify-base flex flex-col border-r border-spotify-elevated"
    >
      <!-- Project Title -->
      <div
        class="p-4 border-b border-spotify-elevated flex items-center justify-between"
      >
        <h1 class="text-xl font-bold">Deepseek Chat</h1>
        <div class="flex gap-2">
          <button
            @click="createNewConversation"
            class="p-2 hover:bg-spotify-elevated rounded-lg transition-colors"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto scrollbar-custom p-2">
        <div
          v-for="conv in conversations"
          :key="conv.id"
          @click="currentConversation = conv"
          class="group flex items-center p-3 rounded-lg hover:bg-spotify-elevated cursor-pointer mb-1"
          :class="{ 'bg-spotify-elevated': currentConversation === conv }"
        >
          <div class="flex-1 truncate">
            <input
              v-if="editingTitle === conv.id"
              type="text"
              :value="conv.title"
              @blur="finishEditing(conv, $event)"
              @keydown="handleKeyDown(conv, $event)"
              class="w-full bg-spotify-base rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-spotify-highlight"
              @click.stop
            />
            <span
              v-else
              class="text-spotify-text group-hover:text-white"
              :class="{ 'text-white': currentConversation === conv }"
              @dblclick.stop="startEditing(conv)"
            >
              {{ conv.title }}
            </span>
          </div>
          <button
            @click.stop="deleteConversation(conv)"
            class="opacity-0 group-hover:opacity-100 text-spotify-text hover:text-white transition-opacity"
          >
            🗑
          </button>
        </div>
      </div>

      <div class="p-3 border-t border-spotify-elevated">
        <button
          @click="showSettings = true"
          class="w-full btn btn-secondary flex items-center justify-center gap-2"
        >
          <span>⚙️</span> Settings
        </button>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col bg-spotify-base">
      <div class="flex-1 overflow-y-auto scrollbar-custom">
        <div v-if="currentConversation">
          <ChatMessage
            v-for="(message, index) in currentConversation.messages"
            :key="index"
            :message="message"
          />
        </div>
        <div
          v-else
          class="h-full flex items-center justify-center text-spotify-text"
        >
          Start a new conversation
        </div>
      </div>

      <div class="border-t border-spotify-elevated p-4">
        <div class="max-w-3xl mx-auto">
          <div class="relative">
            <textarea
              v-model="inputMessage"
              @keydown.enter.prevent="sendMessage"
              rows="1"
              class="w-full bg-spotify-elevated rounded-full py-3 px-4 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-spotify-highlight"
              placeholder="Type your message here..."
              :disabled="isLoading"
            ></textarea>
            <button
              @click="sendMessage"
              :disabled="isLoading"
              class="absolute right-2 bottom-2 p-2 rounded-full hover:bg-spotify-highlight/20 text-spotify-highlight disabled:opacity-50"
            >
              {{ isLoading ? '...' : '↵' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <SettingsModal
      :show="showSettings"
      :settings="settings"
      @close="showSettings = false"
      @save="saveSettings"
    />
  </div>
</template>
