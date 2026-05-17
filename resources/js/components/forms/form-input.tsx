import React from "react";
import FormError from "./form-error";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<"input"> & {
  label?: string;
  error?: string;
  text?: string;
  containerClassName?: string;
};

const FormInput = ({
  label,
  error,
  text,
  type,
  containerClassName,
  ...props
}: Props) => {
  return (
    <div className={cn("space-y-1", containerClassName)}>
      <Label className='uppercase text-xs font-bold text-gray-600'>{label}</Label>
      <Input {...props} type={type} />
      <FormError error={error} />
      {text && !error && (
        <p className="text-muted-foreground text-sm">{text}</p>
      )}
    </div>
  );
};

export default FormInput;
