export const toWordUpperCase = (text) => {
  if (!text) {
    return text;
  }
  if (Number(text)) {
    return text;
  }

  if (text.length < 2) {
    return text.toUpperCase();
  }
  return text[0].toUpperCase() + text.slice(1);
};
