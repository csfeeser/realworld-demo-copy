import { useEffect, useState } from "react";
import AuthorCard from "../components/AuthorCard";
import ContainerRow from "../components/ContainerRow";
import DirectoryPagination from "../components/DirectoryPagination";
import { useAuth } from "../context/AuthContext";
import getProfiles from "../services/getProfiles";

function Directory() {
  const [{ profiles, profilesCount }, setProfilesData] = useState({
    profiles: [],
    profilesCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const { headers } = useAuth();

  useEffect(() => {
    getProfiles({ headers })
      .then(setProfilesData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [headers]);

  return (
    <div className="directory-page">
      <ContainerRow type="page">
        <div className="col-md-9 offset-md-1">
          <h1>Directory</h1>

          {loading ? (
            <div className="author-card">
              <em>Loading authors...</em>
            </div>
          ) : profiles.length > 0 ? (
            <>
              {profiles.map((profile) => (
                <AuthorCard key={profile.username} {...profile} />
              ))}

              <DirectoryPagination
                profilesCount={profilesCount}
                updateProfiles={setProfilesData}
              />
            </>
          ) : (
            <div className="author-card">No authors available.</div>
          )}
        </div>
      </ContainerRow>
    </div>
  );
}

export default Directory;
