import { CheckCircle, Hourglass, Pencil } from "lucide-react";
import tailwindStyles from "../../../utils/tailwindStyles";

const processSteps = [
  {
    id: 1,
    title: "Fill the Details",
    description: "Submit property details through the form",
    icon: Pencil,
    gradient: "from-blue-500 to-blue-300",
    borderColor: "border-blue-500",
  },
  {
    id: 2,
    title: "Admin Review",
    description: "Admin verifies details before approval of post",
    icon: Hourglass,
    gradient: "from-yellow-500 to-yellow-300",
    borderColor: "border-yellow-500",
  },
  {
    id: 3,
    title: "Property Listed",
    description: "Approved properties are listed & RM assigned",
    icon: CheckCircle,
    gradient: "from-green-500 to-green-300",
    borderColor: "border-green-500",
  },
];

const PostProcess = () => {
  return (
    <div className="flex flex-col mt-4 items-center justify-center lg:px-4">
      <h2 className={`${tailwindStyles.heading_2} mb-4`}>
        Property Listing Process
      </h2>
      <div className="grid max-w-5xl grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {processSteps.map((step) => (
          <div
            key={step.id}
            className={`bg-white/80 backdrop-blur-md flex items-center shadow-xl rounded-2xl p-4 border-t-4 ${step.borderColor} hover:shadow-2xl transition-all duration-300 group`}
          >
            <step.icon
              className={`w-10 h-10 text-white mx-4 p-2 rounded-full bg-gradient-to-br ${step.gradient} transition-transform`}
            />
            <div>
              <h3 className={`${tailwindStyles.heading_3}`}>{step.title}</h3>
              <p className={`${tailwindStyles.paragraph} mt-1`}>
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostProcess;
