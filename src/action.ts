import { info, getInput, setOutput } from "@actions/core";

import {
  registerTaskDefinition,
  TaskRegistrationInput,
} from "@icalialabs/register-aws-ecs-task-definition";

import { describeTask, runTask, RunTaskInput } from "./task-running";

function sleep(seconds: number): Promise<NodeJS.Timeout> {
  const milliseconds = seconds * 1000;
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function run(): Promise<number> {
  const name = getInput("name");
  if (!name) throw new Error("'name' is required");

  const cluster = getInput("cluster") || "default";

  info(`Registering task definition '${name}'...`);
  const { taskDefinitionArn } = await registerTaskDefinition({
    family: name,
    templatePath: getInput("definition-template"),
    containerImages: JSON.parse(getInput("container-images") || "null"),
    environmentVars: JSON.parse(getInput("environment-vars") || "null"),
  } as TaskRegistrationInput);
  if (!taskDefinitionArn) throw new Error("Task definition failed to register");

  info(`Launching task '${name}'...`);
  const task = await runTask({
    cluster,
    taskDefinition: taskDefinitionArn,
    templatePath: getInput("template"),
  } as RunTaskInput);
  if (!task || !task.taskArn) throw new Error("Task failed to launch");

  info("Task Run Details:");
  info(`             Task ARN: ${task.taskArn}`);
  info(`  Task Definition ARN: ${task.taskDefinitionArn}`);
  info("");

  setOutput("task-definition-arn", task.taskDefinitionArn);
  setOutput("task-arn", task.taskArn);

  const waitToCompletion = getInput("wait-to-completion") == "true";
  if (!waitToCompletion) return 0;

  let lastStatus, stopCode, containers;
  do {
    if (typeof lastStatus !== "undefined") {
      info("Waiting 10 seconds for next update...");
      await sleep(10);
    }

    ({ lastStatus, stopCode, containers } = await describeTask(
      cluster,
      task.taskArn
    ));
    info(`Last Status: ${lastStatus}`);
  } while (stopCode == null);
  info(`Stop Code: ${stopCode}`);

  const exitCode = containers?.pop()?.exitCode;
  info(`Exit Code: ${exitCode}`);

  // Si no hay exit code en éste punto, la tarea falló:
  return typeof exitCode == "undefined" || exitCode == null ? 1 : exitCode;
}
