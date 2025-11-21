import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { FormField } from "@/types/form-builder";
import { UseFormRegister, FieldErrors, Controller, Control } from "react-hook-form";
import { getValidationRules } from "@/lib/form-builder/validation";

interface BaseRendererProps {
  field: FormField;
  register: UseFormRegister<any>;
  errors: FieldErrors;
  control: Control<any>;
}

export function TextFieldRenderer({ field, register, errors }: BaseRendererProps) {
  const rules = getValidationRules(field.validation_rules || [], field.is_required);

  return (
    <div className="space-y-2">
      <Label htmlFor={field.field_key}>
        {field.label}
        {field.is_required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={field.field_key}
        type="text"
        placeholder={field.placeholder}
        {...register(field.field_key, rules)}
      />
      {field.help_text && <p className="text-xs text-muted-foreground">{field.help_text}</p>}
      {errors[field.field_key] && (
        <p className="text-xs text-destructive">{errors[field.field_key]?.message as string}</p>
      )}
    </div>
  );
}

export function TextAreaRenderer({ field, register, errors }: BaseRendererProps) {
  const rules = getValidationRules(field.validation_rules || [], field.is_required);

  return (
    <div className="space-y-2">
      <Label htmlFor={field.field_key}>
        {field.label}
        {field.is_required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Textarea
        id={field.field_key}
        placeholder={field.placeholder}
        {...register(field.field_key, rules)}
      />
      {field.help_text && <p className="text-xs text-muted-foreground">{field.help_text}</p>}
      {errors[field.field_key] && (
        <p className="text-xs text-destructive">{errors[field.field_key]?.message as string}</p>
      )}
    </div>
  );
}

export function NumberFieldRenderer({ field, register, errors }: BaseRendererProps) {
  const { pattern, valueAsDate, ...rules } = getValidationRules(field.validation_rules || [], field.is_required);

  return (
    <div className="space-y-2">
      <Label htmlFor={field.field_key}>
        {field.label}
        {field.is_required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={field.field_key}
        type="number"
        step="any"
        placeholder={field.placeholder}
        {...register(field.field_key, {
          ...rules,
          valueAsNumber: true
        })}
      />
      {field.help_text && <p className="text-xs text-muted-foreground">{field.help_text}</p>}
      {errors[field.field_key] && (
        <p className="text-xs text-destructive">{errors[field.field_key]?.message as string}</p>
      )}
    </div>
  );
}

export function SelectFieldRenderer({ field, control, errors }: BaseRendererProps) {
  const rules = getValidationRules(field.validation_rules || [], field.is_required);

  return (
    <div className="space-y-2">
      <Label htmlFor={field.field_key}>
        {field.label}
        {field.is_required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Controller
        name={field.field_key}
        control={control}
        rules={rules}
        render={({ field: { onChange, value } }) => (
          <Select onValueChange={onChange} value={value}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {field.help_text && <p className="text-xs text-muted-foreground">{field.help_text}</p>}
      {errors[field.field_key] && (
        <p className="text-xs text-destructive">{errors[field.field_key]?.message as string}</p>
      )}
    </div>
  );
}

export function CheckboxFieldRenderer({ field, control, errors }: BaseRendererProps) {
  const rules = getValidationRules(field.validation_rules || [], field.is_required);

  return (
    <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
      <Controller
        name={field.field_key}
        control={control}
        rules={rules}
        render={({ field: { onChange, value } }) => (
          <Checkbox
            checked={value}
            onCheckedChange={onChange}
          />
        )}
      />
      <div className="space-y-1 leading-none">
        <Label htmlFor={field.field_key}>
          {field.label}
          {field.is_required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {field.help_text && <p className="text-xs text-muted-foreground">{field.help_text}</p>}
        {errors[field.field_key] && (
          <p className="text-xs text-destructive">{errors[field.field_key]?.message as string}</p>
        )}
      </div>
    </div>
  );
}

export function DateFieldRenderer({ field, register, errors }: BaseRendererProps) {
  const rules = getValidationRules(field.validation_rules || [], field.is_required);

  return (
    <div className="space-y-2">
      <Label htmlFor={field.field_key}>
        {field.label}
        {field.is_required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={field.field_key}
        type="date"
        {...register(field.field_key, rules)}
      />
      {field.help_text && <p className="text-xs text-muted-foreground">{field.help_text}</p>}
      {errors[field.field_key] && (
        <p className="text-xs text-destructive">{errors[field.field_key]?.message as string}</p>
      )}
    </div>
  );
}

export function TimeFieldRenderer({ field, register, errors }: BaseRendererProps) {
  const rules = getValidationRules(field.validation_rules || [], field.is_required);

  return (
    <div className="space-y-2">
      <Label htmlFor={field.field_key}>
        {field.label}
        {field.is_required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={field.field_key}
        type="time"
        {...register(field.field_key, rules)}
      />
      {field.help_text && <p className="text-xs text-muted-foreground">{field.help_text}</p>}
      {errors[field.field_key] && (
        <p className="text-xs text-destructive">{errors[field.field_key]?.message as string}</p>
      )}
    </div>
  );
}
