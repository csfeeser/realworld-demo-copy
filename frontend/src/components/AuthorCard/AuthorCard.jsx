import { Link } from "react-router-dom";
import Avatar from "../Avatar";

function AuthorCard({ bio, followersCount, following, image, username }) {
  return (
    <div className="author-card">
      <Link state={{ bio, followersCount, following, image }} to={`/profile/${username}`}>
        <Avatar alt={username} src={image} />
      </Link>
      <div className="info">
        <Link
          className="author"
          state={{ bio, followersCount, following, image }}
          to={`/profile/${username}`}
        >
          {username}
        </Link>
        {bio && <p className="bio-snippet">{bio}</p>}
      </div>
    </div>
  );
}

export default AuthorCard;
