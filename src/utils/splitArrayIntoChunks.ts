export default function splitArrayIntoChunks<T>(arr: T[], chunkSize = 500): T[][] {
  chunkSize = Math.max(1, Math.floor(chunkSize));
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  return chunks;
}
