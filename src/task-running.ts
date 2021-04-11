import * as fs from "fs";
import { parse } from "yaml";

import ECS, {
  Task,
  RunTaskRequest,
  DescribeTasksRequest,
} from "aws-sdk/clients/ecs";

export interface RunTaskInput {
  taskDefinition: string;

  cluster?: string;
  templatePath?: string;
}

function getClient(): ECS {
  return new ECS({
    customUserAgent: "icalia-actions/aws-action",
    region: process.env.AWS_DEFAULT_REGION,
  });
}

function readRunTaskRequestTemplate(
  templatePath: string,
  runTaskRequest: RunTaskRequest
): void {
  if (!templatePath || !fs.existsSync(templatePath)) return;

  const templateData = parse(fs.readFileSync(templatePath, "utf8"));
  Object.assign(runTaskRequest, templateData);
}

function processRunTaskInput(input: RunTaskInput): RunTaskRequest {
  const { cluster, taskDefinition, templatePath } = input;
  let runTaskRequest = { taskDefinition } as RunTaskRequest;

  if (cluster) runTaskRequest.cluster = cluster;
  if (templatePath) readRunTaskRequestTemplate(templatePath, runTaskRequest);

  return runTaskRequest;
}

export async function describeTask(
  cluster: string,
  taskArn: string
): Promise<Task> {
  const ecs = getClient();
  const { tasks } = await ecs
    .describeTasks({
      cluster,
      tasks: [taskArn],
    } as DescribeTasksRequest)
    .promise();

  const task = tasks?.pop();
  if (!task) throw new Error("No task was found");

  return task;
}

export async function runTask(input: RunTaskInput): Promise<Task> {
  const ecs = getClient();
  const taskRunRequest = processRunTaskInput(input);
  const { tasks } = await ecs.runTask(taskRunRequest).promise();
  const task = tasks?.pop();
  if (!task) throw new Error("No task was executed");

  return task;
}
