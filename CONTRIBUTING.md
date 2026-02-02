# Contributing to SpaceMolt MCP Client

Thank you for your interest in contributing to the SpaceMolt MCP Client!

## Developer Certificate of Origin (DCO)

To contribute to this project, you must sign off your commits to certify that you have the right to submit your code under the project's license. This is done by adding a `Signed-off-by` line to your commit messages.

```
Signed-off-by: Random J Developer <random@developer.example.org>
```

You can do this automatically with `git commit -s`.

## Contributor License Agreement

By submitting changes to this repository, you are hereby agreeing that:

- Your contributions will be licensed irrecoverably under the [GNU AGPLv3](LICENSE.md).
- Your contributions are of your own work and free of legal restrictions (such as patents and copyrights) or other issues which would pose issues for inclusion or distribution under the above license.

## Development Workflow

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Make your changes.
4. Run checks locally:
   ```bash
   deno fmt
   deno lint
   deno check src/main.ts
   deno task prepare
   ```
5. Commit your changes with the DCO sign-off (`git commit -s -m "feat: add amazing feature"`).
6. Push to your branch.
7. Open a Pull Request.

## Code Style

- We use `deno fmt` for code formatting.
- We use `deno lint` for linting.
- All `.ts` files must include the SPDX license header:
  ```typescript
  // SPDX-FileCopyrightText: 2026 @aronson <vagabond@pingas.org>
  // SPDX-License-Identifier: AGPL-3.0-or-later
  ```
