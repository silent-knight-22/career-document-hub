// Helper to calculate total localStorage usage in MB
export const getLocalStorageUsage = () => {
  let totalBytes = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    // Rough character count to byte conversion (2 bytes per char in UTF-16)
    totalBytes += (key.length + value.length) * 2;
  }
  const usedMb = totalBytes / (1024 * 1024);
  const limitMb = 5.0;
  const percent = Math.min((usedMb / limitMb) * 100, 100);
  return {
    usedMb: parseFloat(usedMb.toFixed(2)),
    limitMb,
    percent: parseFloat(percent.toFixed(1))
  };
};
