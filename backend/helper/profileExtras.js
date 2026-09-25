const { sequelize } = require("../models");

// Total favorites received across all of an author's articles.
// Aggregate COUNT over the Favorites join (Postgres). `Favorites` and
// `Articles` are Sequelize's auto-pluralized table names; keep the double
// quotes so identifiers are case-preserved on Postgres.
const countFavoritesReceived = async (authorId) => {
  const row = await sequelize.query(
    `SELECT COUNT(*)::int AS count
       FROM "Favorites" f
       JOIN "Articles" a ON a."id" = f."articleId"
      WHERE a."userId" = :authorId`,
    {
      replacements: { authorId },
      type: sequelize.QueryTypes.SELECT,
      plain: true,
    },
  );
  return row ? row.count : 0;
};

// Enricher: author stats + member-since. Mutates profile.dataValues.
// NOTE: uses `memberSince`, NOT `createdAt` (which User.toJSON() nulls out).
const appendAuthorStats = async (profile) => {
  profile.dataValues.articlesCount = await profile.countArticles();
  profile.dataValues.favoritesReceived = await countFavoritesReceived(
    profile.id,
  );
  profile.dataValues.memberSince = profile.createdAt;
};

// Ordered list of profile enrichers. Each receives (profile, ctx) and adds
// fields to profile.dataValues beyond User.toJSON(). Issue #17 appends its
// social-links enricher to this list.
const profileEnrichers = [appendAuthorStats];

const appendProfileExtras = async (profile, ctx) => {
  for (const enrich of profileEnrichers) await enrich(profile, ctx);
};

module.exports = {
  countFavoritesReceived,
  appendAuthorStats,
  profileEnrichers,
  appendProfileExtras,
};
