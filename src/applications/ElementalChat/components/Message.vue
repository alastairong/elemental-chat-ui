<template>
  <v-card v-if="internalMode === 'display'" dark outlined class="pa-1 mb-1">
    <v-card-text class="pl-0">
      {{ content }}
    </v-card-text>
  </v-card>
  <v-textarea
    v-else
    class="ml-0 mr-0"
    v-model="content"
    label="Send a message"
    dense
    dark
    outlined
    hide-details
    full-width
    rows="3"
    @keydown.enter="createMessage"
    append-icon="mdi-send"
    @click:append="createMessage"
  />
</template>
<script>
import { v4 as uuidv4 } from "uuid";
export default {
  name: "Message",
  components: {},
  props: ["message", "mode"],
  data() {
    return {
      internalMode: "",
      uuid: "",
      content: ""
    };
  },
  methods: {
    createMessage() {
      const message = {
        uuid: uuidv4(),
        content: this.content
      };
      this.$emit("message-created", message);
      this.content = "";
    }
  },
  created() {
    if (this.message) {
      this.internalMode = this.mode;
      this.content = this.message.message.content;
      this.uuid = this.message.message.uuid;
    }
  }
};
</script>
