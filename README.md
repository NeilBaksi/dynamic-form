# Dynamic Material UI JSON-Driven Form

A **dynamic, schema-driven form engine** built with React, Material UI, TypeScript, and Vite.

Define your entire form—including fields, icons, images, layout, and validation—using a JSON schema.  
No custom components or validation logic required: everything is pure Material UI, and every prop is passed as-is from your schema.

---

## Live Demo

Check out the deployed application on Vercel: [Demo](https://dynamic-form-smoky-delta.vercel.app/)

## Features

- **Material UI Out-of-the-Box:**  
  Every component is a real MUI component (TextField, Checkbox, Rating, Typography, Divider, ImageList, Icons, etc.).
- **Schema-Driven:**  
  The form structure, validation, and layout are defined in a single JSON file.
- **Stepper Support:**  
  Multi-step forms are supported via the `step` property.
- **Conditional Fields:**  
  Show/hide fields based on values of other fields using `showIf`.
- **Icon and Image Support:**  
  Add any MUI icon or image gallery using MUI `ImageList`.
- **No Custom Validation Logic:**  
  All validation is handled using standard Material UI/HTML props (e.g. `required`, `minLength`, `pattern`).
- **Vite-Powered:**  
  Fast local development and builds with [Vite](https://vitejs.dev/).

---

## Getting Started

### 1. **Install Dependencies**

`npm install`

### 2. **Run the App**

Open [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

---

## Project Structure

```
src/
├── App.tsx
├── DynamicForm.tsx
├── formSchema.json
├── types.ts
├── main.tsx
└── styles.css
```

---

## How It Works

- **Schema:**  
  The form is described by a JSON array. Each object is a Material UI component with its props.
- **Rendering:**  
  The renderer dynamically imports and renders each component, passing all props from the schema.
- **Children:**  
  For layout and image galleries, use the `children` property to nest components (e.g. `ImageList` → `ImageListItem` → `img`).

---

## Example Schema (`formSchema.json`)

```
[
  {
    "id": "heading1",
    "component": "Typography",
    "props": {
      "variant": "h5",
      "children": "Account Complaint",
      "sx": { "mb": 2 }
    }
  },
  {
    "id": "gallery",
    "component": "ImageList",
    "props": {
      "cols": 3,
      "rowHeight": 164,
      "sx": { "width": 500, "height": 250, "mb": 2 }
    },
    "children": [
      {
        "id": "img1",
        "component": "ImageListItem",
        "props": {},
        "children": [
          {
            "id": "img1img",
            "component": "img",
            "props": {
              "src": "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e",
              "alt": "Breakfast",
              "loading": "lazy",
              "style": { "width": "100%", "height": "100%", "objectFit": "cover" }
            }
          }
        ]
      }
    ]
  },
  {
    "id": "divider1",
    "component": "Divider",
    "props": { "sx": { "my": 2 } }
  },
  {
    "id": "firstName",
    "component": "TextField",
    "props": {
      "name": "firstName",
      "label": "First Name",
      "variant": "outlined",
      "fullWidth": true,
      "required": true,
      "inputProps": { "minLength": 2 }
    },
    "step": 1
  },
  {
    "id": "lastName",
    "component": "TextField",
    "props": {
      "name": "lastName",
      "label": "Last Name",
      "variant": "outlined",
      "fullWidth": true,
      "required": true
    },
    "step": 1
  },
  {
    "id": "starIcon",
    "component": "Star",
    "props": {
      "fontSize": "large",
      "color": "primary",
      "sx": { "mb": 2 }
    }
  },
  {
    "id": "rating",
    "component": "Rating",
    "props": {
      "name": "rating",
      "defaultValue": 3,
      "precision": 1,
      "max": 5,
      "required": true
    },
    "step": 2
  }
]
```

---

## Validation

- Use standard Material UI/HTML validation props (`required`, `minLength`, `maxLength`, `pattern`, etc.) in your `props`.
- Error styling and helper text are handled automatically.

---

## Conditional Fields

Show/hide fields based on other field values using the `showIf` property:

```
{
  "id": "email",
  "component": "TextField",
  "props": { "name": "email", "label": "Email", "required": true },
  "showIf": { "field": "subscribe", "equals": true }
}
```

---

## Multi-Step Forms

Add a `step` property to any field/component to assign it to a step.  
Navigation is handled automatically.

---

## Credits

- [Material UI](https://mui.com/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)

---

> **Change your form by editing a JSON file—no code changes required!**
