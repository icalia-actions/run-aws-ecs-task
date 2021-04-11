import { info, getInput, setOutput } from "@actions/core";

import {
  registerTaskDefinition,
  TaskRegistrationInput,
} from "@icalialabs/register-aws-ecs-task-definition";

import { runTask, RunTaskInput } from "./task-running";

export async function run(): Promise<number> {
  const name = getInput("name");

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
    cluster: getInput("cluster"),
    taskDefinition: taskDefinitionArn,
    templatePath: getInput("template"),
  } as RunTaskInput);
  if (!task) throw new Error("Task failed to launch");

  info("Task Run Details:");
  info(`             Task ARN: ${task.taskArn}`);
  info(`  Task Definition ARN: ${task.taskDefinitionArn}`);
  info("");

  setOutput("task-definition-arn", taskDefinitionArn);

  return 0;
}
