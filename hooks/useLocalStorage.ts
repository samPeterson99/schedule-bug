import { useState, useEffect } from "react";

const useLocalStorage = <T>(
  key: string,
  initialValue: T,
  expiration: number = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    const storedItem = window?.localStorage.getItem(key);
    const storedExpiration = window?.localStorage.getItem(`${key}_expiration`);

    if (storedItem && storedExpiration) {
      const parsedExpiration = parseInt(storedExpiration, 10);
      if (Date.now() < parsedExpiration) {
        setStoredValue(JSON.parse(storedItem));
      } else {
        window?.localStorage.removeItem(key);
        window?.localStorage.removeItem(`${key}_expiration`);
      }
    }
  }, [key]);

  const setValue = (value: T): void => {
    setStoredValue(value);
    window?.localStorage.setItem(key, JSON.stringify(value));
    window?.localStorage.setItem(
      `${key}_expiration`,
      (Date.now() + expiration).toString()
    );
  };

  return [storedValue, setValue];
};

export default useLocalStorage;
