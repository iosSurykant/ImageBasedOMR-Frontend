// function base64ToFile(base64Url, filename) {
//   const [header, base64Data] = base64Url.split(",");
//   const mime = header.match(/:(.*?);/)[1];

//   const binaryString = window.atob(base64Data);

//   const len = binaryString.length;
//   const bytes = new Uint8Array(len);

//   for (let i = 0; i < len; i++) {
//     bytes[i] = binaryString.charCodeAt(i);
//   }

//   const blob = new Blob([bytes], { type: mime });

//   return new File([blob], filename, { type: mime });
// }

// export default base64ToFile;
