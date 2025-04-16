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


export const setWithExpiry = (key, value, ttl) => {
  const now = new Date();

  // ttl = time to live in milliseconds
  const item = {
    value,
    expiry: now.getTime() + ttl,
  };
  
  localStorage.setItem(key, JSON.stringify(item));
}


export const  getWithExpiry = (key) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) {
    return null;
  }

  const item = JSON.parse(itemStr);
  const now = new Date();

  if (now.getTime() > item.expiry) {
    // If expired, remove item and return null
    localStorage.removeItem(key);
    return null;
  }

  return item.value;
}
