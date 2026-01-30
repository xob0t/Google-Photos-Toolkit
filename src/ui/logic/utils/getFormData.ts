export default function getFormData(selector: string): Record<string, string | string[]> {
  const form: Record<string, string | string[]> = {};
  const formElement = document.querySelector<HTMLFormElement>(selector);
  if (!formElement) return form;

  const formData = new FormData(formElement);

  for (const [key, value] of formData) {
    const strValue = String(value);
    if (strValue) {
      // Check if the key already exists in the form object
      if (Reflect.has(form, key)) {
        // If the value is not an array, make it an array
        if (!Array.isArray(form[key])) {
          form[key] = [form[key]];
        }
        // Add the new value to the array
        (form[key]).push(strValue);
      } else {
        // If the key doesn't exist in the form object, add it
        form[key] = strValue;
      }
    }
  }
  return form;
}
