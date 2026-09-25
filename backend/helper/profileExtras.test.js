const { makeInstance, mockRequire } = require("../test-utils/fakeModels");

const sequelize = {
  query: vi.fn(),
  QueryTypes: { SELECT: "SELECT" },
};
mockRequire(require.resolve("../models"), { sequelize });

const {
  appendAuthorStats,
  countFavoritesReceived,
} = require("./profileExtras");

beforeEach(() => {
  sequelize.query.mockReset();
});

describe("countFavoritesReceived", () => {
  test("passes the author id to the aggregate query and returns its count", async () => {
    sequelize.query.mockResolvedValue({ count: 12 });

    const result = await countFavoritesReceived(7);

    expect(result).toBe(12);
    const [, options] = sequelize.query.mock.calls[0];
    expect(options.replacements).toEqual({ authorId: 7 });
  });

  test("returns 0 when the query yields no row", async () => {
    sequelize.query.mockResolvedValue(null);

    expect(await countFavoritesReceived(7)).toBe(0);
  });
});

describe("appendAuthorStats", () => {
  test("appends articlesCount, favoritesReceived, and memberSince to dataValues", async () => {
    sequelize.query.mockResolvedValue({ count: 12 });
    const profile = makeInstance(
      { id: 7, createdAt: "2020-01-02T00:00:00.000Z" },
      { countArticles: vi.fn().mockResolvedValue(4) },
    );

    await appendAuthorStats(profile);

    expect(profile.dataValues.articlesCount).toBe(4);
    expect(profile.dataValues.favoritesReceived).toBe(12);
    expect(profile.dataValues.memberSince).toBe("2020-01-02T00:00:00.000Z");
  });
});
