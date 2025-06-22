import type { SVGProps } from 'react';

export const BackpackIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg fill="none" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_backpack" x1="14" x2="14" y1="4.66666" y2="24.1667">
        <stop stopColor="#d972f6" />
        <stop offset="1" stopColor="#3d49f5" />
      </linearGradient>
    </defs>
    <g fillRule="evenodd">
      <path
        d="m23.3333 16.3333v-3.5c0-4.41667-3.5-8.16667-7.9166-8.16667h-2.9167c-4.41667 0-7.91667 3.75-7.91667 8.16667v3.5c-1.45833 0-2.58333 1.1667-2.58333 2.625v2.5833c0 1.4584 1.125 2.625 2.58333 2.625h1.25v-2.125c0-.9583.75-1.75 1.66667-1.75h1.75c.91667 0 1.66667.7917 1.66667 1.75v2.125h5.8333v-2.125c0-.9583.75-1.75 1.6667-1.75h1.75c.9167 0 1.6667.7917 1.6667 1.75v2.125h1.25c1.4583 0 2.5833-1.1666 2.5833-2.625v-2.5833c0-1.4583-1.125-2.625-2.5833-2.625zm-9.3333-10.5c3.3333 0 6.0833 2.83334 6.0833 6.33334v2.625h-12.1666v-2.625c0-3.5 2.75-6.33334 6.0833-6.33334z"
        fill="url(#paint0_linear_backpack)"
      />
      <path d="m9.33333 16.3333h9.33334v1.75h-9.33334z" fill="#000" opacity=".2" />
    </g>
  </svg>
);
