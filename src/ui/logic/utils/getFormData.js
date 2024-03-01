export default function getForm(selector) {
  let form = {};
  const formElement = document.querySelector(selector);
  const formData = new FormData(formElement);

  for (const [key, value] of formData) {

    if (value) {
      // Check if the key already exists in the form object
      if (Reflect.has(form, key)) {
        // If the value is not an array, make it an array
        if (!Array.isArray(form[key])) {
          form[key] = [form[key]];
        }
        // Add the new value to the array
        form[key].push(value);
      } else {
        // If the key doesn't exist in the form object, add it
        form[key] = value;
      }
    }
  }
  return form;
}