export interface RouteItemType {
  title: string;
  icon?: string;
  component?: string;
  path?: string;
  menuPath: string;
  hidden?: string;
  children?: RouteItem[];
}
export interface ErrorNetType {
  code: string;
  message: string;
}
