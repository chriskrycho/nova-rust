import {
  envVarObject,
  onPreferenceChange,
  splitArgString,
} from './preference-resolver';

class CargoTaskAssistant {
  private envVars: Record<string, string> = {};

  constructor() {
    onPreferenceChange(
      'com.chriskrycho.rust.env-vars',
      true,
      (varList: string[] | null) => {
        this.envVars = envVarObject(varList || []);
      },
    );
  }

  // Required, but unused, method. Tasks are configured in extension.json.
  provideTasks(): AssistantArray<Task> {
    return [];
  }

  resolveTaskAction(context: TaskActionResolveContext<any>): TaskProcessAction {
    let args: string[] = [];
    let cmdPref = 'com.chriskrycho.rust.cargo.build.subcommand';
    let argPref = 'com.chriskrycho.rust.cargo.build.args';
    if (context.action === Task.Run) {
      cmdPref = 'com.chriskrycho.rust.cargo.run.subcommand';
      argPref = 'com.chriskrycho.rust.cargo.run.args';
    }
    args.push(context.config?.get(cmdPref) as string);
    let comArgs = context.config?.get(argPref);
    console.log(comArgs);
    if (comArgs) args = args.concat(splitArgString(comArgs as string));
    console.log(args);

    return new TaskProcessAction('cargo', {
      shell: true,
      args: args,
      env: this.envVars as { [key: string]: string },
    });
  }
}

export { CargoTaskAssistant };
