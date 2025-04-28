const ProgressBar = ({ currentStep, totalSteps }) => {
  return (
    <div className="mt-2 px-6">
      <div className="relative flex items-center justify-between">
        {/* Background line */}
        <div className="absolute w-full h-2 bg-gray-200 rounded-lg top-1/2 transform -translate-y-1/2 z-0"></div>

        {/* Steps */}
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isActive = index + 1 <= currentStep;
          const isCompleted = index + 1 < currentStep;

          return (
            <div key={index} className="relative">
              {/* Connector line */}
              {index > 0 && (
                <div
                  className={`absolute top-1/2 -left-1/2 transform -translate-y-1/2 w-full h-2 ${"bg-gray-200"} z-0`}
                ></div>
              )}

              {/* Step Circle */}
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${
                  isCompleted
                    ? "bg-green-900 text-white"
                    : isActive
                      ? "bg-[#001433d2] text-white"
                      : "bg-white border-gray-300 text-gray-500"
                } z-10 shadow-md relative font-bold text-md`}
              >
                {isCompleted ? <p>&#x2714;</p> : index + 1}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default ProgressBar;
