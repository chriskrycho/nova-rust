import {
  envVarObject,
  onPreferenceChange,
  splitArgString,
} from './preference-resolver';

export class RustLanguageServer {
  private languageClient: LanguageClient | null = null;
  private crashAlert: Disposable | null = null;
  private lintCommand = 'check';
  private lintArgs: string[] = [];
  private envVars: Record<string, string> = {};

  constructor() {
    onPreferenceChange(
      'com.chriskrycho.rust.lint-command',
      false,
      (cargoCommand: string) => {
        this.lintCommand = cargoCommand;
        this.restart();
      },
    );
    onPreferenceChange(
      'com.chriskrycho.rust.lint-args',
      false,
      (lintArgs: string | null) => {
        if (lintArgs) {
          this.lintArgs = splitArgString(lintArgs);
          this.restart();
        }
      },
    );
    onPreferenceChange(
      'com.chriskrycho.rust.env-vars',
      true,
      (varList: string[] | null) => {
        this.envVars = envVarObject(varList || []);
        this.restart();
      },
    );
  }

  get client(): LanguageClient | null {
    return this.languageClient;
  }

  deactivate() {
    this.stop();
  }

  restart() {
    if (this.crashAlert) {
      this.crashAlert.dispose();
      this.crashAlert = null;
    }
    if (this.languageClient) {
      let alertDisposable = this.languageClient.onDidStop((err) => {
        alertDisposable.dispose();
        if (err === undefined) {
          this.start();
        } else {
          console.error(`Problem stopping client during restart: ${err}`);
        }
      });
      this.languageClient.stop();
      this.languageClient = null;
    } else {
      this.start();
    }
  }

  start() {
    if (this.languageClient) {
      this.languageClient.stop();
    }

    let path = `${nova.extension.path}/bin/rust-analyzer`;
    // For use when extension-managed Rust Analyzer is malfunctioning
    if (this.envVars.hasOwnProperty('RA_PATH')) {
      path = this.envVars['RA_PATH'];
      console.log(`Using Rust Analyzer at path: ${path}`);
    }
    // The Rust Analyzer binary won't exist when extension is first run
    // after installing.
    if (!nova.fs.access(path, nova.fs.F_OK + nova.fs.X_OK)) {
      console.log('Rust Analyzer binary not found. Aborting start process.');
      return;
    }

    const serverOptions: ServerOptions = nova.inDevMode()
      ? {
          path: '/bin/bash',
          args: [
            '-c',
            `tee "${nova.extension.path}/../logs/nova-client.log" | ${path} | tee "${nova.extension.path}/../logs/lang-server.log"`,
          ],
        }
      : { path };

    const clientOptions = {
      // The set of document syntaxes for which the server is valid
      syntaxes: ['rust'],
      initializationOptions: {
        cargo: {
          extraEnv: this.envVars,
        },
        // TODO: this can and should be configurable!
        checkOnSave: true,
        check: {
          command: this.lintCommand,
          extraArgs: this.lintArgs,
        },
      },
    };
    const client = new LanguageClient(
      'rust',
      'Rust Analyzer',
      serverOptions,
      clientOptions,
    );
    this.crashAlert = client.onDidStop(async (err) => {
      // Error is undefined if server stopping was expected
      console.error(`Language server stopped: ${err}`);
      if (err !== undefined) {
        let crashMsg = new NotificationRequest('server-crash');
        crashMsg.title = nova.localize('Language Server Crash');
        crashMsg.body = nova.localize(
          'Rust Analyzer has crashed. If this issue persists after restarting, ' +
            'please open a bug report and include console messages.',
        );
        crashMsg.actions = [nova.localize('Restart'), nova.localize('Ignore')];
        let resp = await nova.notifications.add(crashMsg);
        this.stop();
        if (resp.actionIdx === 0) {
          this.start();
        }
      }
    });

    try {
      client.start();
      this.languageClient = client;
    } catch (err) {
      // If the .start() method throws, it's likely because the path to the language server is invalid
      if (nova.inDevMode()) {
        console.error(`Error with startup: ${err}`);
      }
    }
  }

  stop() {
    // Don't treat as crash if intentionally stopping it.
    if (this.crashAlert) {
      this.crashAlert.dispose();
      this.crashAlert = null;
    }
    if (this.languageClient) {
      this.languageClient.stop();
      this.languageClient = null;
    }
  }
}

interface ServerOptions {
  path: string;
  args?: string[];
}
