# Deployment Guide - Vercel

This guide will help you deploy your Rental Booking Manager to Vercel.

## Prerequisites

- Completed the [SETUP.md](./SETUP.md) guide
- Google Sheets API configured
- `.env.local` file with credentials working locally

## Option 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Push Code to GitHub

1. Initialize git repository (if not already done):
```bash
git init
git add .
git commit -m "Initial commit - Rental Booking Manager"
```

2. Create a new repository on GitHub

3. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### Step 2: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Click "Import"

### Step 3: Configure Environment Variables

1. In the "Configure Project" section, expand "Environment Variables"
2. Add the following variables:

**Variable 1:**
- **Name**: `GOOGLE_CREDENTIALS`
- **Value**: Your entire service account JSON (from `.env.local`)
  - Copy the JSON content without the outer quotes
  - Example: `{"type":"service_account","project_id":"...",...}`

**Variable 2:**
- **Name**: `GOOGLE_SHEET_ID`
- **Value**: Your Google Sheet ID (from `.env.local`)

3. Click "Deploy"

### Step 4: Wait for Deployment

Vercel will build and deploy your application. This usually takes 2-3 minutes.

### Step 5: Access Your Application

Once deployed, Vercel will provide you with a URL like:
```
https://your-project-name.vercel.app
```

Visit this URL to access your application!

## Option 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? (Select your account)
- Link to existing project? **N**
- What's your project's name? (Enter a name)
- In which directory is your code located? **./​**
- Want to override the settings? **N**

### Step 4: Add Environment Variables

```bash
vercel env add GOOGLE_CREDENTIALS
```
Paste your service account JSON when prompted.

```bash
vercel env add GOOGLE_SHEET_ID
```
Paste your Google Sheet ID when prompted.

### Step 5: Redeploy with Environment Variables

```bash
vercel --prod
```

## Post-Deployment

### Verify Deployment

1. Visit your Vercel URL
2. Try adding a test booking
3. Check your Google Sheet to confirm the data was added

### Custom Domain (Optional)

1. Go to your project on Vercel
2. Settings → Domains
3. Add your custom domain
4. Follow Vercel's instructions to configure DNS

## Automatic Deployments

Once connected to GitHub, Vercel will automatically deploy:
- **Production**: When you push to `main` branch
- **Preview**: When you push to other branches or create a pull request

## Updating Environment Variables

If you need to update environment variables:

1. Go to your project on Vercel
2. Settings → Environment Variables
3. Edit the variable
4. Redeploy your project:
   - Deployments → Click "..." → Redeploy

## Troubleshooting

### Build Fails

**Error**: Missing environment variables
- **Solution**: Make sure both `GOOGLE_CREDENTIALS` and `GOOGLE_SHEET_ID` are set in Vercel

**Error**: Build timeout
- **Solution**: This is rare, but try redeploying

### Runtime Errors

**Error**: "GOOGLE_CREDENTIALS environment variable is not set"
- **Solution**: Environment variables are not set correctly in Vercel
- Go to Settings → Environment Variables and verify

**Error**: "The caller does not have permission"
- **Solution**: Make sure your Google Sheet is shared with the service account email
- Check the `client_email` in your service account JSON
- Share the sheet with that email as an Editor

### Data Not Syncing

1. Check Vercel logs:
   - Go to your project → Deployments
   - Click on the latest deployment
   - View Function Logs

2. Common issues:
   - Service account doesn't have access to the sheet
   - Wrong Sheet ID
   - Malformed JSON credentials

## Monitoring

### View Logs

1. Go to your project on Vercel
2. Click "Deployments"
3. Click on a deployment
4. View "Build Logs" or "Function Logs"

### Analytics (Optional)

Vercel provides analytics:
1. Go to your project
2. Click "Analytics"
3. Enable Vercel Analytics (free tier available)

## Environment Variables Best Practices

- **Never commit `.env.local`** to Git
- Use Vercel's environment variable system
- Different values can be set for:
  - Production
  - Preview
  - Development

## Rolling Back

If something goes wrong:

1. Go to Deployments
2. Find a working deployment
3. Click "..." → "Promote to Production"

## Cost

- **Hobby Plan**: Free forever
  - Perfect for personal projects
  - 100GB bandwidth/month
  - Serverless functions

- **Pro Plan**: $20/month
  - Higher limits
  - Better performance
  - Team collaboration

For a rental booking manager, the free Hobby plan is sufficient!

## Security Recommendations

1. **Restrict Vercel Access**: Only give team members who need it access
2. **Rotate Credentials**: Periodically rotate your service account keys
3. **Monitor Usage**: Check Vercel analytics regularly
4. **Enable HTTPS**: Vercel automatically provides HTTPS for all deployments

## Next Steps

- Set up a custom domain
- Add more features to your application
- Set up monitoring and alerts
- Consider adding authentication for multi-user access

## Support

- Vercel Documentation: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Project Issues: Check [SETUP.md](./SETUP.md#troubleshooting)
