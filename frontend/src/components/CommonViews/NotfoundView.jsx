import { useNavigate } from "react-router-dom";
import tailwindStyles from "../../utils/tailwindStyles";

const NotfoundView = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "80vh",
      }}
    >
      <img src="/NOTFOUND.png" className="w-2/5" alt="not found" />

      <button
        onClick={() => navigate("/")}
        className={`${tailwindStyles.thirdButton}`}
      >
        Go Back
      </button>
    </div>
  );
};

export default NotfoundView;
