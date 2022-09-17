import React from 'react';
import Knob, {
  KnobProps,
  composeTwo,
  useAngleUpdater,
  SkinWrap,
} from 'react-dial-knob';
import { Column } from '../compose/flex';

// Define theme props for the new skin
interface CustomKnobSkinTheme {
  activeColor?: string;
  defaultColor?: string;
}

// Extend core props with theme and style attribute
interface CustomKnobSkinProps extends KnobProps {
  theme?: CustomKnobSkinTheme;
  style?: React.CSSProperties;
}

function CustomKnobSkin(props: CustomKnobSkinProps): JSX.Element {
  const [angle, setAngle] = useAngleUpdater(props.value);
  const [, setIsActive] = React.useState(false);
  const angleChangeHandler = composeTwo<number>(setAngle, props.onAngleChange);
  const interactionChangeHandler = composeTwo<boolean>(
    setIsActive,
    props.onInteractionChange
  );
  return (
    <SkinWrap>
      <Column center maxContent>
        {props.children}
        <Knob
          diameter={props.diameter}
          value={props.value}
          min={props.min}
          max={props.max}
          step={props.step}
          spaceMaxFromZero={props.spaceMaxFromZero}
          ariaLabelledBy={props.ariaLabelledBy}
          ariaValueText={props.ariaValueText}
          knobStyle={{ cursor: 'pointer', ...props.knobStyle }}
          onAngleChange={angleChangeHandler}
          onInteractionChange={interactionChangeHandler}
          onValueChange={props.onValueChange}
        >
          <svg
            viewBox="0 0 90 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            transform={`rotate(${angle})`}
            style={{ transform: `rotate(${angle}deg)` }}
          >
            <circle cx="45" cy="45" r="45" fill="#CDCDCD" />
            <mask
              id="mask0_13_12"
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="90"
              height="90"
            >
              <circle cx="45" cy="45" r="45" fill="#CDCDCD" />
            </mask>
            <g mask="url(#mask0_13_12)">
              <g filter="url(#filter0_d_13_12)">
                <path
                  d="M17 36.7477C17.5091 32.0365 23.7186 23.7623 41.4364 0H45V30.152C31.9417 30.1395 26.2913 32.169 17 36.7477Z"
                  fill="#F7F7F7"
                />
                <path
                  d="M17 36.7477C17.5091 32.0365 23.7186 23.7623 41.4364 0H41.9455L23.6182 33.921L17 36.7477Z"
                  fill="url(#paint0_linear_13_12)"
                />
                <path
                  d="M17 80.2042V36.5264C26.2913 31.9477 31.9417 30.1395 45 30.152V90C31.5 90 24 88.3425 17 80.2042Z"
                  fill="#E0DFE4"
                />
                <rect
                  x="40.9272"
                  width="2.03636"
                  height="50.8815"
                  fill="#565759"
                />
                <path
                  d="M73 36.7477C72.4909 32.0365 66.2814 23.7623 48.5636 0H45V30.152C58.0583 30.1395 63.7087 32.169 73 36.7477Z"
                  fill="#F7F7F7"
                />
                <path
                  d="M73 36.7477C72.4909 32.0365 66.2814 23.7623 48.5636 0H48.0545L66.3818 33.921L73 36.7477Z"
                  fill="url(#paint1_linear_13_12)"
                />
                <path
                  d="M73 80.2042V36.5264C63.7087 31.9477 58.0583 30.1395 45 30.152V90C58.5 90 66 88.3425 73 80.2042Z"
                  fill="#E0DFE4"
                />
                <rect
                  width="2.03636"
                  height="50.8815"
                  transform="matrix(-1 0 0 1 49.0728 0)"
                  fill="#565759"
                />
              </g>
              <path
                d="M17 36.7477C17.5091 32.0365 23.7186 23.7623 41.4364 0H45V30.152C31.9417 30.1395 26.2913 32.169 17 36.7477Z"
                fill="#F7F7F7"
              />
              <path
                d="M17 36.7477C17.5091 32.0365 23.7186 23.7623 41.4364 0H41.9455L23.6182 33.921L17 36.7477Z"
                fill="url(#paint2_linear_13_12)"
              />
              <path
                d="M17 80.2042V36.5264C26.2913 31.9477 31.9417 30.1395 45 30.152V90C31.5 90 24 88.3425 17 80.2042Z"
                fill="#E0DFE4"
              />
              <rect
                x="40.9272"
                width="2.03636"
                height="50.8815"
                fill="#565759"
              />
              <path
                d="M73 36.7477C72.4909 32.0365 66.2814 23.7623 48.5636 0H45V30.152C58.0583 30.1395 63.7087 32.169 73 36.7477Z"
                fill="#F7F7F7"
              />
              <path
                d="M73 36.7477C72.4909 32.0365 66.2814 23.7623 48.5636 0H48.0545L66.3818 33.921L73 36.7477Z"
                fill="url(#paint3_linear_13_12)"
              />
              <path
                d="M73 80.2042V36.5264C63.7087 31.9477 58.0583 30.1395 45 30.152V90C58.5 90 66 88.3425 73 80.2042Z"
                fill="#E0DFE4"
              />
              <rect
                width="2.03636"
                height="50.8815"
                transform="matrix(-1 0 0 1 49.0728 0)"
                fill="#565759"
              />
            </g>
            <defs>
              <filter
                id="filter0_d_13_12"
                x="7"
                y="-10"
                width="76"
                height="110"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
              >
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset />
                <feGaussianBlur stdDeviation="5" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                />
                <feBlend
                  mode="normal"
                  in2="BackgroundImageFix"
                  result="effect1_dropShadow_13_12"
                />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect1_dropShadow_13_12"
                  result="shape"
                />
              </filter>
              <linearGradient
                id="paint0_linear_13_12"
                x1="31"
                y1="0"
                x2="31"
                y2="36.7477"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#F6F6F6" />
                <stop offset="0.808209" stop-color="#EBEDEA" />
              </linearGradient>
              <linearGradient
                id="paint1_linear_13_12"
                x1="59"
                y1="0"
                x2="59"
                y2="36.7477"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#F6F6F6" />
                <stop offset="0.808209" stop-color="#EBEDEA" />
              </linearGradient>
              <linearGradient
                id="paint2_linear_13_12"
                x1="31"
                y1="0"
                x2="31"
                y2="36.7477"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#F6F6F6" />
                <stop offset="0.808209" stop-color="#EBEDEA" />
              </linearGradient>
              <linearGradient
                id="paint3_linear_13_12"
                x1="59"
                y1="0"
                x2="59"
                y2="36.7477"
                gradientUnits="userSpaceOnUse"
              >
                <stop stop-color="#F6F6F6" />
                <stop offset="0.808209" stop-color="#EBEDEA" />
              </linearGradient>
            </defs>
          </svg>
        </Knob>
      </Column>
    </SkinWrap>
  );
}

export interface CustomKnobProps {
  label?: string;
  onChange?: (value: number) => void;
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  diameter?: number;
}

export default function CustomKnob(props: CustomKnobProps) {
  const [value, setValue] = React.useState(props.value || 0);
  return (
    <CustomKnobSkin
      diameter={props.diameter ?? 100}
      value={value}
      min={props.min ?? 0}
      max={props.max ?? 100}
      step={props.step ?? 1}
      theme={{
        activeColor: '#b56a7a',
        defaultColor: '#100',
      }}
      onValueChange={(angle) => setValue(angle)}
      style={{ cursor: 'pointer' }}
    >
      {props.label ? <label>{props.label.toUpperCase()}</label> : null}
    </CustomKnobSkin>
  );
}
