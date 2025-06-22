# 🚀 Deploy to Vercel - Step by Step Guide

## Prerequisites
- GitHub account
- Vercel account (free)
- MongoDB Atlas account (free tier available)
- Clerk account (free tier available)

## 📋 Step 1: Prepare Your Environment Variables

You'll need these environment variables in Vercel:

### Required Variables:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
MONGODB_URI=mongodb+srv://...
```

### Optional Variables:
```env
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up  
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## 🔧 Step 2: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist all IP addresses (0.0.0.0/0) for Vercel
5. Get your connection string

## 🔑 Step 3: Setup Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Copy your publishable key and secret key
4. In Clerk settings, add your Vercel domain to allowed origins

## 📤 Step 4: Deploy to Vercel

### Option A: Using Vercel Dashboard
1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Add all environment variables
6. Click "Deploy"

### Option B: Using Vercel CLI
```bash
npm i -g vercel
vercel
# Follow the prompts
```

## 🌐 Step 5: Configure Domain (Optional)

1. In Vercel dashboard, go to your project
2. Go to "Domains" tab
3. Add your custom domain
4. Update DNS records as instructed

## ✅ Step 6: Verify Deployment

After deployment, test these features:
- ✅ User authentication (sign up/sign in)
- ✅ Creating todo lists
- ✅ Adding todos to lists
- ✅ Sharing lists with other users
- ✅ Shared list access

## 🔄 Real-time Features Note

On Vercel, the real-time collaboration will automatically fallback to:
- Manual refresh to see updates from collaborators
- All sharing functionality works perfectly
- Individual user operations are instant

## 🐛 Troubleshooting

### Common Issues:

1. **Authentication not working:**
   - Check Clerk environment variables
   - Verify allowed origins in Clerk dashboard

2. **Database connection failed:**
   - Verify MongoDB connection string
   - Check IP whitelist in MongoDB Atlas

3. **Build errors:**
   - Run `npm run build` locally first
   - Check TypeScript errors

4. **Environment variables:**
   - Make sure all required variables are set
   - Check variable names (case sensitive)

## 📱 Mobile Responsiveness

The app is fully responsive and works great on:
- Desktop browsers
- Mobile devices
- Tablets

## 🔒 Security Features

- ✅ Server-side authentication
- ✅ Protected API routes
- ✅ Input validation
- ✅ Access control for shared lists

Your todo app with sharing functionality is now ready for production on Vercel! 🎉
