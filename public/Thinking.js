const fade = styled.keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0.45;
  }
`;

const Typing = styled.svg`
  color: white;
  circle:nth-of-type(1) {
    animation: ${fade} 700ms cubic-bezier(0.39, 0.58, 0.57, 1) 0ms infinite
      alternate-reverse;
  }
  circle:nth-of-type(2) {
    animation: ${fade} 700ms cubic-bezier(0.39, 0.58, 0.57, 1) 400ms infinite
      alternate-reverse;
  }
  circle:nth-of-type(3) {
    animation: ${fade} 700ms cubic-bezier(0.39, 0.58, 0.57, 1) 800ms infinite
      alternate-reverse;
  }
`;

const Thinking = () => (
  <Typing height="100%" viewBox="0 0 10 4">
    <g fill="currentColor">
      <circle cx="2" cy="2" r="1" />
      <circle cx="5" cy="2" r="1" />
      <circle cx="8" cy="2" r="1" />
    </g>
  </Typing>
);