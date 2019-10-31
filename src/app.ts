import "./styles/app.css";
import Vue from "vue";
import JSONView from "./JSONView.vue";
import { EventBus } from "./event-bus";
import { Download } from "./download";
import { Translation } from "./translation";
import Tree from "./tree";
import terminologyEN from "../json/terminology_EN.json";
import terminologyDE from "../json/terminology_DE.json";

interface Titleable {
  title: string;
}

let terminology = {
  source: terminologyEN as any,
  target: terminologyDE as any
} as any;

const app = new Vue({
  el: "#app",
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
  mounted() {},
  methods: {
    downloadTarget() {
      Download.json(
        terminology.target,
        "terminology_" + this.languageMap.target + ".json"
      );
    },
    downloadSource() {
      Download.json(
        terminology.source,
        "terminology_" + this.languageMap.source + ".json"
      );
    },
    domains(terminology: any) {
      let domains = terminology.problemClassificationScheme.domains;
      return domains;
    },
    problems(domain: any) {
      return (domain.problems as Titleable[]).sort(this.sortByTitle);
    },
    targets(terminology: any) {
      let targets = terminology.interventionScheme.targets as Titleable[];
      let other = targets.pop();
      targets = targets.sort(this.sortByTitle);

      if (other) {
        targets.push(other);
      }
      return targets;
    },
    sortByTitle(a: Titleable, b: Titleable): number {
      return a.title.localeCompare(b.title);
    }
  },
  computed: {
    terminology() {
      return terminology;
    },
    labels() {
      return {
        title: "Titel",
        description: "Beschreibung",
        signsAndSymptoms: "Symptom",
        "signsAndSymptoms[]": "Symptome",
        problems: "Problem",
        "problems[]": "Probleme",
        domains: "Bereich",
        "domains[]": "Bereiche",
        modifiers: "Merkmale",
        scope: "Merkmal Problembesitzer",
        "scope[]": "Merkmal Problembesitzer",
        severity: "Merkmal Dringlichkeit",
        "severity[]": "Merkmal Dringlichkeit",
        categories: "Kategorie",
        "categories[]": "Kategorien",
        targets: "Ziel",
        "targets[]": "Ziele",
        ratings: "Bewertung",
        "ratings[]": "Bewertungen",
        scale: "Skala",
        "scale[]": "Skala",
        problemClassificationScheme: "Pro­blem­klas­si­fi­ka­tions­sche­ma",
        interventionScheme: "In­ter­ven­tions­sche­ma",
        problemRatingScale: "Problem­bewertungs­skala für Ergebnisse",
        root: "Das Omaha-System"
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
});
