# Click-by-click provider setup for Robert — Windows

## Stop before entering any secret

Never paste an API key, database password, AWS secret, or connection string into ChatGPT, a GitHub file, a public issue, a screenshot, or a Devpost form. Save secrets only as Windows **User variables** or GitHub **Actions secrets**.

The local hackathon tests do not need any account or key.

# 1. Google Gemini — do this first

You are already on the correct Google AI Studio **API Keys** page.

1. Click **Create API key** in the upper-right corner.
2. When it asks for a project, choose **Create project**.
3. Project name: `Kira-Labs-Hackathons-2026`
4. Create the project and select it.
5. Click **Create key**.
6. Click **Copy** once. Do not take a screenshot while the key is visible.
7. Return to the Windows **Environment Variables** window.
8. In the top section, **User variables for robmc**, click **New...**
9. Variable name: `GEMINI_API_KEY`
10. Variable value: paste the Google key.
11. Click **OK**.
12. In the top section, click **New...** again.
13. Variable name: `KIRA_TRUTHKEEPER_GEMINI_MODEL`
14. Variable value: `gemini-3.5-flash`
15. Click **OK**, then **OK** again to close Environment Variables.
16. Close and reopen the Kira Labs test center so the new process can read the variables.
17. Click **Check API setup**. Google should show `developer_api_key_configured: true`.

Do not set both `GEMINI_API_KEY` and `GOOGLE_API_KEY`; one key is enough.

# 2. AWS — secure the account before development

Your screenshot shows that you are signed in as the AWS **root user** and AWS is offering MFA setup. Do not create a root access key.

## Root MFA

1. On the **Keep your account secure** page, in **MFA device name**, type:
   `Robert-AWS-Root-MFA`
2. Choose **Authenticator app**. This is the easiest option if you already use Google Authenticator, Microsoft Authenticator, Authy, or another TOTP app.
3. Click **Next**.
4. On your phone, open the authenticator app.
5. Tap its plus/add button and choose **Scan QR code**.
6. Scan the AWS QR code.
7. Enter the current six-digit code into AWS.
8. Wait for the code to change, then enter the next six-digit code when AWS requests it.
9. Choose **Add MFA** or **Assign MFA**.
10. Store the root password and MFA recovery information somewhere private.

Do not choose **Skip for now** unless the phone is unavailable. AWS requires root MFA within 35 days.

## Create a spending alert

1. In the AWS console search bar, type `Budgets`.
2. Open **AWS Budgets**.
3. Click **Create budget**.
4. Choose **Use a template (simplified)**.
5. Choose **Monthly cost budget**.
6. Budget name: `Kira-Hackathons-Monthly`
7. Monthly amount: `10`
8. Email recipient: use your own email address.
9. Create the budget.
10. Optionally create a second **Zero spend budget** for an earlier warning.

A budget is an alert, not a hard spending cap. Stop unused cloud resources manually.

## Choose the Bedrock region

1. In the upper-right region menu, choose **US East (N. Virginia) — us-east-1**.
2. In the console search bar, type `Amazon Bedrock`.
3. Open **Amazon Bedrock**.
4. Open **Model catalog**.
5. Search for `Amazon Nova Micro`.
6. Open the model page or playground, but do not run a paid test yet.

The first AWS preflight we will run is read-only: identity plus `ListFoundationModels`. It does not invoke a model or create a resource.

## AWS CLI later

Do not add `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY` to Windows while signed in as root. We will configure a non-root profile named `kira-hackathons` after root MFA and budget setup are complete.

Safe non-secret Windows variables for later:

- `AWS_PROFILE` = `kira-hackathons`
- `AWS_REGION` = `us-east-1`
`KIRA_MEMORY_STEWARD_BEDROCK_MODEL` = `amazon.nova-micro-v1:0` (non-secret)

# 3. CockroachDB Cloud — finish the cluster carefully

Your screenshot is on the correct **Create Cluster** page. The current selected provider is Google Cloud. For the CockroachDB × AWS hackathon, switch it to AWS.

1. Under **Cloud provider**, click the **AWS** tile.
2. Under **Region**, choose **N. Virginia (us-east-1)** if it is available. Otherwise choose the nearest US East AWS region.
3. Do not click **Add region**; use one region for this small development cluster.
4. Click **Next: Capacity**.
5. Set the smallest development limits offered. Do not increase storage or request-unit limits beyond the free/trial level.
6. Click **Next: Finalize**.
7. Cluster name: `kira-memory-ledger`
8. Confirm the displayed maximum cost is within the free/trial allowance before creating it.
9. Click **Create cluster**.

After the cluster appears:

1. Open the cluster.
2. Open **Networking** → **IP Allowlist**.
3. If `0.0.0.0/0` is listed, remove it after adding your current network.
4. Click **Add Network**.
5. Network name: `Robert-Home-PC`
6. Choose **Current Network**.
7. Allow the CockroachDB client connection and apply the change.
8. Open **SQL Users** and create a user named `kira_ledger_app` if the create/connect wizard has not already done so.
9. Use a unique generated password and save it privately.
10. Click **Connect** in the upper-right corner of the cluster page.
11. Select the new SQL user.
12. Copy the **General connection string** beginning with `postgresql://`.
13. In Windows **User variables for robmc**, click **New...**.
14. Variable name: `DATABASE_URL`
15. Variable value: paste the full connection string.
16. Click **OK** and close the dialogs.
17. Never show the connection string in a screenshot; it contains the database password.

# 4. CALL-E — account and key only, no real call yet

1. On the Devpost CALL-E Resources page, click **CALL-E Integrations (GitHub)** or **heycall-e.com — product overview**.
2. Create a CALL-E account and verify your email.
3. Open the CALL-E dashboard.
4. Open **Account** → **API Keys**.
5. Create a key named `Kira AccessLine Dev`.
6. Copy the key once.
7. In Windows **User variables for robmc**, click **New...**.
8. Variable name: `CALLE_API_KEY`
9. Variable value: paste the key.
10. Click **OK** and close the dialogs.

Do not run a real phone call yet. The first live call will require a reviewed public business number, a fresh exact call plan, and a second explicit execution approval.

# 5. Check what Windows can see

Close and reopen the test bundle, then double-click:

`Start_Kira_Labs_Provider_Setup_Assistant.bat`

Click **Refresh setup status**. It reports only `true` or `false`; it never shows a secret.

From Command Prompt in `Hackathons\2026`, local-only status is:

```bat
py -3 cloud_preflight.py
```

After AWS credentials are configured, the safe AWS read-only test is:

```bat
py -3 cloud_preflight.py --aws-read-only
```

After CockroachDB is configured, the safe database read-only test is:

```bat
py -3 cloud_preflight.py --cockroach-read-only
```

After CALL-E is configured, the local-only package/key check is:

```bat
py -3 cloud_preflight.py --call-e-local
```

The Google test performs one very small model request and should be run only after you knowingly approve it:

```bat
py -3 cloud_preflight.py --google-live
```
