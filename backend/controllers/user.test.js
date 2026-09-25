const { UnauthorizedError } = require("../helper/customErrors");
const { bcryptCompare } = require("../helper/bcrypt");
const { makeInstance, makeRes } = require("../test-utils/fakeModels");
const { currentUser, updateUser } = require("./user");

describe("currentUser", () => {
  // AC-015 / AC-058: no resolved user -> authentication-required error.
  // (errorHandler.test.js separately confirms UnauthorizedError -> 401.)
  test("no loggedUser -> UnauthorizedError passed to next", async () => {
    const next = vi.fn();

    await currentUser({ loggedUser: undefined, headers: {} }, makeRes(), next);

    expect(next.mock.calls[0][0]).toBeInstanceOf(UnauthorizedError);
  });

  // AC-016: the returned email comes from the session token, not the
  // stored account row (which the fake here deliberately differs from).
  test("returns the email carried on the token, not the stored row's email", async () => {
    const loggedUser = makeInstance({ id: 1, username: "jane", email: "stale@db.com" });
    const req = { loggedUser, headers: { email: "fresh@token.com" } };
    const res = makeRes();

    await currentUser(req, res, vi.fn());

    expect(res.json).toHaveBeenCalledWith({ user: loggedUser });
    expect(loggedUser.dataValues.email).toBe("fresh@token.com");
  });
});

describe("updateUser", () => {
  test("no loggedUser -> UnauthorizedError passed to next", async () => {
    const next = vi.fn();

    await updateUser({ loggedUser: undefined, body: { user: {} } }, makeRes(), next);

    expect(next.mock.calls[0][0]).toBeInstanceOf(UnauthorizedError);
  });

  // AC-017: each submitted field is applied, except a field submitted as
  // `undefined`, which is left unchanged.
  test("undefined fields are left unchanged; provided fields are applied", async () => {
    const loggedUser = makeInstance(
      { username: "old", email: "old@x.com", bio: "old bio", image: "old.png", password: "hash" },
      { save: vi.fn().mockResolvedValue() },
    );
    const req = {
      loggedUser,
      body: { user: { username: "new", bio: "new bio", email: undefined, image: undefined, password: "" } },
    };

    await updateUser(req, makeRes(), vi.fn());

    expect(loggedUser.username).toBe("new");
    expect(loggedUser.bio).toBe("new bio");
    expect(loggedUser.email).toBe("old@x.com");
    expect(loggedUser.image).toBe("old.png");
    expect(loggedUser.save).toHaveBeenCalled();
  });

  // AC-080: a social link URL submitted -> stored on the user.
  test("social link URL submitted -> stored on the user", async () => {
    const loggedUser = makeInstance(
      { username: "jane", website: null, github: null },
      { save: vi.fn().mockResolvedValue() },
    );
    const req = {
      loggedUser,
      body: { user: { username: "jane", password: "", website: "https://jane.dev", github: "https://github.com/jane" } },
    };

    await updateUser(req, makeRes(), vi.fn());

    expect(loggedUser.website).toBe("https://jane.dev");
    expect(loggedUser.github).toBe("https://github.com/jane");
    expect(loggedUser.save).toHaveBeenCalled();
  });

  // AC-081: a previously-set link submitted as "" -> cleared.
  test("social link submitted as blank string -> cleared", async () => {
    const loggedUser = makeInstance(
      { username: "jane", website: "https://jane.dev", instagram: "https://instagram.com/jane" },
      { save: vi.fn().mockResolvedValue() },
    );
    const req = {
      loggedUser,
      body: { user: { username: "jane", password: "", website: "", instagram: "" } },
    };

    await updateUser(req, makeRes(), vi.fn());

    expect(loggedUser.website).toBe("");
    expect(loggedUser.instagram).toBe("");
    expect(loggedUser.save).toHaveBeenCalled();
  });

  // AC-086: a social link with a non-http(s) scheme is rejected with 422.
  test("social link with non-http(s) URL returns 422 and does not save", async () => {
    const loggedUser = makeInstance(
      { username: "jane", website: null },
      { save: vi.fn().mockResolvedValue() },
    );
    const res = makeRes();
    const req = {
      loggedUser,
      body: { user: { username: "jane", password: "", website: "javascript:alert(1)" } },
    };

    await updateUser(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(422);
    expect(loggedUser.save).not.toHaveBeenCalled();
  });

  // AC-087: empty string for a social link is accepted (clears the field).
  test("empty string social link is accepted and not rejected by protocol check", async () => {
    const loggedUser = makeInstance(
      { username: "jane", website: "https://jane.dev" },
      { save: vi.fn().mockResolvedValue() },
    );
    const req = {
      loggedUser,
      body: { user: { username: "jane", password: "", website: "" } },
    };

    await updateUser(req, makeRes(), vi.fn());

    expect(loggedUser.website).toBe("");
    expect(loggedUser.save).toHaveBeenCalled();
  });

  // AC-018: there is no submitted password value that leaves the stored
  // hash unchanged - even an empty string is hashed and saved.
  test("password field is always re-hashed and saved, even as an empty string", async () => {
    const loggedUser = makeInstance(
      { username: "jane", password: "original-hash" },
      { save: vi.fn().mockResolvedValue() },
    );
    const req = { loggedUser, body: { user: { username: "jane", password: "" } } };

    await updateUser(req, makeRes(), vi.fn());

    expect(loggedUser.password).not.toBe("original-hash");
    await expect(bcryptCompare("", loggedUser.password)).resolves.toBe(true);
  });
});
