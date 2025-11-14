/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    // Border radius classes
    {
      pattern: /rounded-(none|sm|md|lg|xl|2xl|3xl|full)/,
    },
    {
      pattern: /rounded-(t|r|b|l|tl|tr|br|bl)-(none|sm|md|lg|xl|2xl|3xl|full)/,
    },
    // Shadow classes
    {
      pattern: /shadow-(sm|md|lg|xl|2xl|inner|none)/,
    },
    // Spacing classes (padding, margin)
    {
      pattern: /(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml)-(0|1|2|3|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96)/,
    },
    // Text sizes
    {
      pattern: /text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/,
    },
    // Font weights
    {
      pattern: /font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)/,
    },
    // Width and height
    {
      pattern: /(w|h)-(0|1|2|3|4|5|6|8|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96|auto|full|screen|min|max|fit)/,
    },
    {
      pattern: /(max-w|min-w|max-h|min-h)-(0|none|xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|full|min|max|fit|screen)/,
    },
    // Colors for text, background, border
    {
      pattern: /(text|bg|border)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)/,
    },
    // Border widths
    {
      pattern: /border-(0|2|4|8)/,
    },
    {
      pattern: /border-(t|r|b|l|x|y)-(0|2|4|8)/,
    },
    // Flex and grid
    {
      pattern: /(flex|grid)-(1|auto|initial|none)/,
    },
    {
      pattern: /grid-cols-(1|2|3|4|5|6|7|8|9|10|11|12|none)/,
    },
    {
      pattern: /grid-rows-(1|2|3|4|5|6|none)/,
    },
    {
      pattern: /gap-(0|1|2|3|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96)/,
    },
    // Opacity
    {
      pattern: /opacity-(0|5|10|20|25|30|40|50|60|70|75|80|90|95|100)/,
    },
    // Z-index
    {
      pattern: /z-(0|10|20|30|40|50|auto)/,
    },
    // Display
    'block', 'inline-block', 'inline', 'flex', 'inline-flex', 'grid', 'inline-grid', 'hidden',
    // Position
    'static', 'fixed', 'absolute', 'relative', 'sticky',
    // Overflow
    'overflow-auto', 'overflow-hidden', 'overflow-visible', 'overflow-scroll',
    'overflow-x-auto', 'overflow-x-hidden', 'overflow-x-visible', 'overflow-x-scroll',
    'overflow-y-auto', 'overflow-y-hidden', 'overflow-y-visible', 'overflow-y-scroll',
    // Transitions and animations
    {
      pattern: /transition-(none|all|colors|opacity|shadow|transform)/,
    },
    {
      pattern: /duration-(75|100|150|200|300|500|700|1000)/,
    },
    {
      pattern: /ease-(linear|in|out|in-out)/,
    },
    // Hover, focus states
    {
      pattern: /hover:(opacity|bg|text|border|shadow)-.+/,
    },
    {
      pattern: /focus:(ring|outline|border)-.+/,
    },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}