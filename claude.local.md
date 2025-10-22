Claude Code Configuration

## Code Quality & Philosophy

**Minimize Lines of Code**
- Prioritize efficiency: Write concise, readable code that accomplishes the goal with minimal lines.
- Avoid verbosity: Don't add unnecessary comments, redundant logic, or boilerplate that isn't essential.
- Avoid unnecessary dependencies: Only include libraries/packages that directly support core functionality.
- Leverage built-in functions: Use framework utilities, libraries, and language features to reduce custom code.
- DRY principle: Extract and reuse code patterns to eliminate duplication.
- Refactor aggressively: If something can be accomplished in fewer lines without sacrificing clarity, do it.

**Version Control**
- Use git to version control projects. Always add this file to `.gitignore`
- Never mention in commit messages or files that code was created by Claude Code.
- Keep commit messages to 1-3 lines and focus on the "why" rather than the "what"

## Test Driven Development

- Come up with tests for each feature first, then implement it.
- Write and run tests immediately after implementing each new feature.
- Test individual components and functions before integration.
- Confirm that new features work as expected before moving to the next one.
- Ensure new code doesn't break existing functionality.

## Documentation Requirements (3 Files Only)

### README.md
Location: `/README.md` at repository root

Comprehensive project documentation covering:
- Project title and description
- Business problem it solves
- Key features and capabilities
- Technology stack
- Architecture overview with ASCII/Mermaid diagram showing AWS services
- Getting started and installation instructions
- Local testing/development guide
- Deployment instructions (including prerequisites, commands, verification steps)
- API documentation (if applicable)
- Contributing guidelines and license
- Support/troubleshooting links (reference Troubleshooting.md)

Update when: Features, business logic, deployment process, or architecture changes

### Roadmap.md
Location: `/roadmap.md` at repository root

Evolution tracking covering:
- Original project concept and problem statement
- Initial MVP features
- Features added chronologically with dates
- Current status and version
- Planned features for next iterations
- Possible enhancements and ideas for future consideration

Update when: New features are completed or new ideas are identified

### Troubleshooting.md
Location: `/troubleshooting.md` at repository root

Development and deployment issues covering:
- Common problems encountered during development
- Root causes and solutions
- Deployment issues and fixes
- Environment setup problems
- Rollback procedures (if applicable)
- Links to relevant code sections or documentation

Update when: New issues are discovered and resolved during development


## Deployment Script Format

When creating AWS/Terraform deployment scripts, output progress in this format:
```
1. Creating S3 bucket...
✓ S3 bucket created: pm-terraform-state-1761013734

2. Enabling S3 versioning...
✓ Versioning enabled

3. Enabling S3 encryption...
✓ Encryption enabled

4. Blocking public access...
✓ Public access blocked
```