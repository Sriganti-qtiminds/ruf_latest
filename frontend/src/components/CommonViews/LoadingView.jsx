import { ThreeDots } from "react-loader-spinner";

const LoadingView = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "80vh",
      width: "100%",
    }}
  >
    <ThreeDots
      height="50"
      width="50"
      radius="9"
      color="black"
      ariaLabel="three-dots-loading"
      visible={true}
    />
  </div>
);

export default LoadingView;
