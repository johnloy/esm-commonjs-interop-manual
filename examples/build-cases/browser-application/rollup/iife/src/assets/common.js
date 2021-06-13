import React from 'react';
import useWindowSize from 'react-use/lib/useWindowSize';
import Confetti from 'react-confetti';

export const Ridiculous = () => {
  const { width, height } = useWindowSize();
  return React.createElement(
    Confetti,
    {
      width,
      height,
    },
    null
  );
};
