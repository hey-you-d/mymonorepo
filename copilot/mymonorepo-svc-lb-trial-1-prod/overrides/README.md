# Overriding Copilot generated CloudFormation templates with YAML Patches

The file `cfn.patches.yml` contains a list of YAML/JSON patches to apply to
your template before AWS Copilot deploys it.

To view examples and an explanation of how YAML patches work, check out the [documentation](https://aws.github.io/copilot-cli/docs/developing/overrides/yamlpatch).

Note only [`add`](https://www.rfc-editor.org/rfc/rfc6902#section-4.1),
[`remove`](https://www.rfc-editor.org/rfc/rfc6902#section-4.2), and
[`replace`](https://www.rfc-editor.org/rfc/rfc6902#section-4.3)
operations are supported by Copilot.
Patches are applied in the order specified in the file.

## Troubleshooting

* `copilot [noun] package` preview the transformed template by writing to stdout.
* `copilot [noun] package --diff` show the difference against the template deployed in your environment.

## New Schedule

| Time (AEST)         | Time (UTC)         | Action     |
| :------------------ | :----------------: | ---------: |
| Mon–Fri 9 AM        | Sun–Thu 23:00 UTC  | Scale up   |
| Mon–Fri 9 PM        | Mon–Fri 11:00 UTC  | Scale down |
| Sat & Sun All Day   | Sat–Sun            | Scale down |

Scale Down effect: will be served with 503 page
Scale Up effect: the site is up and running

### Explanation:
As of AWS Copilot v1.34, scheduled scaling is not directly supported within the manifest.yml file.

To implement scheduled scaling, I'm utilizing AWS Copilot's support for CloudFormation overrides. By creating an addons.yml file, I can define scheduled scaling actions using AWS Application Auto Scaling resources. This approach allows specifying scaling policies that adjust the desired count of your ECS services at scheduled times.

```bash
copilot svc override --env production
```

to deploy the service with scheduling overrides:

```bash
copilot svc deploy --name your-service-name --env production
```