# @tinystacks/terraform-resource-parser
A Terraform parser for a few key resources.  Intended as a plugin for @tinystacks/iac-utils smoke test cli.

## How To Use
By default, this parser plugin is included as a peer dependency of the [smoke-test-cli]() and is therefore always available, though it is deprioritized over any explicitly configured parsers.

To increase the priority of this parser, you can install this package as a dev dependency and add it to the top of the `terraformParsers` array in your smoke test config.

`npm i -D @tinystacks/terraform-resource-parser`

```json
{
  // ...
  "terraformParsers": [
    "@tinystacks/terraform-resource-parser"
    // ...other parsers
  ]
}
```