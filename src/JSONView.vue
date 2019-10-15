<template>
  <div id="json-view">
    <json-view-item
      id="root-item"
      :source="data.source"
      :target="data.target"
      :dataKey="rootKey"
      :dataPath="rootKey"
      :maxDepth="maxDepth"
      :styles="customStyles"
      v-on:selected="itemSelected"
      :canSelect="hasSelectedListener"
    />
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import JSONViewItem from "./JSONViewItem.vue";

export default Vue.extend({
  name: "json-view",
  props: {
    data: {
      required: true,
      type: Object
    },
    rootKey: {
      type: String,
      required: false,
      default: "root"
    },
    maxDepth: {
      type: Number,
      required: false,
      default: 1
    },
    styles: {
      type: Object,
      required: false
    }
  },
  components: {
    "json-view-item": JSONViewItem
  },
  methods: {
    itemSelected: function(data: object): void {
      this.$emit("selected", data);
    }
  },
  computed: {
    customStyles: function(): object {
      const target = {
        key: "#002b36",
        valueKey: "#073642",
        string: "#268bd2",
        number: "#2aa198",
        boolean: "#cb4b16",
        null: "#6c71c4",
        arrowSize: "6px"
      };
      return Object.assign(target, this.styles);
    },
    hasSelectedListener(): boolean {
      return Boolean(this.$listeners && this.$listeners.selected);
    }
  }
});
</script>

<style lang="scss">
#json-view {
  width: 100%;
  height: auto;
}
#root-item {
  margin-left: 0;
}
</style>
