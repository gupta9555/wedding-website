// Parses page/limit query params into safe numbers and returns the values
// needed for Mongoose's .skip()/.limit(), plus a reusable meta builder.

const parsePagination = (query, defaultLimit = 10, maxLimit = 50) => {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  pages: Math.max(Math.ceil(total / limit), 1),
  limit,
});

module.exports = { parsePagination, buildPaginationMeta };
