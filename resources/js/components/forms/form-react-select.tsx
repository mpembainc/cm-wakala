import { forwardRef } from "react";
import ReactSelect, { Props as ReactSelectProps, GroupBase } from "react-select";
import { cn } from "@/lib/utils";
import { Label } from '../ui/label';
import FormError from './form-error';

export type FormReactSelectProps<
   Option,
   IsMulti extends boolean = false,
   Group extends GroupBase<Option> = GroupBase<Option>
> = Omit<ReactSelectProps<Option, IsMulti, Group>, "theme" | "classNames"> & {
   error?: boolean;
   label?: string;
   errorMsg?: string;
};

export const FormReactSelect = forwardRef<any, FormReactSelectProps<any>>(
  ({ className, error, ...props }, ref) => {
    return (
        <div className={cn("space-y-1")}>
            <Label className="uppercase text-xs font-bold text-gray-600">
                {props.label}
            </Label>
            <ReactSelect
                ref={ref}
                isMulti={props.isMulti}
                unstyled
                closeMenuOnSelect={!props.isMulti}
                components={{ IndicatorSeparator: () => null }}
                styles={{
                    valueContainer: (base) => ({
                        ...base,
                        border: 0,
                        outline: "none",
                        boxShadow: "none",
                    }),
                    input: (base) => ({
                        ...base,
                        outline: "none",
                        boxShadow: "none",
                        border: 0,
                    }),
                }}
                className={cn(
                    "rs-select [&_input]:outline-none [&_input]:focus:outline-none [&_input]:ring-0 [&_input]:focus:ring-0 [&_input]:border-0 [&_input]:focus:border-0 [&_input]:shadow-none [&_input]:bg-transparent",
                    className,
                )}
                classNames={{
                    control: ({ isFocused }) =>
                        cn(
                            "flex w-full h-9 rounded-sm border border-gray-300 bg-background px-3 py-[2px] text-base shadow-sm transition-colors",
                            "placeholder:text-muted-foreground focus-visible:outline-none",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            isFocused && "ring-2 ring-ring border-none",
                            error && "border-destructive ring-destructive",
                        ),
                    placeholder: () => "text-muted-foreground text-sm",
                    input: () =>
                        "bg-transparent border-0 focus:border-0 outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 shadow-none appearance-none",
                    menu: () =>
                        "mt-2 rounded-md border bg-popover text-popover-foreground shadow-md py-1",
                    menuList: () => "text-sm font-medium text-gray-600!",
                    option: ({ isFocused, isSelected }) =>
                        cn(
                            "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 outline-none transition-colors",
                            isSelected && "bg-primary text-primary-foreground",
                            isFocused &&
                                !isSelected &&
                                "bg-accent text-accent-foreground",
                            !isFocused &&
                                !isSelected &&
                                "text-popover-foreground hover:bg-accent hover:text-accent-foreground",
                        ),
                    multiValue: () =>
                        "inline-flex items-center bg-secondary text-secondary-foreground mr-1",
                    multiValueLabel: () => "px-2 leading-none",
                    multiValueRemove: () =>
                        cn(
                            "flex items-center justify-center p-1",
                            "hover:bg-destructive hover:text-destructive-foreground",
                        ),
                    valueContainer: () =>
                        "gap-1 flex flex-wrap items-center min-w-0",
                    clearIndicator: () =>
                        "p-1 text-muted-foreground hover:text-foreground",
                    dropdownIndicator: () =>
                        "p-1 text-muted-foreground hover:text-foreground",
                    indicatorSeparator: () => "hidden",
                    noOptionsMessage: () => "text-muted-foreground p-2",
                }}
                {...props}
            />
            <FormError error={props.errorMsg} />
        </div>
    );
  }
);

FormReactSelect.displayName = "FormReactSelect";
