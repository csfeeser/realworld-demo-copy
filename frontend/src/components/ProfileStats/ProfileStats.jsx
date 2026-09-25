import { useEffect, useState } from "react";
import dateFormatter from "../../helpers/dateFormatter";
import getProfile from "../../services/getProfile";

function ProfileStats({ headers, username }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getProfile({ headers, username })
      .then((profile) => {
        if (!profile) return;

        const { articlesCount, favoritesReceived, memberSince } = profile;
        setStats({ articlesCount, favoritesReceived, memberSince });
      })
      .catch((error) => console.error(error));
  }, [headers, username]);

  if (!stats) return null;

  return (
    <div className="author-stats">
      <ul className="tag-list">
        <li className="tag-default tag-pill">{stats.articlesCount} articles</li>
        <li className="tag-default tag-pill">
          {stats.favoritesReceived} favorites
        </li>
      </ul>
      <div className="date">
        Member since {dateFormatter(stats.memberSince)}
      </div>
    </div>
  );
}

export default ProfileStats;
