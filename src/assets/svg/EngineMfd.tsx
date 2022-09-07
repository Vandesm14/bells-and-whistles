import svgPath from 'svgpath';

export interface EngineMfdProps {
  value: number;
}

export default function EngineMfd({ value }: EngineMfdProps) {
  const OFFSET = 50;
  return (
    <svg
      width="500"
      height="515"
      viewBox="0 0 500 515"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="MFD">
        <rect width="500" height="515" fill="#1F1F1F" />
        <g id="N1">
          <path
            id="Subtract"
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M193.958 100.546C192.665 62.4699 161.391 32 123 32C83.7879 32 52.0001 63.7878 52.0001 103C52.0001 120.774 58.5309 137.022 69.3238 149.476C68.3482 150.407 67.3955 151.344 66.4661 152.286C54.966 139.105 48.0001 121.866 48.0001 103C48.0001 61.5786 81.5787 28 123 28C163.655 28 196.755 60.3477 197.966 100.709C196.645 100.634 195.309 100.579 193.958 100.546Z"
            fill="#D9D9D9"
          />
          <g id="Pointer">
            <rect
              id="Pointer_2"
              x="121.837"
              y="101.635"
              width="3.85619"
              height="82.1546"
              transform={`rotate(${
                OFFSET + value * (270 - OFFSET)
              } 121.837 101.635)`}
              fill="#D9D9D9"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}
