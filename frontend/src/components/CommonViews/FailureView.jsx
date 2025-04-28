import tailwindStyles from "../../utils/tailwindStyles";

const FailureView = () => {
  return (
    <div
      className="mt-16"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "60vh",
        width: "100%",
      }}
    >
      <img className="w-1/2" src="/FAILURE.png" alt="FailureImg" />
      <h1 className={`${tailwindStyles.heading} text-xlg`}>
        Something Went Wrong Check Connection
      </h1>
      <p className={`${tailwindStyles.paragraph} text-xlg`}>
        Please Try Again Later......
      </p>
    </div>
  );
};

export default FailureView;
