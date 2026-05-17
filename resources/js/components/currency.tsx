import { NumericFormat, NumericFormatProps } from "react-number-format";

type Props = NumericFormatProps & {
  value: number | string;
};

const Currency = ({ value, ...props }: Props) => {
  return (
    <NumericFormat
      {...props}
      value={value}
      displayType="text"
      thousandSeparator
    />
  );
};

export default Currency;
