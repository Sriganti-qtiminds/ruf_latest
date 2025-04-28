import { useNavigate } from "react-router-dom";

import tailwindStyles from "../../utils/tailwindStyles";

const UnauthorizeView = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col space-y-2 items-center justify-center w-full h-screen">
      <img
        style={{ width: "300px", backgroundSize: "cover" }}
        src="/UNAUTHORIZE.png"
        alt="unauthorized"
      />

      <h1 className={`${tailwindStyles.heading}`}>Un-Authorize Access</h1>
      <p className={`${tailwindStyles.paragraph}`}>
        Please Get Back To Previous Page
      </p>
      <button
        onClick={() => navigate(-1)}
        className={`${tailwindStyles.thirdButton}`}
      >
        Go Back
      </button>
    </div>
  );
};
export default UnauthorizeView;
