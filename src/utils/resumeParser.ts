interface ResumeInfo {
  name: string;
  branch: string;
  college: string;
  keyword: string;
  location: string;
}

/**
 * Parses CSV string into array of arrays
 */
export const parseCSV = (csvString: string): string[][] => {
  if (!csvString || csvString.trim() === "") return [];
  const lines = csvString.split(/\r?\n/).filter(line => line.trim() !== "");
  return lines.map(line => 
    line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
    .map(cell => cell.replace(/^"(.*)"$/, "$1"))
  );
};

/**
 * Extracts resume information from API response text
 */
export const extractResumeInfo = (infoText: string): ResumeInfo => {
  // Split text into lines that start with a number and a period
  const lines = infoText.split("\n").filter(line => /^\d+\.\s*/.test(line));
  
  // Helper function to remove the leading number and period
  const cleanLine = (line: string): string => {
    let text = line.replace(/^\d+\.\s*/, '').trim();
    if (text.includes(":")) {
      const parts = text.split(":");
      return parts.slice(1).join(":").trim();
    }
    return text;
  };

  // Additional cleaning for branch: remove any text within parentheses
  const cleanBranch = (branchText: string): string => 
    branchText.replace(/\(.*?\)/g, '').trim();

  // Cleaning for location: if the location contains a comma, only take the first part
  const cleanLocation = (locationText: string): string => {
    const cleaned = locationText.trim();
    if (cleaned.includes(',')) {
      return cleaned.split(',')[0].trim();
    }
    return cleaned;
  };

  // Extract and clean each field
  return {
    name: cleanLine(lines[0] || '') || 'N/A',
    branch: cleanBranch(cleanLine(lines[1] || '')) || 'CSE',
    college: cleanLine(lines[2] || '') || 'N/A',
    keyword: cleanLine(lines[3] || '') || 'Python',
    location: cleanLocation(cleanLine(lines[4] || '')) || 'India',
  };
};

/**
 * Logs debug messages with timestamp
 */
export const logMessage = (message: string): void => {
  const debugLog = document.getElementById('debug-log');
  if (debugLog) {
    const logEntry = document.createElement('div');
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    debugLog.appendChild(logEntry);
    debugLog.scrollTop = debugLog.scrollHeight;
  }
  console.log(message);
};