// Converts a title into a URL-friendly slug, e.g.
// "5 Tips for Choosing Your Wedding Photographer!" -> "5-tips-for-choosing-your-wedding-photographer"
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // strip anything that isn't a word char, space, or hyphen
    .replace(/[\s_]+/g, '-') // collapse spaces/underscores into a single hyphen
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-|-$/g, ''); // trim leading/trailing hyphens
};

module.exports = slugify;
