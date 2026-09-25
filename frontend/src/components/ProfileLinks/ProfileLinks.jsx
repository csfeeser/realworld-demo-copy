import { useEffect, useState } from "react";
import getProfile from "../../services/getProfile";

function ProfileLinks({ headers, username }) {
  const [links, setLinks] = useState(null);

  useEffect(() => {
    getProfile({ headers, username })
      .then((profile) => {
        if (!profile) return;

        setLinks(profile.socialLinks);
      })
      .catch((error) => console.error(error));
  }, [headers, username]);

  if (!links || links.length === 0) return null;

  return (
    <ul className="social-links">
      {links.map((link, i) => (
        <li key={i}>
          <a href={link.url}>{link.label}</a>
        </li>
      ))}
    </ul>
  );
}

export default ProfileLinks;
