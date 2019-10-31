import Tree from "./tree";
import $ from "jquery";

export module Translation {
  export function estimateTranslationCosts(
    source: any,
    sourceLang: string,
    targetLang: string
  ): string {
    let textCount = 0;
    let characterCount = 0;

    // count number of texts and characters to translate
    traverseObject(source, function(value, path) {
      textCount += 1;
      characterCount += value.length;
    });

    return [
      textCount,
      "Texte,",
      characterCount,
      "Zeichen,",
      ((characterCount / 500) * 0.01).toFixed(2),
      "€ Kosten bei Deepl"
    ].join(" ");
  }

  export function emptyTranslationTargetAsCopyFromSource(source: any): any {
    let target = JSON.parse(JSON.stringify(source));

    traverseObject(target, function(value, path) {
      Tree.deepAssign(target, path, "");
    });

    return target;
  }

  function traverseObject(
    object: any,
    callback: (value: string, path: string[]) => void,
    path?: string[]
  ) {
    for (let key in object) {
      let currentPath = (path || []).concat([key]);
      let value = object[key];

      if (typeof value == "string") {
        callback(value, currentPath);
      } else if (typeof value == "object") {
        traverseObject(value, callback, currentPath);
      }
    }
  }

  export function translate(
    source: any,
    target: any,
    sourceLang: string,
    targetLang: string
  ) {
    traverseObject(
      source,
      (function(target) {
        return function(value: string, path: string[]) {
          let data = {
            auth_key: "APIKEY",
            text: value,
            source_lang: sourceLang,
            target_lang: targetLang,
            split_sentences: 0
          };
          translateWithDeepl(data)
            .done(function(translation) {
              Tree.deepAssign(target, path, translation);
            })
            .fail(function() {
              console.log("fail", arguments, path.join("."), value);
            });
        };
      })(target)
    );
  }

  interface DeeplData {
    auth_key: string;
    text: string;
    source_lang: string;
    target_lang: string;
    split_sentences: number;
  }

  function translateWithDeepl(data: DeeplData) {
    return $.post("https://api.deepl.com/v2/translate", data).then(function(
      data,
      status,
      response
    ) {
      if (!data || !data.translations || !data.translations.length) {
        return $.Deferred().reject(
          response,
          status,
          "missing translations: " + JSON.stringify(data)
        );
      } else {
        return $.Deferred().resolve(
          data.translations[0].text,
          status,
          response
        );
      }
    });
  }
}
