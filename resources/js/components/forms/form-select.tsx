import FormError from "./form-error";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { SelectProps } from "@radix-ui/react-select";
import { cn } from "@/lib/utils";
import { SelectOption } from '@/pages/transactions/components/transaction-form';

type Props = SelectProps & {
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  error?: string;
  containerClassname?: string;
  className?: string;
};

const FormSelect = ({
  options,
  label,
  error,
  placeholder,
  value,
  containerClassname,
  className,
  ...props
}: Props) => {
  return (
      <div className={cn("space-y-1", containerClassname)}>
          <Label className="uppercase text-[11px] font-semibold text-gray-500">
              {label}
          </Label>
          <Select value={value} {...props}>
              <SelectTrigger className={cn(className)}>
                  <SelectValue placeholder={`Select ${placeholder ?? ""}`} />
              </SelectTrigger>
              <SelectContent>
                  <SelectGroup>
                      {options.map((option) => (
                          <SelectItem
                              key={option.value}
                              value={`${option.value}`}
                          >
                              {option.label}
                          </SelectItem>
                      ))}
                  </SelectGroup>
              </SelectContent>
          </Select>
          <FormError error={error} />
      </div>
  );
};

export default FormSelect;
