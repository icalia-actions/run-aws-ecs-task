import { info, getInput, setOutput } from "@actions/core";

import {
  registerTaskDefinition,
  TaskRegistrationInput,
} from "@icalialabs/register-aws-ecs-task-definition";

export async function run(): Promise<number> {
  const taskDefinitionName = getInput('task-definition-name')

  info(`Registering task definition '${taskDefinitionName}'...`);
  const { taskDefinitionArn } = await registerTaskDefinition({
    family: taskDefinitionName,
    templatePath: getInput('task-definition-template-path'),
    containerImages: JSON.parse(getInput('container-images') || 'null'),
    environmentVars: JSON.parse(getInput('environment-vars') || 'null'),
  } as TaskRegistrationInput)
  if (!taskDefinitionArn) throw new Error('Task definition failed to register')

  info("Task Definition Registration Details:");
  info(`  Task Definition ARN: ${taskDefinitionArn}`);
  info("");

  setOutput("task-definition-arn", taskDefinitionArn);

  return 0;
}