# AGENTS.md

## Project Snapshot
- Stack: Java 17 + Spring Boot (`pom.xml` uses `spring-boot-starter-parent` `4.0.5`).
- Packaging: single Spring Boot app in `src/main/java/com/twoguysoneai/customermeetingprepagent`.
- Current state is a scaffold: one app entrypoint, one context-load test, minimal config.

## Big-Picture Architecture
- Bootstrapping is centralized in `src/main/java/com/twoguysoneai/customermeetingprepagent/CustomerMeetingPrepAgentApplication.java`.
- `@SpringBootApplication` enables component scanning + auto-configuration from that package downward.
- No service/controller/repository layers exist yet; treat this as a clean baseline for first domain modules.
- Runtime config currently only sets app name in `src/main/resources/application.yaml`.

## Dependency and Integration Boundaries
- Runtime web surface comes from `org.springframework.boot:spring-boot-starter-webmvc` (`pom.xml`).
- Test support comes from `org.springframework.boot:spring-boot-starter-webmvc-test` with JUnit 5 (`@Test`).
- Build/repackage path uses `spring-boot-maven-plugin`; use Maven Wrapper (`mvnw`, `mvnw.cmd`) to avoid local Maven drift.
- No external systems (DB, queues, cloud SDKs, HTTP clients) are configured yet.

## Existing Patterns to Preserve
- Keep Java package root under `com.twoguysoneai.customermeetingprepagent` so Spring scanning works by default.
- Mirror test package paths to production package paths (example: `CustomerMeetingPrepAgentApplicationTests` mirrors app package).
- Keep config in YAML under `src/main/resources/application.yaml`.
- Current tests use full-context style via `@SpringBootTest`; add slice tests intentionally when introducing web/controllers.
- File naming convention for react classes: 
    - Use PascalCase for component files (e.g., `UserProfile.jsx`)
    - Use camelCase for utility files and suffix them with `Utils` (e.g., `apiClientUtils.js`)
    - React Test files should mirror the component they test and be placed in the same directory and suffix `.test.jsx` (e.g., `UserProfile.test.jsx` for `UserProfile.jsx`).
- File naming convention for Java classes:
    - Use PascalCase for all class files (e.g., `CustomerMeetingPrepAgentApplication.java`).
    - Test class names should mirror the class they test and be suffixed with `Tests` (e.g., `CustomerMeetingPrepAgentApplicationTests.java` for `CustomerMeetingPrepAgentApplication.java`).
    - Integration test classes should be suffixed with `Int` (e.g., `UserServiceInt.java` for integration tests related to `UserService.java`).
- After updating java/react code, update any relevant tests

## Developer Workflows
- Run tests with Maven Wrapper from project root:
  - Windows: `./mvnw.cmd test`
  - macOS/Linux: `./mvnw test`
- Run the app locally:
  - Windows: `./mvnw.cmd spring-boot:run`
  - macOS/Linux: `./mvnw spring-boot:run`
- Build an executable jar: `./mvnw.cmd package` (or `./mvnw package` on macOS/Linux).

## Implementation Notes for Future Agents
- Add new Spring beans under subpackages of `com.twoguysoneai.customermeetingprepagent` to be auto-detected.
- If introducing external integrations, document required properties in `application.yaml` and add matching tests.
- When adding first HTTP endpoint, include at least one web test and keep `contextLoads()` as startup smoke coverage.
- Update this file when architecture expands beyond the current single-module scaffold.

---

## Skills

Agent skills (triggered workflows) are defined in [SKILLS.md](.github/SKILLS.md).

### ⚠️ Mandatory Skill Compliance Rules

1. **Always check skills first.** Before acting on any user request, read `.github/SKILLS.md` to check if a skill trigger matches the request.
2. **Read the full skill script.** If a trigger matches, read the corresponding `.yaml` file in `.github/scripts/` in full before taking any action.
3. **Execute every step in order.** Follow each `run` and `instruction` step exactly as defined — do not skip, reorder, or substitute steps.
4. **Never shortcut the workflow.** For example, the `git push changes` skill requires a feature branch and a pull request — never push directly to `master`.
5. **Treat skill steps as hard rules**, not suggestions. If a step cannot be completed, report the failure to the user rather than silently skipping it.
6. **Do not push changes unless explicitly asked to do so, based on the skill**
