export interface FormElementProps<T> {
  value: T;
  onChange?: (value: T) => void;
  isInvalid?: boolean;
  name?: string;
}
