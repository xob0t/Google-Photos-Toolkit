export default function getFormData(selector: string): Record<string, string | string[]> {
  const form: Record<string, string | string[]> = {};
  const formElement = document.querySelector<HTMLFormElement>(selector);
  if (!formElement) return form;

  const formData = new FormData(formElement);

  for (const [key, value] of formData) {
    const strValue = typeof value === 'string' ? value : value.name;
    if (strValue) {
      if (Reflect.has(form, key)) {
        if (!Array.isArray(form[key])) {
          form[key] = [form[key]];
        }
        (form[key]).push(strValue);
      } else {
        form[key] = strValue;
      }
    }
  }
  return form;
}
