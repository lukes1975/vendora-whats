
import { useState } from 'react';
import { sanitizeTextInput, validatePhoneNumber, validateStoreName } from '@/utils/security';
import { useToast } from '@/hooks/use-toast';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
  sanitize?: boolean;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

export const useSecureForm = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules = {}
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const validateField = (name: keyof T, value: any): string | null => {
    const rule = validationRules[name as string];
    if (!rule) return null;

    const stringValue = String(value || '');

    if (rule.required && !stringValue.trim()) {
      return `${String(name)} is required`;
    }

    if (rule.minLength && stringValue.length < rule.minLength) {
      return `${String(name)} must be at least ${rule.minLength} characters`;
    }

    if (rule.maxLength && stringValue.length > rule.maxLength) {
      return `${String(name)} must be no more than ${rule.maxLength} characters`;
    }

    if (rule.pattern && !rule.pattern.test(stringValue)) {
      return `${String(name)} format is invalid`;
    }

    if (rule.custom && !rule.custom(stringValue)) {
      return `${String(name)} is invalid`;
    }

    return null;
  };

  const setValue = (name: keyof T, value: any) => {
    // Sanitize input if rule specifies
    const rule = validationRules[name as string];
    let sanitizedValue = value;
    
    if (rule?.sanitize && typeof value === 'string') {
      sanitizedValue = sanitizeTextInput(value);
    }

    setValues(prev => ({ ...prev, [name]: sanitizedValue }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let hasErrors = false;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName as keyof T, values[fieldName as keyof T]);
      if (error) {
        newErrors[fieldName as keyof T] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);

    if (hasErrors) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form.',
        variant: 'destructive',
      });
    }

    return !hasErrors;
  };

  const handleSubmit = async (onSubmit: (values: T) => Promise<void>) => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    errors,
    isSubmitting,
    setValue,
    validateForm,
    handleSubmit,
  };
};

// Predefined validation rules for common fields
export const commonValidationRules = {
  storeName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    sanitize: true,
    custom: validateStoreName,
  },
  whatsappNumber: {
    required: true,
    custom: validatePhoneNumber,
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  productName: {
    required: true,
    minLength: 3,
    maxLength: 200,
    sanitize: true,
  },
  productDescription: {
    maxLength: 1000,
    sanitize: true,
  },
};
