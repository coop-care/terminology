import './styles/app.css';
import Vue from "vue";
import JSONView from "./JSONView.vue";
import { EventBus } from "./event-bus";
import { Download } from "./download";
import { Translation } from "./translation";
import { Tree } from "./tree";
import terminologyEN from "../json/terminology_EN.json";
import terminologyDE from "../json/terminology_DE.json";

let terminology = {
  source: (terminologyEN as any),
  target: (terminologyDE as any)
} as any

const app = new Vue({
  el: '#app',
  data: {
    treePresentation: "flat",
    languageMap: {
      source: "EN",
      target: "DE"
    } as any
  },
  components: {
    "json-view": JSONView
  },
  mounted() {

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
      return terminology;
    },
    labels() {
      return {
        "title": "Titel",
        "description": "Beschreibung",
        "signsAndSymptoms": "Symptom",
        "problems": "Problem",
        "domains": "Bereich",
        "modifiers": "Merkmale",
        "scope": "Merkmal Problembesitzer",
        "severity": "Merkmal Dringlichkeit",
        "categories": "Kategorie",
        "targets": "Ziel",
        "ratings": "Bewertung",
        "scale": "Skala",
        "problemClassificationScheme": "Pro­blem­klas­si­fi­ka­tions­sche­ma",
        "interventionScheme": "In­ter­ven­tions­sche­ma",
        "problemRatingScale": "Problem­bewertungs­skala für Ergebnisse",
      };
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
