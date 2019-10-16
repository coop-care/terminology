<template>
  <div class="json-view-item">
    <!-- Handle Objects and Arrays-->
    <div v-if="typeof source === 'object' && source !== null">
      <div @click.stop="toggleOpen" class="data-key" :style="keyColor">
        <div :class="classes" :style="arrowStyles"></div>
        {{ readableKey }}:
        <span class="properties">&nbsp;{{ lengthString }}</span>
      </div>
      <json-view-item
        v-on:selected="bubbleSelected"
        v-for="childKey in Object.keys(source)"
        :dataKey="childKey"
        :dataPath="dataPath + '.' + childKey"
        :dataDepth="dataDepth + 1"
        :key="getKey(childKey)"
        :source="source[childKey]"
        :target="target[childKey]"
        v-show="open"
        :maxDepth="maxDepth"
        :styles="styles"
        :canSelect="canSelect"
      />
    </div>
    <!-- Handle Leaf Values -->
    <div
      :class="valueClasses"
      v-on:click="clickEvent(source)"
      v-if="typeof source !== 'object'"
    >
      <div class="flex">
        <div class="translation-key" :style="valueKeyColor" :title="dataPath">{{ readableKey }}:</div>
        <div class="translation flex one">
          <div><div :style="getValueStyle('')" class="source" v-text="source"></div></div>
          <div><div contenteditable="true" :style="getValueStyle(0)" class="target" v-text="target" @input="onInputValue"></div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import { EventBus } from "./event-bus";

export interface TreeItem {
    key: string;
    value: string;
    path: string;
}

export default Vue.extend({
  name: "json-view-item",
  data: function() {
    return {
      open: this.dataDepth < this.maxDepth
    };
  },
  props: {
    source: {
      required: true,
      type: [Object, Array, String]
    },
    target: {
      required: true,
      type: [Object, Array, String]
    },
    dataKey: {
      required: true,
      type: String
    },
    dataPath: {
      type: String,
      required: true
    },
    dataDepth: {
      type: Number,
      required: false,
      default: 0
    },
    maxDepth: {
      type: Number,
      required: false,
      default: 1
    },
    styles: {
      type: Object,
      required: true
    },
    canSelect: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  methods: {
    toggleOpen: function(): void {
      this.open = !this.open;
    },
    onInputValue: function(evt: Event): void {
      let target = evt.target as HTMLElement
      EventBus.$emit("inputTargetValue", {
        key: this.dataKey,
        value: target.innerText,
        path: this.dataPath
      } as TreeItem);
    },
    clickEvent: function(value: string): void {
      this.$emit("selected", {
        key: this.dataKey,
        value: value,
        path: this.dataPath
      } as TreeItem);
    },
    bubbleSelected: function(value: string): void {
      this.$emit("selected", value);
    },
    getKey: function(value: any): string {
      if (!isNaN(value)) {
        return value + ":";
      } else {
        return '"' + value + '":';
      }
    },
    getValueStyle: function(value: any): object {
      const type = typeof value;
      switch (type) {
        case "string":
          return { color: this.styles.string };
        case "number":
          return { color: this.styles.number };
        case "boolean":
          return { color: this.styles.boolean };
        case "object":
          return { color: this.styles.null };
        default:
          return { color: this.styles.valueKeyColor };
      }
    }
  },
  computed: {
    classes: function(): object {
      return {
        "chevron-arrow": true,
        opened: this.open
      };
    },
    valueClasses: function(): object {
      return {
        "value-key": true,
        "can-select": this.canSelect
      };
    },
    arrowStyles: function(): object {
      return { width: this.styles.arrowSize, height: this.styles.arrowSize };
    },
    lengthString: function(): string {
      let length = Object.keys(this.source).length
      if (Array.isArray(this.source)) {
        return length === 1
          ? length + " element"
          : length + " elements";
      }
      return length === 1
        ? length + " property"
        : length + " properties";
    },
    keyColor: function(): object {
      return { color: this.styles.key };
    },
    valueKeyColor: function(): object {
      return { color: this.styles.valueKey };
    },
    readableKey: function(): string {
      let key = this.dataKey.replace(/([a-z])([A-Z])/g, '$1 $2');
      return key.charAt(0).toUpperCase() + key.slice(1);
    }
  }
});
</script>

<style lang="scss" scoped>
.json-view-item {
  margin-left: 20px;
}

.value-key {
  font-weight: 600;
  margin-left: 10px;
  border-radius: 2px;
  padding: 5px 5px 5px 10px;

  &.can-select {
    cursor: pointer;
    &:hover {
      background-color: rgba(0, 0, 0, 0.08);
    }
  }
}

.data-key {
  display: flex;
  align-items: center;
  border-radius: 2px;
  font-weight: 600;
  cursor: pointer;
  padding: 5px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }

  .properties {
    font-weight: 300;
    opacity: 0.6;
    user-select: none;
  }
}

.chevron-arrow {
  flex-shrink: 0;
  border-right: 4px solid #444;
  border-bottom: 4px solid #444;
  width: 6px;
  height: 6px;
  margin-right: 20px;
  margin-left: 5px;
  transform: rotate(-45deg);
  box-sizing:initial;

  &.opened {
    margin-top: -3px;
    transform: rotate(45deg);
  }
}
</style>
