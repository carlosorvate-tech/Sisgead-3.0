export const sanitizeString = (input: string): string => {
    const temp = document.createElement('div');
    temp.textContent = input;
    return temp.innerHTML;
};

export const sanitizeName = (input: string): string => {
    // Allows letters, spaces, hyphens, and apostrophes, common in names.
    return input.replace(/[^a-zA-Z\s'-]/g, '');
};

export const sanitizeTags = (tags: string[]): string[] => {
    return tags.map(tag => sanitizeString(tag.trim())).filter(tag => tag.length > 0);
};
// bycao (ogrorvatigão) 2025