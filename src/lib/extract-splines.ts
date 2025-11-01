export default function extractSplines(svg: string): string[] {
  // Extract path elements from SVG
  const pathRegex = /<path[^>]*d="([^"]*)"[^>]*>/g;
  const paths: string[] = [];
  let match;

  while ((match = pathRegex.exec(svg)) !== null) {
    paths.push(match[1]);
  }

  return paths;
}
