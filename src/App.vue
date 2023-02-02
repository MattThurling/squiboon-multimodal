<template>
  <div class="centralise" v-if="page==1">
    <div class="gofull">
      <SvgIcon
        v-if="!isFullscreen"
        class="pointy"
        :path="fullscreenPath"
        @click="goFullScreen()"
        type="mdi"
        size="64" />
    </div>
    <div class="title">
      <h1>Squiboon</h1>
    </div>
    <div class="recognition">
      <Recognition
      v-if="page==1"
      @clickMic=startRecognition()
      :micClass="micClass" />
    </div>
    <div class="help">
      <p>To generate a question, press the mic and say a topic</p>
    </div>
    <div class="voice-select">
      <p>Choose a voice</p>
      <select v-model="selectedVoice" id="voices" @change="setVoice">
        <option
          v-for="voice in voices"
          :key="voice.name"
          :value="voice.name">
          {{ voice.name }}
        </option>
      </select>
    </div>
  </div>
  <div class="centralise" v-if="page==2">
    <GridLoader  />
  </div>
  <div class="centralise" v-if="page==3">
    <JellyfishLoader  />
  </div>
  
  <div class="fullscreen-container" v-if="page==4">
    <div class="question">
      {{ this.question }}
      <SvgIcon
        class="pointy"
        @click=replay()
        type="mdi"
        :path="replayPath"
        :size="64" />
    </div>
    <div class="picture-box">
      <img class="picture" :src=image />
    </div>
  </div>

</template>


<script>
  import SvgIcon from '@jamescoyle/vue-icon'
  import { mdiFullscreen } from '@mdi/js'
  import { mdiReplay } from '@mdi/js'
  import Recognition from './components/Recognition.vue'
  import { GridLoader } from 'vue3-spinner'
  import { JellyfishLoader } from 'vue3-spinner'
  export default {
    components: {
      Recognition,
      GridLoader,
      JellyfishLoader,
      SvgIcon,
    },
    data() {
      return {
        fullscreenPath: mdiFullscreen,
        replayPath: mdiReplay,
        page: 1,
        selectedVoice: '',
        voices: [],
        request: '',
        recognition: null,
        recognising: false,
        interim_transcript: '',
        final_transcript: '',
        question: '',
        image: '',
      }
    },
    created() {
      window.speechSynthesis.onvoiceschanged = () => {
        this.voices = window.speechSynthesis.getVoices()
      }
    },
    mounted() {

      this.recognition = new webkitSpeechRecognition()
      this.recognition.onresult = e => {
        for (var i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            this.final_transcript += e.results[i][0].transcript;
          } else {
            this.interim_transcript += e.results[i][0].transcript;
          }
        }
        if (this.final_transcript !== '' && this.interim_transcript === '') {
          this.recognition.stop()
          this.recognising = false
          this.page = 2
          this.getCompletion(this.final_transcript)
          this.getImage(this.final_transcript)
        }
      }
    },
    methods: {
      replay() {
        this.page = 1
        this.question = ''
        this.image = ''
      },
      goFullScreen() {
        this.$fullscreen.request()
      },
      setVoice() {
        const phrase = "Welcome. My name is " + this.selectedVoice + " and this is what I sound like"
        this.speak(phrase)
      },
      startRecognition() { 
        if (!this.recognising) {
          this.final_transcript = ''
          this.response = ''
          this.recognising = true
          this.recognition.start()
        }
      },
      async getCompletion(input) {
        const response = await fetch(import.meta.env.VITE_COMPLETION_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ topic: input }),
        });

        const data = await response.json();
        if (response.status !== 200) {
          throw data.error || new Error(`Request failed with status ${response.status}`);
        }
        this.question = data.question
        this.page++
        if (this.page == 4) this.speak(this.question)
      },
      async getImage(input) {
        const response = await fetch(import.meta.env.VITE_DALLE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ topic: input }),
        });

        const data = await response.json();
        if (response.status !== 200) {
          throw data.error || new Error(`Request failed with status ${response.status}`);
        }
        this.page++
        if (this.page == 4) this.speak(this.question)
        this.image = data.image
      },
      speak(phrase) {
        let speech = new SpeechSynthesisUtterance()
        let selectedVoice = this.selectedVoice
        speech.voice = this.voices.filter(function(voice) { return voice.name == selectedVoice; })[0]
        speech.text = phrase
        window.speechSynthesis.speak(speech);
      }
    },
    computed: {
      micClass() {
        if (this.recognising) return 'live'
        return 'dead'
      },
      isFullscreen() {
        return document.fullscreenElement === this.$refs.app;
      },
    }
  }
</script>