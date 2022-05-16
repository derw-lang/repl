import * as readline from "readline";
import { Program, ReadlineInstance, RunningProgram, view } from "./Repl";

function createReadline(): ReadlineInstance {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return ReadlineInstance({ instance: rl });
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

    return RunningProgram({ program, listener });
}
