type Props = {
  error?: string;
};

const FormError = ({ error }: Props) => {
  if (!error) return null;

  return <div className="text-sm text-red-600">{error}</div>;
};

export default FormError;
