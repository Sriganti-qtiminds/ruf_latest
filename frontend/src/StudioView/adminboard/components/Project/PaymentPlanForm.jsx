import { useState } from "react";

export default function PaymentPlanForm({ project }) {
  const weeks = parseInt(project.no_of_weeks, 10) || 0;
  const signup = parseFloat(project.signup_percentage) || 0;
  const remaining = 100 - signup;

  // Initialize weekly percentages evenly
  const [weeklyPercentages, setWeeklyPercentages] = useState(
    Array(weeks).fill(parseFloat((remaining / weeks).toFixed(2)))
  );

  const handlePercentageChange = (index, value) => {
    let newVal = parseFloat(value) || 0;

    // Ensure newVal is within 0-100
    newVal = Math.min(Math.max(newVal, 0), 100);

    const totalOtherWeeks = weeklyPercentages.reduce(
      (sum, p, i) => (i === index ? sum : sum + p),
      0
    );

    let remainingForOthers = 100 - signup - newVal;

    // Avoid negative distribution
    if (remainingForOthers < 0) remainingForOthers = 0;

    const otherIndexes = weeklyPercentages.map((_, i) => i).filter((i) => i !== index);

    const newPercentages = weeklyPercentages.map((p, i) => {
      if (i === index) return newVal;
      // Distribute remaining proportionally
      const proportion = p / totalOtherWeeks || 1 / (weeks - 1);
      return parseFloat((proportion * remainingForOthers).toFixed(2));
    });

    setWeeklyPercentages(newPercentages);
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-4">Weekly Payment Plan</h3>
      {weeklyPercentages.map((percentage, index) => (
        <div key={index} className="flex items-center gap-4 mb-2">
          <span>Week {index + 1}:</span>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={percentage}
            onChange={(e) => handlePercentageChange(index, e.target.value)}
            className="border rounded px-2 py-1 w-24"
          />
          <span>%</span>
        </div>
      ))}
      <div className="mt-4 font-semibold">
        Total: {weeklyPercentages.reduce((sum, p) => sum + p, signup).toFixed(2)}%
      </div>
    </div>
  );
}
