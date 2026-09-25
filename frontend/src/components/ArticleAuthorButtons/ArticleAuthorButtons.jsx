import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import deleteArticle from "../../services/deleteArticle";

function ArticleAuthorButtons({ body, description, slug, tagList, title }) {
  const { headers, isAuth } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!isAuth) return alert("You need to login first");

    const confirmation = window.confirm("Want to delete the article?");
    if (!confirmation) return;

    deleteArticle({ headers, slug })
      .then(() => navigate("/"))
      .catch(console.error);
  };

  return (
    <>
      <button
        className="btn btn-sm"
        style={{ color: "var(--color-danger-action, #d00)" }}
        onClick={handleClick}
      >
        <i className="ion-trash-a"></i> Delete Article
      </button>{" "}
      <button
        className="btn btn-sm"
        style={{ color: "var(--color-muted-action, #777)" }}
      >
        <Link
          className="nav-link"
          state={{ body, description, tagList, title }}
          to={`/editor/${slug}`}
        >
          <i className="ion-edit"></i> Edit Article
        </Link>
      </button>{" "}
    </>
  );
}

export default ArticleAuthorButtons;
