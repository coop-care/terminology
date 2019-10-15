export module Download {

  export function json(data: any, filename: string) {
    let json = JSON.stringify(data, null, 2);
    let jsonUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(json);
    let exportFileDefaultName = encodeURIComponent(filename);
    generic(exportFileDefaultName, jsonUri);
  }
      
  export function generic(filename: string, dataUri: string) {
    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', filename);
    linkElement.click();
  }

}