import './styles/app.css';
import * as $ from "jquery";
import Vue from "vue";
import JSONView from "./JSONView.vue";
import { EventBus } from "./event-bus";
import { Download } from "./download";
import { Translation } from "./translation";
import { Tree } from "./tree";

let terminology = {
  source: {},
  target: {}
} as any

const app = new Vue({
  el: '#app',
  data: {
    languageMap: {
      source: "EN",
      target: "DE"
    } as any,
    loadedTerminologies: 0,
  },
  components: {
    "json-view": JSONView
  },
  mounted() {
    Object.keys(this.languageMap).forEach(destination => {
      let language = this.languageMap[destination];
      $.getJSON('/json/terminology_' + language + '.json?i=' + Math.random(), json => {
        terminology[destination] = json;
        this.loadedTerminologies += 1;
      });
    });
  },
  methods: {
    downloadTarget() {
      Download.json(terminology.target, 'terminology_' + this.languageMap.target + '.json');
    },
    downloadSource() {
      Download.json(terminology.source, 'terminology_' + this.languageMap.source + '.json');
    },
  },
  computed: {
    terminology() {
      if (this.loadedTerminologies >= Object.keys(this.languageMap).length) {
        return terminology;
      }
    }
  }
});

interface TreeItem {
  key: string;
  value: string;
  path: string;
}

EventBus.$on("inputTargetValue", (data: TreeItem) => {
  let path = data.path.split(".").slice(1);
  Tree.deepAssign(terminology.target, path, data.value);
})
