import * as $ from "jquery";
import Vue from "vue";
import JSONView from "./JSONView.vue";
import { EventBus } from "./event-bus";

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
    translate() {
      _translate(terminology, this.languageMap.source, this.languageMap.target);
    },
    downloadTarget() {
      _downloadJson(terminology.target, 'terminology_' + this.languageMap.target + '.json');
    },
    downloadSource() {
      _downloadJson(terminology.source, 'terminology_' + this.languageMap.source + '.json');
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
  _deepAssign(terminology.target, path, data.value);
})


// Export as download helper

function _downloadJson(data: any, filename: string) {
  let json = JSON.stringify(data, null, 2);
  let jsonUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(json);
  let exportFileDefaultName = encodeURIComponent(filename);
  _download(exportFileDefaultName, jsonUri);
}

function _download(filename: string, dataUri: string) {
  let linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', filename);
  linkElement.click();
}


// Translation helper

function _traverseObject(object: any, callback: (value: string, path: string[]) => void, path?: string[]) {
  for (let key in object) {
    let currentPath = (path || []).concat([key]);
    let value = object[key];

    if (typeof value == "string") {
      callback(value, currentPath);
    } else if (typeof value == "object") {
      _traverseObject(value, callback, currentPath);
    }
  }
}

function _deepAssign(object: any, path: string[], value: any) {
  let parent = object;
  for (let i = 0, maxI = path.length, beforeMaxI = maxI - 1; i < maxI; i++) {
    if (i < beforeMaxI) {
      parent = parent[path[i]];
    } else {
      parent[path[i]] = value;
    }
  }
}

function _prepareTranslation(terminology: any, sourceLang: string, targetLang: string) {
  terminology[targetLang] = JSON.parse(JSON.stringify(terminology[sourceLang]));

  let textCount = 0;
  let characterCount = 0;

  // empty all texts in translation target
  _traverseObject(terminology[targetLang], function(value, path) {
    _deepAssign(terminology[targetLang], path, "");
  });

  // count number of texts and characters to translate
  _traverseObject(terminology[sourceLang], function(value, path) {
    textCount += 1;
    characterCount += value.length;
  });

  console.log([textCount, "Texte,", characterCount, "Zeichen,", 
    ((characterCount / 500) * 0.01).toFixed(2), "€ Kosten bei Deepl"].join(" "));
}

function _translate(terminology: any, sourceLang: string, targetLang: string) {
  _traverseObject(terminology[sourceLang], function(target) {
    return function(value: string, path: string[]) {
      let data = {
        "auth_key": "APIKEY", 
        "text": value, 
        "source_lang": sourceLang, 
        "target_lang": targetLang,
        "split_sentences": 0
      };
      _translateWithDeepl(data)
        .done(function(translation) {
          _deepAssign(terminology[targetLang], path, translation);
        })
        .fail(function() {
          console.log("fail", arguments, path.join("."), value);
        });
    }
  }(terminology[targetLang]));
}

interface DeeplData {
  auth_key: string,
  text: string,
  source_lang: string,
  target_lang: string,
  split_sentences: number
}

function _translateWithDeepl(data: DeeplData) {
  return $.post("https://api.deepl.com/v2/translate", data)
    .then(function(data, status, response) {
      if (!data || !data.translations || !data.translations.length) {
        return $.Deferred().reject(response, status, "missing translations: " + JSON.stringify(data));
      } else {
        return $.Deferred().resolve(data.translations[0].text, status, response);
      }
    });
}
