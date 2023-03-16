export const calculateHash = (
  input: Record<string, unknown> | string | number
) => {
  let hashString: string;
  if (input === null || input === undefined) {
    hashString = "null";
  } else if (typeof input === "object") {
    const hashArray = [];
    for (const [key, value] of Object.entries(input).sort()) {
      hashArray.push(`${key}:${value}`);
    }
    hashString = hashArray.join(",");
  } else {
    hashString = input.toString();
  }
  let hash = 0;
  for (let i = 0; i < hashString.length; i++) {
    const char = hashString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString();
};
