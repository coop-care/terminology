const app = new Vue({
  el: '#app',
  data: {
    terminology: {
    }
  },
  mounted() {
    $.getJSON('/json/terminology_EN.json?i=' + Math.random(), json => {
      console.log(json);
      this.terminology.EN = json;
      _prepareTranslation(this.terminology, "EN", "DE");
    });
  },
  methods: {
    translate() {
      _translate(this.terminology, "EN", "DE");
    },
    downloadJSON_DE() {
      _downloadTerminology(this.terminology, "DE");
    },
    downloadJSON_EN() {
      _downloadTerminology(this.terminology, "EN");
    }
  },
  computed: {
  }
});


// Export as download helper

function _downloadTerminology(terminology, language) {
  let data = JSON.stringify(terminology[language], null, 2);
  let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(data);
  let exportFileDefaultName = encodeURIComponent('terminology_' + language + '.json');
  _download(exportFileDefaultName, dataUri);
}

function _download(filename, dataUri) {
  let linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', filename);
  linkElement.click();
}


// Translation helper

function _traverseObject(object, callback, path) {
  for (var key in object) {
    var currentPath = (path || []).concat([key]);
    var value = object[key];

    if (typeof value == "string") {
      callback(value, currentPath);
    } else if (typeof value == "object") {
      _traverseObject(value, callback, currentPath);
    }
  }
}

function _deepAssign(object, path, value) {
  var parent = object;
  for (var i = 0, maxI = path.length, beforeMaxI = maxI - 1; i < maxI; i++) {
    if (i < beforeMaxI) {
      parent = parent[path[i]];
    } else {
      parent[path[i]] = value;
    }
  }
}

function _prepareTranslation(terminology, sourceLang, targetLang) {
  terminology[targetLang] = JSON.parse(JSON.stringify(terminology[sourceLang]));

  var textCount = 0;
  var characterCount = 0;

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

function _translate(terminology, sourceLang, targetLang) {
  _traverseObject(terminology[sourceLang], function(target) {
    return function(value, path) {
      var data = {
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

function _translateWithDeepl(data) {
  return $.post("https://api.deepl.com/v2/translate", data)
    .then(function(data, status, response) {
      if (!data || !data.translations || !data.translations.length) {
        return $.Deferred().reject(response, status, "missing translations: " + JSON.stringify(data));
      } else {
        return $.Deferred().resolve(data.translations[0].text, status, response);
      }
    });
}
