# Run AWS ECS Task

Runs a Task in AWS ECS

## Github Action Usage

```yaml
      - name: Run AWS ECS Task
        uses: icalia-actions/run-aws-ecs-task@v0.0.2
        with:
          cluster: my-cluster
          
          # The name of the task to run - it will also be used as the name of
          # the task definition:
          name: my-cool-task

          # You may optionally wait until the task finishes (defaults to false)
          wait-to-completion: true
          
          # The template for the task - i.e. the json/yaml used when running
          # `aws ecs run-task --cli-input-yaml file://templates/ecs/my-task.yml`
          template: templates/ecs/my-task.yml

          # You can optionally set the task definition template:
          definition-template: templates/ecs/my-task-definition.yml

          # You can override the image used on any container - the most common
          # use case is to deploy an image built & pushed on a previous step:
          container-images: '{"my-container":"my-built-image"}'

          # You can optionally override any environment variable in the task 
          # container definitions, given that the overridden environment variable
          # already exists in the container definition:
          environment-vars: '{"FOO":"BAR"}'
```

## Library Usage

```
yarn add --dev @icalialabs/run-aws-ecs-task
```