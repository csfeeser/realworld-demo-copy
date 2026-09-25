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
    return parts[0] || url;
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
  }, [username, headers, navigate]);

  const followHandler = ({ followersCount, following }) => {
    setAuthor((prev) => ({ ...prev, followersCount, following }));
  };

  return (
    <div className="col-xs-12 col-md-10 offset-md-1">
      <Avatar alt={username} className="user-img" src={image} />
      <h4>{username}</h4>

      {bio && <Markdown options={{ forceBlock: true }}>{bio}</Markdown>}

      {(website || github || twitter || instagram) && (() => {
        const safeWebsite  = safeUrl(website);
        const safeGithub   = safeUrl(github);
        const safeTwitter  = safeUrl(twitter);
        const safeInstagram = safeUrl(instagram);
        return (safeWebsite || safeGithub || safeTwitter || safeInstagram) && (
          <div className="social-links">
            {safeWebsite && (
              <a className="social-link" href={safeWebsite} target="_blank" rel="noreferrer">
                <img src="/icons/globe.svg" alt="" className="social-icon" />
                {website}
              </a>
            )}
            {safeGithub && (
              <a className="social-link" href={safeGithub} target="_blank" rel="noreferrer">
                <img src="/icons/github.svg" alt="" className="social-icon" />
                {urlUsername(github)}
              </a>
            )}
            {safeTwitter && (
              <a className="social-link" href={safeTwitter} target="_blank" rel="noreferrer">
                <img src="/icons/x.svg" alt="" className="social-icon" />
                {urlUsername(twitter)}
              </a>
            )}
            {safeInstagram && (
              <a className="social-link" href={safeInstagram} target="_blank" rel="noreferrer">
                <img src="/icons/instagram.svg" alt="" className="social-icon" />
                {urlUsername(instagram)}
              </a>
            )}
          </div>
        );
      })()}

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
