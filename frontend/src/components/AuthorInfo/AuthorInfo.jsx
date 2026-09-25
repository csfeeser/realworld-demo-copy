import Markdown from "markdown-to-jsx";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import getProfile from "../../services/getProfile";
import Avatar from "../Avatar";
import FollowButton from "../FollowButton";

function safeUrl(url) {
  try {
    const { protocol } = new URL(url);
    return protocol === "https:" || protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

function urlUsername(url) {
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || url;
  } catch {
    return url;
  }
}

function AuthorInfo() {
  const { state } = useLocation();
  const [{ bio, followersCount, following, image, website, github, twitter, instagram }, setAuthor] = useState(
    state || {}
  );
  const { headers, loggedUser } = useAuth();
  const { username } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    getProfile({ headers, username })
      .then(setAuthor)
      .catch((error) => {
        console.error(error);
        navigate("/not-found", { replace: true });
      });
  }, [username, headers, state, navigate]);

  const followHandler = ({ followersCount, following }) => {
    setAuthor((prev) => ({ ...prev, followersCount, following }));
  };

  return (
    <div className="col-xs-12 col-md-10 offset-md-1">
      <Avatar alt={username} className="user-img" src={image} />
      <h4>{username}</h4>

      {bio && <Markdown options={{ forceBlock: true }}>{bio}</Markdown>}

      {(website || github || twitter || instagram) && (
        <div className="social-links">
          {safeUrl(website) && (
            <a className="social-link" href={safeUrl(website)} target="_blank" rel="noreferrer">
              <img src="/icons/globe.svg" alt="" className="social-icon" />
              {website}
            </a>
          )}
          {safeUrl(github) && (
            <a className="social-link" href={safeUrl(github)} target="_blank" rel="noreferrer">
              <img src="/icons/github.svg" alt="" className="social-icon" />
              {urlUsername(github)}
            </a>
          )}
          {safeUrl(twitter) && (
            <a className="social-link" href={safeUrl(twitter)} target="_blank" rel="noreferrer">
              <img src="/icons/x.svg" alt="" className="social-icon" />
              {urlUsername(twitter)}
            </a>
          )}
          {safeUrl(instagram) && (
            <a className="social-link" href={safeUrl(instagram)} target="_blank" rel="noreferrer">
              <img src="/icons/instagram.svg" alt="" className="social-icon" />
              {urlUsername(instagram)}
            </a>
          )}
        </div>
      )}

      {username === loggedUser.username ? (
        <Link
          className="btn btn-sm btn-outline-secondary action-btn"
          to="/settings"
        >
          <i className="ion-gear-a"></i> Edit Profile Settings
        </Link>
      ) : (
        <FollowButton
          followersCount={followersCount}
          following={following}
          handler={followHandler}
          username={username}
        />
      )}
    </div>
  );
}

export default AuthorInfo;
