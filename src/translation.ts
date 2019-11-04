import Tree from "./tree";
import $ from "jquery";

export module Translation {
  export function estimateTranslationCosts(
    source: any,
    sourceLang: string,
    targetLang: string,
    excludeKeys?: string[]
  ): string {
    let textCount = 0;
    let characterCount = 0;

    // count number of texts and characters to translate
    Tree.traverseObject(source, function(value, path) {
      if ((excludeKeys || []).includes(path[path.length - 1])) {
        return;
      }

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

    Tree.traverseObject(target, function(value, path) {
      Tree.deepAssign(target, path, "");
    });

    return target;
  }

  export function translate(
    source: any,
    target: any,
    sourceLang: string,
    targetLang: string,
    excludeKeys?: string[]
  ) {
    Tree.traverseObject(
      source,
      (function(target) {
        return function(value: string, path: string[]) {
          if ((excludeKeys || []).includes(path[path.length - 1])) {
            return;
          }

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
