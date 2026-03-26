<template>
  <div class="h-full flex flex-col overflow-hidden bg-black rounded-md mt-1 ml-1" role="region" aria-label="Iframe browser">
    <div class="flex-1 bg-white">
      <iframe ref="frame" :src="currentSrc" class="w-full h-full border-0" @load="onLoad" title="iframe-browser-frame" />
    </div>

    <div class="h-8 flex items-center px-2 gap-2 bg-black border-t border-gray-800 select-none" style="-webkit-app-region: drag">
      <div class="flex-1 flex justify-center" style="-webkit-app-region: no-drag">
        <div class="relative flex items-center">
          <Icon class="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600 pointer-events-none" icon="ph:magnifying-glass-bold" />
          <input
            v-model="urlInput"
            class="w-76 bg-gray-900 text-gray-300 text-[10px] placeholder-gray-600 pl-6 pr-2 py-1 rounded border border-gray-800 focus:outline-none focus:border-blue-600 font-mono"
            :placeholder="defaultUrl"
            aria-label="Enter URL"
            @keydown.enter="navigate(urlInput)"
            @blur="urlInput = currentSrc"
            @focus="$event.target.select()"
          />
        </div>
      </div>

      <div class="flex items-center gap-0.5" style="-webkit-app-region: no-drag">
        <button @click="back" :disabled="!canBack" class="w-6 h-6 rounded flex items-center justify-center bg-transparent hover:bg-gray-900 disabled:opacity-30 disabled:cursor-not-allowed">
          <Icon class="w-3 h-3" icon="ph:caret-left-bold" />
        </button>
        <button @click="forward" :disabled="!canForward" class="w-6 h-6 rounded flex items-center justify-center bg-transparent hover:bg-gray-900 disabled:opacity-30 disabled:cursor-not-allowed">
          <Icon class="w-3 h-3" icon="ph:caret-right-bold" />
        </button>
        <button @click="reload" class="w-6 h-6 rounded flex items-center justify-center bg-transparent hover:bg-gray-900">
          <Icon class="w-3 h-3" icon="ph:arrow-clockwise-bold" />
        </button>
        <button @click="home" class="w-6 h-6 rounded flex items-center justify-center bg-transparent hover:bg-gray-900">
          <Icon class="w-3 h-3" icon="ph:house-bold" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { ref, reactive, computed, watch, defineProps, defineExpose } from 'vue'

const props = defineProps({
  defaultUrl: { type: String, default: 'https://example.com' }
})

const state = reactive({ history: [props.defaultUrl], index: 0 })
const frame = ref(null)
const urlInput = ref(props.defaultUrl)

const currentSrc = computed(() => state.history[state.index])
const canBack = computed(() => state.index > 0)
const canForward = computed(() => state.index < state.history.length - 1)

function normalizeUrl(input) {
  if (!input) return props.defaultUrl
  try {
    return new URL(input, window.location.href).toString()
  } catch {
    try {
      return new URL('https://' + input).toString()
    } catch {
      return props.defaultUrl
    }
  }
}

function navigate(url) {
  const u = normalizeUrl(url)
  if (u !== state.history[state.index]) {
    state.history.splice(state.index + 1)
    state.history.push(u)
    state.index = state.history.length - 1
  }
  urlInput.value = u
  const f = frame.value
  if (!f) return
  try {
    f.contentWindow.location.href = u
  } catch {
    f.src = u
  }
}

function back() {
  if (canBack.value) { state.index--; urlInput.value = state.history[state.index] }
}

function forward() {
  if (canForward.value) { state.index++; urlInput.value = state.history[state.index] }
}

function reload() {
  try { frame.value.contentWindow.location.reload() } catch { frame.value.src = currentSrc.value }
}

function home() { navigate(props.defaultUrl) }

function onLoad() {
  try {
    const real = frame.value.contentWindow.location.href
    urlInput.value = real
    if (real && real !== currentSrc.value) {
      state.history.splice(state.index + 1)
      state.history.push(real)
      state.index = state.history.length - 1
    }
  } catch {}
}

watch(currentSrc, (v) => {
  if (urlInput.value !== v) urlInput.value = v
})

defineExpose({ navigate, back, forward, reload, home, resetHistory: () => { state.history = [props.defaultUrl]; state.index = 0; urlInput.value = props.defaultUrl } })
</script>
