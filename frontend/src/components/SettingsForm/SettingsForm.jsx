import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import userUpdate from "../../services/userUpdate";
import FormFieldset from "../FormFieldset";

const LABEL_MAX = 50;

function SettingsForm() {
  const { headers, isAuth, loggedUser, setAuthState } = useAuth();
  const [{ bio, email, image, password, username }, setForm] = useState({
    bio: loggedUser.bio || "",
    email: loggedUser.email,
    image: loggedUser.image || "",
    password: loggedUser.password || "",
    username: loggedUser.username,
  });
  const [socialLinks, setSocialLinks] = useState(loggedUser.socialLinks || []);
  const [linkError, setLinkError] = useState("");

  const [inactive, setInactive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuth) navigate("/");
  }, [isAuth, loggedUser, navigate]);

  const inputHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setForm((form) => ({ ...form, [name]: value }));
    setInactive(false);
  };

  const linkHandler = (index, field) => (e) => {
    const value = e.target.value;

    setSocialLinks((links) =>
      links.map((link, i) => (i === index ? { ...link, [field]: value } : link)),
    );
    setLinkError("");
    setInactive(false);
  };

  const addLink = () => {
    setSocialLinks((links) => [...links, { label: "", url: "" }]);
    setLinkError("");
    setInactive(false);
  };

  const removeLink = (index) => {
    setSocialLinks((links) => links.filter((_, i) => i !== index));
    setLinkError("");
    setInactive(false);
  };

  const formSubmit = async (e) => {
    e.preventDefault();

    if (inactive) return;

    // Drop rows the user left entirely blank so an empty row never persists;
    // a profile with no links then renders exactly as before.
    const cleanedLinks = socialLinks.filter(
      (link) => link.label.trim() !== "" || link.url.trim() !== "",
    );

    // Each remaining link must have a URL and a label of at most LABEL_MAX
    // characters. Any violation blocks the whole save (nothing is sent).
    const invalid = cleanedLinks.some(
      (link) =>
        link.url.trim() === "" ||
        link.label.trim() === "" ||
        link.label.length > LABEL_MAX,
    );
    if (invalid) {
      setLinkError(
        `Each link needs a URL and a label of ${LABEL_MAX} characters or fewer.`,
      );
      return;
    }
    setLinkError("");

    userUpdate({
      headers,
      bio,
      email,
      image,
      password,
      socialLinks: cleanedLinks,
      username,
    })
      .then(setAuthState)
      .catch(console.error);
    setInactive(true);
  };

  return (
    isAuth && (
      <form onSubmit={formSubmit}>
        <fieldset>
          <FormFieldset
            placeholder="URL of profile picture"
            name="image"
            value={image}
            handler={inputHandler}
          ></FormFieldset>

          <FormFieldset
            placeholder="Your Name"
            name="username"
            required
            value={username}
            handler={inputHandler}
          ></FormFieldset>

          <fieldset className="form-group">
            <textarea
              className="form-control form-control-lg"
              rows="8"
              placeholder="Short bio about you"
              name="bio"
              value={bio}
              onChange={inputHandler}
            ></textarea>
          </fieldset>

          <FormFieldset
            placeholder="Email"
            name="email"
            required
            value={email}
            handler={inputHandler}
          ></FormFieldset>

          <FormFieldset
            type="password"
            name="password"
            value={password}
            placeholder="Password"
            handler={inputHandler}
          ></FormFieldset>

          <fieldset className="form-group">
            {linkError && (
              <ul className="error-messages">
                <li>{linkError}</li>
              </ul>
            )}
            {socialLinks.map((link, index) => (
              <div className="social-link-row" key={index}>
                <input
                  className="form-control"
                  placeholder="Label (e.g. GitHub)"
                  maxLength={LABEL_MAX}
                  value={link.label}
                  onChange={linkHandler(index, "label")}
                />
                <input
                  className="form-control"
                  placeholder="https://..."
                  value={link.url}
                  onChange={linkHandler(index, "url")}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => removeLink(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={addLink}
            >
              Add link
            </button>
          </fieldset>

          {!inactive && (
            <button
              type="submit"
              className="btn btn-lg btn-primary pull-xs-right"
            >
              Update Settings
            </button>
          )}
        </fieldset>
      </form>
    )
  );
}

export default SettingsForm;
