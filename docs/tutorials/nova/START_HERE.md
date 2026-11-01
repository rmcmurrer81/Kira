# Nova — your first website guide

**This is an original teaching demo, not production Iris or a language model.** Starter files are being shared in the existing public Kira repository. The manual hosting instructions below do not create a separate website, account or repository for you. The HTML can also be opened locally; do not assume a hosted demo is available until its URL is verified. The source is original tutorial code inspired by the idea of a small website guide. Its answers are written rules, not generated intelligence.

## Open it on your computer
1. From the [public tutorial folder](https://github.com/rmcmurrer81/Kira/tree/main/docs/tutorials/nova), open `index.html` and use GitHub's **Download raw file** control to save it as `index.html`. Save `test.cjs` alongside it only if you want the optional Node tests. If you received the standalone tutorial ZIP instead, extract it into a folder. The HTML file is self-contained; no other files are needed to run it.
2. Double-click `index.html`. Choose your browser if asked. No installation or API key is needed.
3. Press **Ask Nova**, type **What is NewBrain?**, then click Send or press Enter.
4. Try **Who won the moon race?** Notice the honest fallback instead of an invented answer.
5. Use Clear chat, Close, and Escape. Refreshing loses the conversation.

If it opens as text, use your browser's Open file command. Keep the name `index.html`, not `index.html.txt`. On Windows, enable filename extensions in File Explorer so you can check. Use a plain-text editor, not a word processor, to edit code.

## Understand the three languages
- HTML supplies the structure: launcher, panel, messages and form.
- CSS styles the page and fixes the widget near the bottom-right corner.
- JavaScript responds to actions, matches a small FAQ and displays text.

## Give it a name and facts
1. Make a backup of `index.html`.
2. Open it in a plain-text editor. Find `const BOT_NAME = 'Nova';` under **3. NAME**. Change only Nova, save, refresh. Avoid quote characters in the name until you understand JavaScript string escaping.
3. Find **4. FACTS**. Each FAQ item has a `matches` pattern, `text` answer and optional `source` ID.
4. Edit one answer at a time. Keep single quotes balanced. Save, refresh and test the exact question.
5. Add only accurate facts you are allowed to publish. Link IDs must refer to a known entry in `SOURCES`; never make links from whatever a visitor types.

`/\b(newbrain|new brain)\b/i` matches either spelling as words, ignoring capitalization. The first matching rule wins. This is deliberately limited: a sentence containing multiple topics may select only the first matching answer. It does not truly understand language, search the internet, learn new facts, or maintain conversation context.

## Test it yourself
Try Kira Labs, NEWBRAIN, contact, hello, an unknown topic, blank spaces, and text that looks like HTML. Expected: accurate fixed answer or honest fallback; no blank messages; HTML appears as text, not executable markup. Enter should submit once. Tab through the controls, test Escape and resize to a narrow mobile window. Check text visibility, keyboard focus and source links.

Optional developer tests: with an already installed Node.js, run `node test.cjs` in this folder. Eighteen logic/DOM-mock checks passed during preparation. Mock tests do not prove actual browser rendering, screen-reader behavior or production security.

## Put it inside your own page — locally first
Use a backup of a page you own. Copy the CSS inside the `style` block into that page's styles. Copy the widget markup from **2. EMBED** through its closing `section` just before `</body>`. Copy the full `script` block after that markup. Keep the `nova-` IDs unique and include it once. Do not copy the demo's `main` content unless you want it. Save and open locally to repeat the tests. The demo includes broad body/main styles; adapt or scope those to avoid changing an existing site's layout. Site builders may restrict JavaScript or use a Content Security Policy; this plain-HTML example does not cover every platform.

## Optional manual free GitHub Pages route
Instructions only, checked against official GitHub Docs on November 1, 2026. You decide whether to publish and review GitHub's terms yourself. Public hosting reveals your source: remove all secrets and private information first. No payment or custom domain is needed for this public-repository example.

1. In your own GitHub account, create a new **public** repository named `nova-demo` and add a README. GitHub Free supports Pages from public repositories.
2. Upload `index.html` to the repository root using **Add file → Upload files**, then commit the change to `main`. Do not upload the ZIP instead of extracting the HTML.
3. Open the repository's **Settings → Pages**. Under **Build and deployment → Source**, select **Deploy from a branch**.
4. Choose `main`, select **/(root)**, then **Save**. The branch must already exist.
5. Wait for deployment; the official docs say changes can take up to ten minutes. In Pages, use **Visit site** when available. That is evidence of a site URL—not proof the widget works; repeat your tests there.
6. If deployment fails, check the repository's Actions deployment run. Do not repeatedly create new repositories. This uses static HTML/CSS/JavaScript, not a server backend.

Official sources:
- [Create a Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [Configure the publishing branch and folder](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Upload files in the browser](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)

## Limits and privacy
No API, telemetry, cookies, storage, external images or external fonts are used. Questions stay in this page's memory and are not sent by the demo. Clicking an official source opens that website, whose own privacy practices apply. Hosting providers may log page requests. Do not enter personal information. Clear/refresh resets the visible chat; that is not a guarantee about browser/device forensic retention.

The example is not a substitute for a production privacy/security/accessibility review. A real AI integration needs separate backend security, costs, permissions, evaluation and safeguards; never place a secret API key in frontend HTML.

Public project references: https://kiralabs.org · https://kiralabs.org/newbrain.html · https://kiralabs.org/contact.html
