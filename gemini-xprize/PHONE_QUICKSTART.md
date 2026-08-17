# Phone-only emergency quickstart

Deadline: August 17, 2026 at 1:00 PM Pacific / 4:00 PM Eastern.

## 1. Create the Gemini key

Open Google AI Studio on your phone, sign in, open **Dashboard → API Keys**, and create a new key. Do not paste it into chat, email, GitHub code, or the Devpost form.

## 2. Save it as a GitHub Codespaces secret

In this GitHub repository, open **Settings → Secrets and variables → Codespaces → New repository secret**.

- Name: `GEMINI_API_KEY`
- Value: the Gemini key

## 3. Start the prepared Codespace

Open:

`https://github.com/codespaces/new?hide_repo_select=true&ref=gemini-xprize-kira-founderops&repo=1031108889`

Choose the smallest machine and create the codespace. The prepared environment installs dependencies and starts the app on port 8080. If it does not open automatically, use the **Ports** tab and open port 8080.

## 4. Make one live run

- Tap **Load Kira Labs sample**.
- Tap **Run Gemini operations agent**.
- Wait for the operating brief.
- Tap **Human approve action plan**.

If the page says the API key is missing, stop and verify the Codespaces secret, then rebuild or restart the codespace.

## 5. Record the demo

Use the phone's screen recorder. Keep the video under 3 minutes. Show:

1. The input form.
2. Loading the sample.
3. The live Gemini run.
4. Decisions, evidence, risks, next actions, and unknowns.
5. The model/storage badge.
6. Human approval and its timestamp.

Do not show the API key or GitHub secret page.

## 6. Upload and submit

Upload the video to YouTube as Public and verify it plays. Use the files in `submission/` for the Devpost fields, narrative, P&L, and evidence statements.

Truthful current status unless it changes before submission:

- Product revenue: $0
- External paying customers: 0
- Institutional funding: $0
- Corporate ID: unavailable if Kira Labs is not incorporated
