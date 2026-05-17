import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertDialogProps } from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";

type Props = AlertDialogProps & {
  message: string;
  title?: string;
  isWarning?: boolean;
  onConfirm: () => void;
};

const ConfirmAlert = ({
  onOpenChange,
  onConfirm,
  message,
  title,
  isWarning,
  ...props
}: Props) => {
  return (
    <AlertDialog onOpenChange={onOpenChange} {...props}>
      <AlertDialogContent className="top-[40%]">
        <AlertDialogHeader>
          <AlertDialogTitle>{title ?? "Confirm Action"}</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-800 text-base">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-gray-600 text-black border-2">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              isWarning ? "bg-destructive hover:bg-destructive/80" : ""
            )}
            onClick={() => onConfirm?.()}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmAlert;
