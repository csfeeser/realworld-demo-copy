const { UnauthorizedError } = require("../helper/customErrors");
const { bcryptHash } = require("../helper/bcrypt");

const SOCIAL_LINK_FIELDS = new Set(["website", "github", "twitter", "instagram"]);

function isSafeUrl(value) {
  if (!value) return true; // empty string clears the field — allowed
  try {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

//* Current User
const currentUser = async (req, res, next) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new UnauthorizedError();

    loggedUser.dataValues.email = req.headers.email;
    delete req.headers.email;

    res.json({ user: loggedUser });
  } catch (error) {
    next(error);
  }
};

//* Update User
const updateUser = async (req, res, next) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new UnauthorizedError();

    const {
      user: { password },
      user,
    } = req.body;

    for (const [key, value] of Object.entries(user)) {
      if (value === undefined || key === "password") continue;
      if (SOCIAL_LINK_FIELDS.has(key) && !isSafeUrl(value)) {
        return res.status(422).json({ errors: { body: [`${key} must be an http or https URL`] } });
      }
      loggedUser[key] = value;
    }

    if (password !== undefined || password !== "") {
      loggedUser.password = await bcryptHash(password);
    }

    await loggedUser.save();

    res.json({ user: loggedUser });
  } catch (error) {
    next(error);
  }
};

module.exports = { currentUser, updateUser };
