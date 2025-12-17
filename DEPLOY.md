# Deployment Guide for Vercel

This project is packaged for easy deployment on **Vercel** with a Python Flask backend and React frontend.

## Prerequisites

1.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
2.  **GitHub Repository**: Ensure this project is pushed to a GitHub repository.
3.  **Supabase Project**: You have your Supabase URL and Key ready.

## Deployment Steps

1.  **Push to GitHub**:
    ```bash
    git add .
    git commit -m "Prepare for Vercel deployment"
    git push origin main
    ```

2.  **Import to Vercel**:
    - Go to your Vercel Dashboard.
    - Click **"Add New..."** -> **"Project"**.
    - Import your GitHub repository.

3.  **Configure Project**:
    - **Framework Preset**: Vercel should auto-detect "Vite" for the frontend. If not, select **Vite**.
    - **Root Directory**: Keep it as `./` (Root).

4.  **Environment Variables**:
    Add the following variables in the "Environment Variables" section:
    - `SUPABASE_URL`: Your Supabase URL (e.g., `https://nqhevfseowjpdtzibgew.supabase.co`)
    - `SUPABASE_KEY`: Your Supabase Service Role Key or Anon Key (the one starting with `eyJ...`).
      > **Important**: Ensure you use a key that has permissions to write to `restock_logs` and `pipeline_status`.

5.  **Deploy**:
    - Click **"Deploy"**.
    - Vercel will build your frontend and set up the serverless backend.

## Post-Deployment Check

1.  Open your deployment URL (e.g., `https://projectwork.vercel.app`).
2.  The dashboard should load.
3.  Check the "Pipeline Status" indicator. It should be "Active" (fetching from Supabase of default).
4.  Try to "Restock" an item to verify database writes work.

## Troubleshooting

- **500 Errors on API calls**: Check Vercel **Logs** tab. It usually means a missing environment variable or a Python syntax error.
- **"Failed to load data"**: Ensure `SUPABASE_URL` and `SUPABASE_KEY` are correct.
