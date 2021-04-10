# Run AWS ECS Task

Runs a Task in AWS ECS

## Github Action Usage

```yaml
      - name: Run AWS ECS Task
        uses: icalia-actions/run-aws-ecs-task@v0.0.1
        with:
          cluster: my-cluster
          template-path: templates/ecs/my-task-definition.yml

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