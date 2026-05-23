import { NumericFormat } from "react-number-format";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import FormError from "./form-error";

type Props = {
  id?: string;
  label?: string;
  error?: string;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  value?: string | number;
  onChange?: (value?: number) => void;
  min?: number;
  getInputRef?: React.Ref<any>;
};

const FormNumber = ({
  id,
  label,
  error,
  placeholder,
  value,
  onChange,
  readOnly,
  disabled,
  min,
  getInputRef,
}: Props) => {
  return (
      <div className="space-y-1">
          <Label className="uppercase text-[11px] font-semibold text-gray-500">
              {label}
          </Label>
          <NumericFormat
              id={id}
              placeholder={placeholder}
              value={value}
              onValueChange={(e) => onChange?.(e.floatValue)}
              customInput={Input}
              thousandSeparator
              readOnly={readOnly}
              disabled={disabled}
              min={min}
              getInputRef={getInputRef}
          />
          <FormError error={error} />
      </div>
  );
};

export default FormNumber;
