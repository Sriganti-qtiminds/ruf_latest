export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      scrollbar: ["rounded"],
    },
  },
  plugins: [require("tailwind-scrollbar")({ nocompatible: true })],
};
