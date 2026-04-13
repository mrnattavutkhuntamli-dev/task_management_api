/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  // บอก TypeScript ว่าไฟล์ .vue ทุกไฟล์คือ Vue Component
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
