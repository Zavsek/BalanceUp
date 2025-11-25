/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*", "./components/**/*.{js,jsx,ts,tsx}"],
  presets:[require("nativewind/preset")],
  theme: {
    extend: {
      colors:{
        golden: '#FFC107',
        brightGolden: '#FFDE08',
        graySlate: '#607D8B',
        jungleGreen:'#4CAF50',
        mostlyBlack: '#191919'
      },
      fontFamily:{
        customFont: ['ShareTech', 'sans-serif']
      }
    },
  },
  plugins: [],
}

