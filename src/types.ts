export interface ShowIf {
  field: string;
  equals: boolean;
}

export interface ComponentSchema {
  id: string;
  component: string; // e.g. "TextField", "Checkbox", "Divider", "Typography"
  props?: Record<string, any>;
  showIf?: ShowIf;
  step?: number;
  children?: ComponentSchema[];
}

export type FormSchema = ComponentSchema[];
