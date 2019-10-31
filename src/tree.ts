export default {
  deepAssign: function(object: any, path: string[], value: any) {
    let parent = object;
    for (let i = 0, maxI = path.length, beforeMaxI = maxI - 1; i < maxI; i++) {
      if (i < beforeMaxI) {
        parent = parent[path[i]];
      } else {
        parent[path[i]] = value;
      }
    }
  },

  find: function(object: any, key: string, value: any): any {
    for (let someKey in object) {
      let someValue = object[someKey];
      if (someKey == key && someValue == value) {
        return object;
      } else if (someValue instanceof Object) {
        let result = this.find(someValue, key, value);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }
};
