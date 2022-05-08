import * as readline from "readline";
import { Program, View } from "./Repl";

export type RunningProgram<model, msg> = {
  kind: "RunningProgram";
  program: Program<model, msg>;
  listener: (msg: msg) => void;
};

function RunningProgram<model, msg>(
  program: Program<model, msg>,
  listener: (msg: msg) => void
): RunningProgram<model, msg> {
  return {
    kind: "RunningProgram",
    program,
    listener,
  };
}

type ReadlineInstance = {
  kind: "ReadlineInstance";
  instance: readline.Interface;
};

function ReadlineInstance(instance: readline.Interface): ReadlineInstance {
  return {
    kind: "ReadlineInstance",
    instance,
  };
}

function createReadline(): ReadlineInstance {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return ReadlineInstance(rl);
}

function question(
  instance: ReadlineInstance,
  text: string,
  onInput: (arg0: string) => void
): void {
  instance.instance.question(text, (answer: string) => onInput(answer));
}

function view<model, msg>(
  instance: ReadlineInstance,
  viewer: (model: model) => View<msg>,
  model: model,
  listener: (msg: msg) => void
): void {
  const viewed = viewer(model);
  switch (viewed.kind) {
    case "Statement": {
      console.log(viewed.text);
      break;
    }
    case "Question": {
      question(instance, viewed.prompt, (answer) => {
        listener(viewed.onInput(answer));
      });
      break;
    }
    case "End": {
      instance.instance.close();
      break;
    }
  }
}

export function program<model, msg>(
  program: Program<model, msg>
): RunningProgram<model, msg> {
  let model = program.initialModel;
  const instance = createReadline();

  const listener = (msg: msg) => {
    model = program.update(msg, model, listener);
    view(instance, program.view, model, listener);
  };

  view(instance, program.view, model, listener);

  return RunningProgram(program, listener);
}
