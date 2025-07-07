import type { Extension } from "../environment";

export default function importProvider(): Extension {
  return (env) => {
    env.variables.push((context) => {
      const importTemplate = async (path: string) => {
        return env.importTemplate(path, context);
      };

      context.globals.import = importTemplate;
    });
  };
}
