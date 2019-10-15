export module Tree {
  
  export function deepAssign(object: any, path: string[], value: any) {
    let parent = object;
    for (let i = 0, maxI = path.length, beforeMaxI = maxI - 1; i < maxI; i++) {
      if (i < beforeMaxI) {
        parent = parent[path[i]];
      } else {
        parent[path[i]] = value;
      }
    }
  }
  
}