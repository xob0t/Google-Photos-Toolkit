export default function splitArrayIntoChunks(arr, chunkSize = 500) {
  chunkSize = parseInt(chunkSize);
  const chunks = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  return chunks;
}