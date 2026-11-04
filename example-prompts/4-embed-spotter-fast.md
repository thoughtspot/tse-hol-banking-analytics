On the Bankalytics AI page (app/ai/page.tsx), replace the placeholder with an embedded Spotter using SpotterEmbed from the Visual Embed SDK's React components.

Requirements:

- Reuse the existing trusted-auth token endpoint. Initialize the SDK once from a shared, idempotent module that's only loaded in the browser (next/dynamic, ssr: false).
- Use the Spotter 3 chat (updatedSpotterChatPrompt: true). Do NOT set spotterExperienceVersion: SPOTTER_2026_11 if your instance is older than 26.11, because it redirects to the home page.
- On the server, look up the 'Banking' model by exact name and pass its id as worksheetId, with disableSourceSelection: true. Wrap the server fetch in <Suspense>.
- Enable the chat history sidebar with spotterSidebarConfig: enablePastConversationsSidebar: true, collapsed by default, title 'Chat history', new-chat button 'New conversation'.
- Hide Spotter's generic sample questions.
- Update the page header description to fit the banking model.
- Add 6 clickable starter-prompt chips above the embed. Each sends its question with HostEvent.SpotterSearch and is written against the Banking model's real columns, so look up the columns first and don't guess.
- Keep embed props and handlers stable (module constants or useCallback) so the iframe isn't rebuilt. Give the embed style={{ height: "100%" }} so the iframe doesn't collapse to 150px.

Verification, in this order:

1. Before writing code, check every SDK option you plan to use against the installed 1.53.1 types (node_modules/@thoughtspot/visual-embed-sdk). Don't use an option you haven't found there.
2. Run `tsc --noEmit` and lint, and fix errors. Don't run `next build`.
3. Do ONE browser test: a single Node script using Playwright with its bundled Chromium (headless). If Playwright isn't installed, add it as a devDependency and run `npx playwright install chromium`. Don't depend on a system-installed Chrome or on shell-specific commands, because this must run on macOS and Windows. The script runs against the dev server at {{DEV_URL}}, loads /ai once in a fresh context and checks all of the following in that one session:
   - Spotter loads (the URL or iframe is not the home page).
   - The Banking model pill is visible and can't be changed.
   - The sample questions are hidden.
   - Clicking one chip runs its question and returns a result, with the same iframe element before and after.
   - The expanded sidebar shows 'Chat history' and 'New conversation'.
   - Collect every console error and page error from that load.
     Don't repeat page loads to re-check things. If one check fails, fix it and rerun the script once at most.

Don't commit. Report what passed and anything you couldn't verify.

End your final message with exactly one line, `CONSOLE ERRORS: none` if there were none, or `CONSOLE ERRORS: ` followed by each distinct error message separated by `|`.
